import { readFileSync } from 'fs';
import { pool } from '../src/db.js';

const CHARITIES_CSV = '/Users/nickfries/Documents/GoodLocal/Database Updates/Charities DB - Charities (1).csv';
const LOCATIONS_CSV = '/Users/nickfries/Documents/GoodLocal/Database Updates/Charities DB - Charity Locations (1).csv';

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  let i = 1;
  while (i < lines.length) {
    // Handle multi-line quoted fields
    let line = lines[i];
    while (countQuotes(line) % 2 !== 0 && i + 1 < lines.length) {
      i++;
      line += '\n' + lines[i];
    }
    i++;

    if (line.trim() === '') continue;

    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }

  return rows;
}

function countQuotes(s: string): number {
  return (s.match(/"/g) || []).length;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseEIN(ein: string): string {
  // Remove dashes: "84-6038762" -> "846038762"
  return ein.replace(/-/g, '');
}

function parseTags(tags: string): string[] {
  return tags.split(',').map(t => t.trim()).filter(Boolean);
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Delete all existing charities (CASCADE deletes locations and donation_intents)
    console.log('Deleting existing charities...');
    await client.query('DELETE FROM charities');

    // 2. Read and import charities
    const charitiesCSV = readFileSync(CHARITIES_CSV, 'utf-8');
    const charities = parseCSV(charitiesCSV);

    console.log(`Importing ${charities.length} charities...`);

    for (const row of charities) {
      const isActive = row['Live?']?.toLowerCase() === 'yes';
      const everyOrgClaimed = row['Every.org claimed profile?']?.toLowerCase() === 'yes';
      const foundedYear = row['Year Founded'] ? parseInt(row['Year Founded'], 10) : null;

      await client.query(
        `INSERT INTO charities (name, ein, slug, every_org_slug, every_org_claimed, website_url, cause_tags, description, founded_year, primary_address, volunteer_url, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          row['Name'],
          parseEIN(row['EIN']),
          row['Slug'],
          row['Every.org Slug'],
          everyOrgClaimed,
          row['Website'],
          parseTags(row['Tags']),
          row['Description (mission)'],
          foundedYear,
          row['Primary Address'],
          row['Volunteer link'] || null,
          isActive,
        ]
      );
      console.log(`  + ${row['Name']}`);
    }

    // 3. Read and import locations
    const locationsCSV = readFileSync(LOCATIONS_CSV, 'utf-8');
    const locations = parseCSV(locationsCSV);

    console.log(`\nImporting ${locations.length} locations...`);

    for (const row of locations) {
      const slug = row['Slug'];
      const result = await client.query('SELECT id FROM charities WHERE slug = $1', [slug]);

      if (result.rows.length === 0) {
        console.warn(`  ! Skipping location — no charity found for slug: ${slug}`);
        continue;
      }

      const charityId = result.rows[0].id;

      await client.query(
        `INSERT INTO charity_locations (charity_id, label, description, address)
         VALUES ($1, $2, $3, $4)`,
        [
          charityId,
          row['Location Name'],
          row['Location Description'] || null,
          row['Location Address'],
        ]
      );
      console.log(`  + ${row['Location Name']} (${slug})`);
    }

    await client.query('COMMIT');
    console.log('\nImport complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import failed, rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
