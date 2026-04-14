import { pool } from '../db.js';
import { signToken, generateMagicToken, Context } from '../auth.js';
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
        isAdmin: row.is_admin ?? false,
        shareToken: row.share_token,
        createdAt: row.created_at?.toISOString(),
      };
    },
  },

  Mutation: {
    requestMagicLink: async (_: unknown, { email }: { email: string }) => {
      const normalizedEmail = email.toLowerCase().trim();

      // Generate token
      const token = generateMagicToken();

      // Store in DB — use DB clock for expires_at to avoid JS timezone mismatch
      await pool.query(
        `INSERT INTO magic_link_tokens (email, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
        [normalizedEmail, token]
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
      let isNewUser = false;
      if (userResult.rows.length === 0) {
        isNewUser = true;
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

      // Retroactively associate any donations made before this user verified
      await pool.query(
        'UPDATE donation_intents SET user_id = $1 WHERE donor_email = $2 AND user_id IS NULL',
        [user.id, email]
      );

      // Track sign-in analytics
      await pool.query(
        `INSERT INTO analytics_events (event_name, event_data) VALUES ($1, $2)`,
        ['sign_in_complete', JSON.stringify({ userId: user.id })]
      );
      if (isNewUser) {
        await pool.query(
          `INSERT INTO analytics_events (event_name, event_data) VALUES ($1, $2)`,
          ['account_created', JSON.stringify({ userId: user.id })]
        );
      }

      // Generate JWT
      const jwt = signToken({ userId: user.id, email: user.email, isAdmin: user.is_admin ?? false });

      // Check if onboarding has been completed
      const prefsResult = await pool.query(
        'SELECT onboarding_completed FROM user_preferences WHERE user_id = $1',
        [user.id]
      );
      const onboardingCompleted = prefsResult.rows[0]?.onboarding_completed ?? false;

      return {
        token: jwt,
        onboardingCompleted,
        user: {
          ...user,
          isAdmin: user.is_admin ?? false,
          shareToken: user.share_token,
          createdAt: user.created_at?.toISOString(),
        },
      };
    },
  },
};
