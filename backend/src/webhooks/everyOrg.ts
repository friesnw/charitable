import { Request, Response } from 'express';
import { pool } from '../db.js';
import { env } from '../env.js';
import { generateMagicToken, getMagicLinkExpiry } from '../auth.js';
import { sendDonationConfirmation } from '../services/email.js';

// Every.org webhook payload shape (https://docs.every.org/docs/webhooks)
interface EveryOrgPayload {
  chargeId: string;
  webhookToken?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  toNonprofit: {
    name: string;
    slug: string;
    ein?: string;
  };
  amount: string | number;
  currency?: string;
  frequency: 'one-time' | 'monthly';
  donationDate: string;
  partnerMetadata?: string; // base64-encoded JSON set via the embed widget
}

export async function handleEveryOrgWebhook(req: Request, res: Response) {
  const payload = req.body as EveryOrgPayload;

  // Verify auth token from Authorization header (Every.org sends this to prove the request is from them)
  if (env.EVERY_ORG_AUTH_TOKEN) {
    const authHeader = req.headers.authorization;
    if (authHeader !== env.EVERY_ORG_AUTH_TOKEN) {
      console.warn('[every-org webhook] Invalid auth token');
      return res.status(401).json({ error: 'Invalid auth token' });
    }
  }

  // Verify webhook token if we have one configured
  if (env.EVERY_ORG_WEBHOOK_TOKEN) {
    const receivedToken = payload.webhookToken ?? req.query.webhookToken;
    if (receivedToken !== env.EVERY_ORG_WEBHOOK_TOKEN) {
      console.warn('[every-org webhook] Invalid webhook token');
      return res.status(401).json({ error: 'Invalid webhook token' });
    }
  }

  const { chargeId, toNonprofit, amount, frequency, donationDate, email, partnerMetadata } = payload;

  // Decode partnerMetadata if present — used to associate the donation without an email lookup
  let metadataUserId: number | null = null;
  if (partnerMetadata) {
    try {
      const decoded = JSON.parse(Buffer.from(partnerMetadata, 'base64').toString('utf8'));
      if (typeof decoded.userId === 'number') metadataUserId = decoded.userId;
    } catch {
      console.warn('[every-org webhook] Failed to decode partnerMetadata');
    }
  }

  if (!chargeId || !toNonprofit?.slug || !amount || !frequency || !donationDate) {
    console.warn('[every-org webhook] Missing required fields', payload);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Look up charity by every_org_slug
  const charityResult = await pool.query(
    'SELECT id, name FROM charities WHERE every_org_slug = $1',
    [toNonprofit.slug]
  );

  if (charityResult.rows.length === 0) {
    // We don't have this charity in our system — log and acknowledge
    console.warn(`[every-org webhook] Unknown nonprofit slug: ${toNonprofit.slug}`);
    return res.status(200).json({ received: true, skipped: true });
  }

  const { id: charityId, name: charityName } = charityResult.rows[0];
  const amountDecimal = typeof amount === 'string' ? parseFloat(amount) : amount;
  const donorEmail = email?.toLowerCase().trim() ?? null;

  try {
    const insertResult = await pool.query(
      `INSERT INTO donation_intents (charity_id, charge_id, amount, frequency, donation_date, donor_email)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (charge_id) DO NOTHING
       RETURNING id`,
      [charityId, chargeId, amountDecimal, frequency, new Date(donationDate), donorEmail]
    );

    // ON CONFLICT DO NOTHING returns 0 rows — already processed, skip email
    if (insertResult.rows.length === 0) {
      console.log(`[every-org webhook] Duplicate charge ${chargeId}, skipping`);
      return res.status(200).json({ received: true });
    }

    const donationId = insertResult.rows[0].id;
    console.log(`[every-org webhook] Recorded donation ${chargeId} → charity ${charityId} (id: ${donationId})`);

    // Associate and notify donor
    if (metadataUserId != null) {
      // Fast path: userId came directly from the embed widget partnerMetadata
      await pool.query(
        'UPDATE donation_intents SET user_id = $1 WHERE id = $2',
        [metadataUserId, donationId]
      );
      if (donorEmail) await sendDonationConfirmation(donorEmail, charityName);
      console.log(`[every-org webhook] Associated donation ${donationId} to user ${metadataUserId} via partnerMetadata`);
    } else if (donorEmail) {
      const verifiedUserResult = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND email_verified = TRUE',
        [donorEmail]
      );

      if (verifiedUserResult.rows.length > 0) {
        // Known verified user — associate and send simple receipt
        const userId = verifiedUserResult.rows[0].id;
        await pool.query(
          'UPDATE donation_intents SET user_id = $1 WHERE id = $2',
          [userId, donationId]
        );
        await sendDonationConfirmation(donorEmail, charityName);
        console.log(`[every-org webhook] Associated donation ${donationId} to user ${userId}`);
      } else {
        // Unknown or unverified user — send magic link so they can claim their history
        const token = generateMagicToken();
        const expiresAt = getMagicLinkExpiry();
        await pool.query(
          `INSERT INTO magic_link_tokens (email, token, expires_at)
           VALUES ($1, $2, $3)`,
          [donorEmail, token, expiresAt]
        );
        await sendDonationConfirmation(donorEmail, charityName, token);
        console.log(`[every-org webhook] Sent post-donation magic link to ${donorEmail}`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[every-org webhook] DB error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
