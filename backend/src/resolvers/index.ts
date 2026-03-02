import { pool } from '../db.js';
import { Context } from '../auth.js';
import { GraphQLError } from 'graphql';
import { charityResolvers } from './charities.js';
import { authResolvers } from './auth.js';
import { preferencesResolvers } from './preferences.js';
import { zipResolvers } from './zip.js';

function requireAdmin(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  if (!context.user.isAdmin) {
    throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
  }
}

const userResolvers = {
  Query: {
    users: async (_: unknown, __: unknown, context: Context) => {
      requireAdmin(context);
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows.map(row => ({
        ...row,
        isAdmin: row.is_admin ?? false,
        createdAt: row.created_at?.toISOString(),
      }));
    },
    user: async (_: unknown, { id }: { id: string }, context: Context) => {
      requireAdmin(context);
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return { ...row, isAdmin: row.is_admin ?? false, createdAt: row.created_at?.toISOString() };
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

// Merge all resolvers
export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...charityResolvers.Query,
    ...authResolvers.Query,
    ...preferencesResolvers.Query,
    ...zipResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...authResolvers.Mutation,
    ...preferencesResolvers.Mutation,
    ...charityResolvers.Mutation,
  },
  Charity: charityResolvers.Charity,
};
