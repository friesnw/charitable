import { pool } from '../db.js';

// Helper to convert snake_case DB rows to camelCase GraphQL fields
function toCharity(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    causeTags: row.cause_tags || [],
    everyOrgSlug: row.every_org_slug,
    ein: row.ein,
    createdAt: (row.created_at as Date)?.toISOString(),
    updatedAt: (row.updated_at as Date)?.toISOString(),
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

    charity: async (_: unknown, { id }: { id: string }) => {
      const result = await pool.query('SELECT * FROM charities WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      return toCharity(result.rows[0]);
    },
  },
};
