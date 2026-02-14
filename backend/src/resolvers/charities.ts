import { pool } from '../db.js';

// Helper to convert snake_case DB rows to camelCase GraphQL fields
function toCharity(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    volunteerUrl: row.volunteer_url,
    primaryAddress: row.primary_address,
    causeTags: row.cause_tags || [],
    everyOrgSlug: row.every_org_slug,
    ein: row.ein,
    foundedYear: row.founded_year,
    everyOrgClaimed: row.every_org_claimed ?? false,
    isActive: row.is_active ?? true,
    createdAt: (row.created_at as Date)?.toISOString(),
    updatedAt: (row.updated_at as Date)?.toISOString(),
  };
}

function toLocation(row: Record<string, unknown>) {
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    address: row.address,
  };
}

export const charityResolvers = {
  Query: {
    charities: async (
      _: unknown,
      { tags, search }: { tags?: string[]; search?: string }
    ) => {
      let query = 'SELECT * FROM charities WHERE 1=1';
      const params: unknown[] = [];

      // Filter by tags (using array overlap operator &&)
      if (tags && tags.length > 0) {
        params.push(tags);
        query += ` AND cause_tags && $${params.length}`;
      }

      // Search by name (case-insensitive)
      if (search) {
        params.push(`%${search}%`);
        query += ` AND name ILIKE $${params.length}`;
      }

      query += ' ORDER BY name ASC';

      const result = await pool.query(query, params);
      return result.rows.map(toCharity);
    },

    charity: async (_: unknown, { id, slug }: { id?: string; slug?: string }) => {
      if (!id && !slug) return null;

      const field = slug ? 'slug' : 'id';
      const value = slug || id;
      const result = await pool.query(`SELECT * FROM charities WHERE ${field} = $1`, [value]);
      if (result.rows.length === 0) return null;
      return toCharity(result.rows[0]);
    },
  },

  Charity: {
    locations: async (parent: { id: number }) => {
      const result = await pool.query(
        'SELECT * FROM charity_locations WHERE charity_id = $1 ORDER BY id ASC',
        [parent.id]
      );
      return result.rows.map(toLocation);
    },
  },
};
