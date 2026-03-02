import { pool } from '../db.js';

export const zipResolvers = {
  Query: {
    resolveZip: async (_: unknown, { zip }: { zip: string }) => {
      const result = await pool.query(
        'SELECT * FROM zip_codes WHERE zip = $1',
        [zip]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        zip,
        city: row.city,
        state: row.state,
        latitude: row.latitude,
        longitude: row.longitude,
        neighborhood: row.neighborhood ?? null,
        zoom: row.zoom ?? 13,
      };
    },
  },
};
