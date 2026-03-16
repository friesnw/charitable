import { pool } from '../db.js';
import { Context } from '../auth.js';
import { GraphQLError } from 'graphql';

function toCharity(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logo_url,
    coverPhotoUrl: row.cover_photo_url ?? null,
    contentPhotoUrl1: row.content_photo_url_1 ?? null,
    contentPhotoUrl2: row.content_photo_url_2 ?? null,
    websiteUrl: row.website_url,
    volunteerUrl: row.volunteer_url,
    primaryAddress: row.primary_address,
    causeTags: row.cause_tags || [],
    donateUrl: row.donate_url,
    ein: row.ein,
    foundedYear: row.founded_year,
    impact: row.impact ?? null,
    locationDescription: row.location_description ?? null,
    programHighlights: row.program_highlights ?? null,
    usageCredit: row.usage_credit ?? null,
    ctaLabel: row.cta_label ?? null,
    ctaUrl: row.cta_url ?? null,
    everyOrgClaimed: row.every_org_claimed ?? false,
    isActive: row.is_active ?? true,
    isReviewed: row.is_reviewed ?? false,
    createdAt: (row.created_at as Date)?.toISOString(),
    updatedAt: (row.updated_at as Date)?.toISOString(),
  };
}

function toLocation(row: Record<string, unknown>) {
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    address: row.address,
    latitude: row.latitude != null ? parseFloat(row.latitude as string) : null,
    longitude: row.longitude != null ? parseFloat(row.longitude as string) : null,
    photoUrl: row.photo_url ?? null,
    isReviewed: row.is_reviewed ?? false,
    isSublocation: row.is_sublocation ?? false,
  };
}

function requireAdmin(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  if (!context.user.isAdmin) {
    throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
  }
}

export const charityResolvers = {
  Query: {
    charities: async (
      _: unknown,
      { tags, search }: { tags?: string[]; search?: string }
    ) => {
      let query = 'SELECT * FROM charities WHERE 1=1';
      const params: unknown[] = [];

      if (tags && tags.length > 0) {
        params.push(tags);
        query += ` AND cause_tags && $${params.length}`;
      }

      if (search) {
        params.push(`%${search}%`);
        query += ` AND name ILIKE $${params.length}`;
      }

      query += ' ORDER BY name ASC';

      const result = await pool.query(query, params);
      return result.rows.map(toCharity);
    },

    causes: async () => {
      const result = await pool.query(`
        SELECT c.tag, c.label, COUNT(ch.id)::int AS charity_count
        FROM causes c
        LEFT JOIN charities ch ON c.tag = ANY(ch.cause_tags)
        GROUP BY c.tag, c.label
        ORDER BY c.label ASC
      `);
      return result.rows.map(row => ({
        tag: row.tag,
        label: row.label,
        charityCount: row.charity_count,
      }));
    },

    charity: async (_: unknown, { id, slug }: { id?: string; slug?: string }) => {
      if (!id && !slug) return null;

      const field = slug ? 'slug' : 'id';
      const value = slug || id;
      const result = await pool.query(`SELECT * FROM charities WHERE ${field} = $1`, [value]);
      if (result.rows.length === 0) return null;
      return toCharity(result.rows[0]);
    },
  },

  Charity: {
    locations: async (parent: { id: number }) => {
      const result = await pool.query(
        'SELECT * FROM charity_locations WHERE charity_id = $1 ORDER BY id ASC',
        [parent.id]
      );
      return result.rows.map(toLocation);
    },
  },

  Mutation: {
    updateCharity: async (_: unknown, args: Record<string, unknown>, context: Context) => {
      requireAdmin(context);

      const fieldMap: Record<string, string> = {
        name: 'name',
        description: 'description',
        websiteUrl: 'website_url',
        volunteerUrl: 'volunteer_url',
        primaryAddress: 'primary_address',
        causeTags: 'cause_tags',
        donateUrl: 'donate_url',
        foundedYear: 'founded_year',
        isActive: 'is_active',
        logoUrl: 'logo_url',
        coverPhotoUrl: 'cover_photo_url',
        isReviewed: 'is_reviewed',
        impact: 'impact',
        locationDescription: 'location_description',
        contentPhotoUrl1: 'content_photo_url_1',
        contentPhotoUrl2: 'content_photo_url_2',
        programHighlights: 'program_highlights',
        usageCredit: 'usage_credit',
        ctaLabel: 'cta_label',
        ctaUrl: 'cta_url',
      };

      const setClauses: string[] = [];
      const params: unknown[] = [];

      for (const [argKey, colName] of Object.entries(fieldMap)) {
        if (args[argKey] !== undefined) {
          params.push(args[argKey]);
          setClauses.push(`${colName} = $${params.length}`);
        }
      }

      if (setClauses.length === 0) {
        const result = await pool.query('SELECT * FROM charities WHERE id = $1', [args.id]);
        return toCharity(result.rows[0]);
      }

      setClauses.push('updated_at = NOW()');
      params.push(args.id);

      const result = await pool.query(
        `UPDATE charities SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );

      return toCharity(result.rows[0]);
    },

    createCharity: async (_: unknown, args: Record<string, unknown>, context: Context) => {
      requireAdmin(context);

      const result = await pool.query(
        `INSERT INTO charities (name, ein, slug, description, website_url, volunteer_url, primary_address, cause_tags, donate_url, founded_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          args.name, args.ein, args.slug,
          args.description ?? null, args.websiteUrl ?? null,
          args.volunteerUrl ?? null, args.primaryAddress ?? null,
          args.causeTags ?? [], args.donateUrl ?? null,
          args.foundedYear ?? null,
        ]
      );

      return toCharity(result.rows[0]);
    },

    updateCharityLocation: async (_: unknown, args: Record<string, unknown>, context: Context) => {
      requireAdmin(context);

      const fieldMap: Record<string, string> = {
        label: 'label',
        description: 'description',
        address: 'address',
        latitude: 'latitude',
        longitude: 'longitude',
        photoUrl: 'photo_url',
        isReviewed: 'is_reviewed',
        isSublocation: 'is_sublocation',
      };

      const setClauses: string[] = [];
      const params: unknown[] = [];

      for (const [argKey, colName] of Object.entries(fieldMap)) {
        if (args[argKey] !== undefined) {
          params.push(args[argKey]);
          setClauses.push(`${colName} = $${params.length}`);
        }
      }

      if (setClauses.length === 0) {
        const result = await pool.query('SELECT * FROM charity_locations WHERE id = $1', [args.id]);
        return toLocation(result.rows[0]);
      }

      params.push(args.id);
      const result = await pool.query(
        `UPDATE charity_locations SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );

      return toLocation(result.rows[0]);
    },

    createCharityLocation: async (_: unknown, args: Record<string, unknown>, context: Context) => {
      requireAdmin(context);

      const result = await pool.query(
        `INSERT INTO charity_locations (charity_id, label, description, address, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          args.charityId, args.label,
          args.description ?? null, args.address ?? null,
          args.latitude ?? null, args.longitude ?? null,
        ]
      );

      return toLocation(result.rows[0]);
    },

    deleteCharityLocation: async (_: unknown, { id }: { id: string }, context: Context) => {
      requireAdmin(context);
      const result = await pool.query('DELETE FROM charity_locations WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    },

    updateCause: async (_: unknown, { tag, label }: { tag: string; label: string }, context: Context) => {
      requireAdmin(context);
      const result = await pool.query(
        'UPDATE causes SET label = $1 WHERE tag = $2 RETURNING tag, label',
        [label, tag]
      );
      if (result.rows.length === 0) throw new GraphQLError('Cause not found');
      const row = result.rows[0];
      // Return charityCount for the updated row
      const countResult = await pool.query(
        `SELECT COUNT(id)::int AS charity_count FROM charities WHERE $1 = ANY(cause_tags)`,
        [tag]
      );
      return { tag: row.tag, label: row.label, charityCount: countResult.rows[0].charity_count };
    },

    deleteCause: async (_: unknown, { tag }: { tag: string }, context: Context) => {
      requireAdmin(context);
      const countResult = await pool.query(
        `SELECT COUNT(id)::int AS charity_count FROM charities WHERE $1 = ANY(cause_tags)`,
        [tag]
      );
      if (countResult.rows[0].charity_count > 0) {
        throw new GraphQLError('Cannot delete a cause that is in use by charities');
      }
      const result = await pool.query('DELETE FROM causes WHERE tag = $1', [tag]);
      return (result.rowCount ?? 0) > 0;
    },
  },
};
