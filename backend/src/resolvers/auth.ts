import { pool } from '../db.js';
import { signToken, generateMagicToken, getMagicLinkExpiry, Context } from '../auth.js';
import { sendMagicLink } from '../services/email.js';
import { GraphQLError } from 'graphql';

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      if (!context.user) return null;

      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [context.user.userId]
      );

      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        createdAt: row.created_at?.toISOString(),
      };
    },
  },

  Mutation: {
    requestMagicLink: async (_: unknown, { email }: { email: string }) => {
      const normalizedEmail = email.toLowerCase().trim();

      // Generate token and expiry
      const token = generateMagicToken();
      const expiresAt = getMagicLinkExpiry();

      // Store in DB
      await pool.query(
        `INSERT INTO magic_link_tokens (email, token, expires_at)
         VALUES ($1, $2, $3)`,
        [normalizedEmail, token, expiresAt]
      );

      // Send email
      await sendMagicLink(normalizedEmail, token);

      return true;
    },

    verifyMagicLink: async (_: unknown, { token }: { token: string }) => {
      // Find valid, unused token
      const tokenResult = await pool.query(
        `SELECT * FROM magic_link_tokens
         WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        throw new GraphQLError('Invalid or expired magic link', {
          extensions: { code: 'INVALID_TOKEN' },
        });
      }

      const tokenRow = tokenResult.rows[0];
      const email = tokenRow.email;

      // Mark token as used
      await pool.query(
        'UPDATE magic_link_tokens SET used = TRUE WHERE id = $1',
        [tokenRow.id]
      );

      // Find or create user
      let userResult = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      let user;
      if (userResult.rows.length === 0) {
        // Create new user (name defaults to email prefix)
        const name = email.split('@')[0];
        const insertResult = await pool.query(
          `INSERT INTO users (name, email, email_verified)
           VALUES ($1, $2, TRUE) RETURNING *`,
          [name, email]
        );
        user = insertResult.rows[0];
      } else {
        user = userResult.rows[0];
        // Update last_login and email_verified
        await pool.query(
          `UPDATE users SET last_login = NOW(), email_verified = TRUE WHERE id = $1`,
          [user.id]
        );
      }

      // Generate JWT
      const jwt = signToken({ userId: user.id, email: user.email });

      return {
        token: jwt,
        user: {
          ...user,
          createdAt: user.created_at?.toISOString(),
        },
      };
    },
  },
};
