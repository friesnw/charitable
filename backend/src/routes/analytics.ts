import { Router } from 'express';
import { pool } from '../db.js';
import { verifyToken } from '../auth.js';

const router = Router();

function parseDeviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
  const s = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))|kindle|playbook|silk/.test(s)) return 'tablet';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(s)) return 'mobile';
  return 'desktop';
}

router.post('/events', async (req, res) => {
  try {
    const { event_name, event_data, page_url, referrer, user_agent: bodyUserAgent, session_id, visitor_id } = req.body;
    const user_agent = bodyUserAgent ?? req.headers['user-agent'] ?? null;

    if (!event_name || typeof event_name !== 'string') {
      res.status(400).json({ error: 'event_name required' });
      return;
    }

    // Extract user_id from JWT if present (used to filter out known users from analytics)
    let userId: number | null = null;
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.slice(7));
      if (payload) userId = payload.userId;
    }

    const device_type = user_agent ? parseDeviceType(user_agent) : null;

    await pool.query(
      `INSERT INTO analytics_events (event_name, event_data, page_url, referrer, user_agent, session_id, user_id, visitor_id, device_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        event_name,
        event_data ?? null,
        page_url ?? null,
        referrer ?? null,
        user_agent,
        session_id ?? null,
        userId,
        visitor_id ?? null,
        device_type,
      ],
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Analytics event error:', err);
    res.status(500).json({ error: 'internal error' });
  }
});

export default router;
