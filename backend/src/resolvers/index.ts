import { pool } from '../db.js';

export const resolvers = {
  Query: {
    users: async () => {
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows.map(row => ({
        ...row,
        createdAt: row.created_at?.toISOString(),
      }));
    },
    user: async (_: unknown, { id }: { id: string }) => {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return { ...row, createdAt: row.created_at?.toISOString() };
    },
  },
  Mutation: {
    createUser: async (_: unknown, { name, email }: { name: string; email: string }) => {
      const result = await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );
      const row = result.rows[0];
      return { ...row, createdAt: row.created_at?.toISOString() };
    },
    deleteUser: async (_: unknown, { id }: { id: string }) => {
      const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    },
  },
};
