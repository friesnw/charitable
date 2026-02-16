import { pool } from '../db.js';
import { Context } from '../auth.js';
import { GraphQLError } from 'graphql';

function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
}

function toPreferences(row: Record<string, unknown>) {
  return {
    location: row.location,
    onboardingCompleted: row.onboarding_completed ?? false,
  };
}

export const preferencesResolvers = {
  Query: {
    myPreferences: async (_: unknown, __: unknown, context: Context) => {
      const user = requireAuth(context);
      const result = await pool.query(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [user.userId]
      );
      if (result.rows.length === 0) return null;
      return toPreferences(result.rows[0]);
    },
  },

  Mutation: {
    savePreferences: async (
      _: unknown,
      { location }: { location: string },
      context: Context
    ) => {
      const user = requireAuth(context);
      const result = await pool.query(
        `INSERT INTO user_preferences (user_id, location, onboarding_completed)
         VALUES ($1, $2, TRUE)
         ON CONFLICT (user_id)
         DO UPDATE SET location = $2, onboarding_completed = TRUE, updated_at = NOW()
         RETURNING *`,
        [user.userId, location]
      );
      return toPreferences(result.rows[0]);
    },
  },
};
