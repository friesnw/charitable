import { pool } from '../db.js';
import { Context } from '../auth.js';
import { GraphQLError } from 'graphql';
import { toCharity } from './charities.js';

function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
}

export const favoritesResolvers = {
  Query: {
    myFavorites: async (_: unknown, __: unknown, context: Context) => {
      requireAuth(context);
      const result = await pool.query(
        `SELECT c.* FROM charities c
         JOIN user_favorites uf ON c.id = uf.charity_id
         WHERE uf.user_id = $1
         ORDER BY uf.created_at DESC`,
        [context.user!.userId]
      );
      return result.rows.map(toCharity);
    },
    userFavorites: async (_: unknown, { shareToken }: { shareToken: string }) => {
      const [charitiesResult, userResult] = await Promise.all([
        pool.query(
          `SELECT c.* FROM charities c
           JOIN user_favorites uf ON c.id = uf.charity_id
           JOIN users u ON uf.user_id = u.id
           WHERE u.share_token = $1
           ORDER BY uf.created_at DESC`,
          [shareToken]
        ),
        pool.query('SELECT name FROM users WHERE share_token = $1', [shareToken]),
      ]);
      const userName = userResult.rows[0]?.name ?? 'Someone';
      return { userName, charities: charitiesResult.rows.map(toCharity) };
    },
  },
  Mutation: {
    toggleFavorite: async (_: unknown, { charityId }: { charityId: string }, context: Context) => {
      requireAuth(context);
      const insert = await pool.query(
        `INSERT INTO user_favorites (user_id, charity_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [context.user!.userId, charityId]
      );
      if ((insert.rowCount ?? 0) === 0) {
        // Row already existed → unfavorite
        await pool.query(
          'DELETE FROM user_favorites WHERE user_id = $1 AND charity_id = $2',
          [context.user!.userId, charityId]
        );
        return { charityId, favorited: false };
      }
      return { charityId, favorited: true };
    },
  },
};
