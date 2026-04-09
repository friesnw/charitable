import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.post('/events', async (req, res) => {
  try {
    const { event_name, event_data, page_url, referrer, user_agent, session_id } = req.body;

    if (!event_name || typeof event_name !== 'string') {
      res.status(400).json({ error: 'event_name required' });
      return;
    }

    await pool.query(
      `INSERT INTO analytics_events (event_name, event_data, page_url, referrer, user_agent, session_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        event_name,
        event_data ?? null,
        page_url ?? null,
        referrer ?? null,
        user_agent ?? req.headers['user-agent'] ?? null,
        session_id ?? null,
      ],
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Analytics event error:', err);
    res.status(500).json({ error: 'internal error' });
  }
});

export default router;
