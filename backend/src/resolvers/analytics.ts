import { pool } from '../db.js';
import { Context } from '../auth.js';
import { GraphQLError } from 'graphql';

function requireAdmin(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  if (!context.user.isAdmin) {
    throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
  }
}

export const analyticsResolvers = {
  Query: {
    analyticsOverview: async (_: unknown, __: unknown, context: Context) => {
      requireAdmin(context);

      const [eventCounts, dailyPageViews, topCharities, topCauseTags, topNeighborhoods] =
        await Promise.all([
          pool.query(`
            SELECT event_name, COUNT(*)::int AS count
            FROM analytics_events
            WHERE created_at > now() - interval '30 days'
            GROUP BY event_name
            ORDER BY count DESC
          `),
          pool.query(`
            SELECT DATE(created_at AT TIME ZONE 'America/Denver') AS date,
                   COUNT(*)::int AS count
            FROM analytics_events
            WHERE event_name = 'page_view'
              AND created_at > now() - interval '14 days'
            GROUP BY DATE(created_at AT TIME ZONE 'America/Denver')
            ORDER BY date
          `),
          pool.query(`
            SELECT event_data->>'charityName' AS label, COUNT(*)::int AS count
            FROM analytics_events
            WHERE event_name = 'charity_view'
              AND created_at > now() - interval '30 days'
              AND event_data->>'charityName' IS NOT NULL
            GROUP BY label
            ORDER BY count DESC
            LIMIT 10
          `),
          pool.query(`
            SELECT event_data->>'tag' AS label, COUNT(*)::int AS count
            FROM analytics_events
            WHERE event_name IN ('filter_tag', 'onboarding_cause_select')
              AND created_at > now() - interval '30 days'
              AND event_data->>'tag' IS NOT NULL
            GROUP BY label
            ORDER BY count DESC
            LIMIT 10
          `),
          pool.query(`
            SELECT event_data->>'neighborhood' AS label, COUNT(*)::int AS count
            FROM analytics_events
            WHERE event_name = 'neighborhood_select'
              AND created_at > now() - interval '30 days'
              AND event_data->>'neighborhood' IS NOT NULL
            GROUP BY label
            ORDER BY count DESC
            LIMIT 10
          `),
        ]);

      const totalEvents = eventCounts.rows.reduce((sum: number, r: { count: number }) => sum + r.count, 0);

      return {
        totalEvents,
        eventCounts: eventCounts.rows.map((r: { event_name: string; count: number }) => ({
          eventName: r.event_name,
          count: r.count,
        })),
        dailyPageViews: dailyPageViews.rows.map((r: { date: Date; count: number }) => ({
          date: r.date.toISOString().slice(0, 10),
          count: r.count,
        })),
        topCharities: topCharities.rows,
        topCauseTags: topCauseTags.rows,
        topNeighborhoods: topNeighborhoods.rows,
      };
    },
  },
};
