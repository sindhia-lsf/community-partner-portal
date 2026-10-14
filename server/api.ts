import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { Pool, PoolClient } from "pg";
import { createMediaDownloadUrl, createMediaUploadIntent, validateMediaUpload, verifyMediaObject } from "./s3";

const PORTAL_DATABASE_NAME = process.env.PORTAL_DATABASE_NAME || "community_partner_events";
const SESSION_COOKIE = "community_partner_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const ALLOWED_ROLES = new Set(["partner", "lightship_reviewer", "admin"]);

type Role = "partner" | "lightship_reviewer" | "admin";
type PortalUser = { id: number; email: string; displayName: string | null; roles: Role[] };
type SessionData = { userId: number; expiresAt: number };

declare global {
  namespace Express {
    interface Request {
      portalUser?: PortalUser;
    }
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function portalDatabaseUrl(): string {
  if (process.env.PORTAL_DATABASE_URL) return process.env.PORTAL_DATABASE_URL;
  const inheritedUrl = process.env.DATABASE_URL;
  if (!inheritedUrl) throw new Error("PORTAL_DATABASE_URL or DATABASE_URL is required");
  const parsed = new URL(inheritedUrl);
  parsed.pathname = `/${PORTAL_DATABASE_NAME}`;
  return parsed.toString();
}

const pool = new Pool({ connectionString: portalDatabaseUrl() });

function firebaseAuth() {
  if (getApps().length === 0) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountJson) initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
    else if (serviceAccountPath) initializeApp({ credential: cert(serviceAccountPath) });
    else initializeApp({ projectId: requiredEnv("FIREBASE_PROJECT_ID") });
  }
  return getAuth();
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", requiredEnv("PORTAL_SESSION_SECRET")).update(payload).digest("base64url");
}

function createSession(userId: number): string {
  // PostgreSQL bigint identifiers are returned as strings by `pg`. Normalize
  // before signing; otherwise readSession rejects a valid login cookie.
  const normalizedUserId = Number(userId);
  if (!Number.isSafeInteger(normalizedUserId) || normalizedUserId <= 0) throw new Error("Portal session user id is invalid.");
  const payload = Buffer.from(JSON.stringify({ userId: normalizedUserId, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 } satisfies SessionData)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(header.split(";").flatMap((item) => {
    const index = item.indexOf("=");
    return index === -1 ? [] : [[item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1).trim())]];
  }));
}

function readSession(req: Request): SessionData | null {
  const value = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!value) return null;
  const [payload, providedSignature] = value.split(".");
  if (!payload || !providedSignature) return null;
  const expectedSignature = sign(payload);
  const actual = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionData;
    const userId = Number(session.userId);
    return Number.isSafeInteger(userId) && userId > 0 && session.expiresAt > Date.now()
      ? { ...session, userId }
      : null;
  } catch { return null; }
}

function writeSession(res: Response, userId: number): void {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(createSession(userId))}`,
    "HttpOnly", "Path=/", "SameSite=Lax", `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearSession(res: Response): void {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
}

async function loadPortalUserById(id: number): Promise<PortalUser | null> {
  const result = await pool.query<{ id: number; email: string; display_name: string | null; roles: string[] }>(
    `SELECT u.id, u.email, u.display_name,
            COALESCE(array_agg(ura.role) FILTER (WHERE ura.role IS NOT NULL), ARRAY[]::text[]) AS roles
       FROM portal_users u LEFT JOIN user_role_assignments ura ON ura.user_id = u.id
      WHERE u.id = $1 AND u.archived_at IS NULL GROUP BY u.id`, [id]);
  const row = result.rows[0];
  return row ? { id: row.id, email: row.email, displayName: row.display_name, roles: row.roles.filter((role): role is Role => ALLOWED_ROLES.has(role)) } : null;
}

async function loadPortalUserByEmail(email: string): Promise<PortalUser | null> {
  const result = await pool.query<{ id: number }>("SELECT id FROM portal_users WHERE lower(email) = lower($1) AND archived_at IS NULL", [email]);
  return result.rows[0] ? loadPortalUserById(result.rows[0].id) : null;
}

export async function requireSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = readSession(req);
    if (!session) { res.status(401).json({ error: "Sign in is required." }); return; }
    const user = await loadPortalUserById(session.userId);
    if (!user) { clearSession(res); res.status(401).json({ error: "Your portal access is no longer active." }); return; }
    req.portalUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

function hasLightshipAccess(user: PortalUser): boolean { return user.roles.includes("admin") || user.roles.includes("lightship_reviewer"); }
function canAdminister(user: PortalUser): boolean { return user.roles.includes("admin"); }
function sessionRole(user: PortalUser): Role { return canAdminister(user) ? "admin" : user.roles.includes("lightship_reviewer") ? "lightship_reviewer" : "partner"; }

async function eventAccess(user: PortalUser, eventId: number): Promise<"none" | "view" | "edit"> {
  if (canAdminister(user)) return "edit";
  if (hasLightshipAccess(user)) return "view";
  const result = await pool.query<{ organizer_role: string }>(
    `SELECT ou.organizer_role FROM events e JOIN organizer_users ou ON ou.organizer_id = e.organizer_id
      WHERE e.id = $1 AND ou.user_id = $2 AND e.archived_at IS NULL`, [eventId, user.id]);
  const role = result.rows[0]?.organizer_role;
  return !role ? "none" : role === "owner" || role === "editor" ? "edit" : "view";
}

async function organizerAccess(user: PortalUser, organizerId: number): Promise<"none" | "view" | "edit"> {
  if (canAdminister(user)) return "edit";
  if (hasLightshipAccess(user)) return "view";
  const result = await pool.query<{ organizer_role: string }>(
    `SELECT organizer_role FROM organizer_users WHERE organizer_id = $1 AND user_id = $2`,
    [organizerId, user.id],
  );
  const role = result.rows[0]?.organizer_role;
  return !role ? "none" : role === "owner" || role === "editor" ? "edit" : "view";
}

function parseEventId(value: string): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const eventSelect = `SELECT e.*, o.company_name, o.primary_contact_name, o.primary_contact_email,
                            p.current_state, p.pending_on, p.updated_at AS pipeline_updated_at
                       FROM events e JOIN organizers o ON o.id = e.organizer_id
                       JOIN event_pipeline p ON p.event_id = e.id`;

function serializeEvent(row: Record<string, unknown>) {
  return {
    id: row.id, organizerId: row.organizer_id,
    organizer: { id: row.organizer_id, companyName: row.company_name, primaryContactName: row.primary_contact_name, primaryContactEmail: row.primary_contact_email },
    title: row.title, description: row.description, startsAt: row.starts_at, endsAt: row.ends_at, timezone: row.timezone,
    venueName: row.venue_name, addressLine1: row.address_line_1, addressLine2: row.address_line_2, city: row.city,
    stateProvince: row.state_province, postalCode: row.postal_code, countryCode: row.country_code, capacity: row.capacity,
    rsvpUrl: row.rsvp_url, admissionType: row.admission_type, ticketPriceCents: row.ticket_price_cents,
    currencyCode: row.currency_code, category: row.category, programYear: row.program_year, eventStatus: row.event_status,
    pipeline: { currentState: row.current_state, pendingOn: row.pending_on, updatedAt: row.pipeline_updated_at },
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function serializeOrganizer(row: Record<string, unknown>) {
  return {
    id: row.id, companyName: row.company_name, primaryContactName: row.primary_contact_name,
    primaryContactPhone: row.primary_contact_phone, primaryContactEmail: row.primary_contact_email,
    addressLine1: row.address_line_1, addressLine2: row.address_line_2, city: row.city,
    stateProvince: row.state_province, postalCode: row.postal_code, countryCode: row.country_code,
    websiteUrl: row.website_url, instagramUrl: row.instagram_url, facebookUrl: row.facebook_url,
    xUrl: row.x_url, threadsUrl: row.threads_url, tiktokUrl: row.tiktok_url,
    updatedAt: row.updated_at,
  };
}

const socialPlatforms = new Set(["instagram", "linkedin", "tiktok", "other"]);
const socialRequestTypes = new Set(["collab_post", "reshare", "story_mention", "newsletter_inclusion", "other"]);

function serializeSocialRequest(row: Record<string, unknown>) {
  return {
    id: row.id, eventId: row.event_id, platform: row.platform, requestType: row.request_type,
    title: row.title, postUrl: row.post_url, preferredPublishDate: row.preferred_publish_date,
    postCopy: row.post_copy, requestContext: row.request_context, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at,
    submittedBy: { name: row.submitter_name, email: row.submitter_email },
    reviewedAt: row.reviewed_at,
  };
}

function serializeSocialRequestMessage(row: Record<string, unknown>) {
  return {
    id: row.id, socialRequestId: row.social_request_id, body: row.body, createdAt: row.created_at,
    author: { name: row.author_name || row.author_email || "Portal user", email: row.author_email, role: row.author_role || "partner" },
  };
}

function mediaKind(contentType: string) {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  return "document";
}

async function serializeMediaAsset(row: Record<string, unknown>) {
  return {
    id: row.id, eventId: row.event_id, originalFilename: row.original_filename,
    mediaType: row.media_type, contentType: row.content_type, byteSize: row.byte_size,
    approvalState: row.approval_state, uploadedAt: row.uploaded_at, isActive: row.is_active,
    downloadUrl: await createMediaDownloadUrl(String(row.storage_key)),
  };
}

function validateSocialRequestCreate(body: Record<string, unknown>) {
  const platform = String(body.platform || "").trim().toLowerCase();
  const requestType = String(body.requestType || "").trim().toLowerCase();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const postUrl = typeof body.postUrl === "string" ? body.postUrl.trim() : "";
  const preferredPublishDate = typeof body.preferredPublishDate === "string" && body.preferredPublishDate.trim() ? body.preferredPublishDate.trim() : null;
  const postCopy = typeof body.postCopy === "string" && body.postCopy.trim() ? body.postCopy.trim() : null;
  const requestContext = typeof body.requestContext === "string" && body.requestContext.trim() ? body.requestContext.trim() : null;
  if (!socialPlatforms.has(platform)) throw new Error("Platform is invalid.");
  if (!socialRequestTypes.has(requestType)) throw new Error("Request type is invalid.");
  if (!title) throw new Error("Post title must not be empty.");
  if (!postUrl) throw new Error("A post or draft URL is required.");
  try { const parsed = new URL(postUrl); if (!/^https?:$/.test(parsed.protocol)) throw new Error("unsupported"); }
  catch { throw new Error("Post or draft URL must be a valid http(s) URL."); }
  if (preferredPublishDate && Number.isNaN(Date.parse(`${preferredPublishDate}T12:00:00Z`))) throw new Error("Preferred publish date is invalid.");
  for (const value of [title, postUrl, postCopy, requestContext]) if (value && value.length > 10000) throw new Error("Post details must be 10,000 characters or fewer.");
  return { platform, requestType, title, postUrl, preferredPublishDate, postCopy, requestContext };
}

function canContributeToEvent(user: PortalUser, access: "none" | "view" | "edit"): boolean {
  return access === "edit" || (access !== "none" && hasLightshipAccess(user));
}

function requireLightship(user: PortalUser): void {
  if (!hasLightshipAccess(user)) throw new Error("Lightship team access is required.");
}

const organizerEventSelect = eventSelect.replace(" FROM events e", `,
  (SELECT count(*)::int FROM media_assets ma WHERE ma.event_id = e.id AND ma.archived_at IS NULL) AS media_count,
  (SELECT count(*)::int FROM media_assets ma WHERE ma.event_id = e.id AND ma.archived_at IS NULL AND ma.approval_state = 'pending') AS pending_media_count,
  (SELECT count(*)::int FROM social_requests sr WHERE sr.event_id = e.id AND sr.archived_at IS NULL) AS social_count,
  (SELECT count(*)::int FROM social_requests sr WHERE sr.event_id = e.id AND sr.archived_at IS NULL AND sr.status = 'in_review') AS pending_social_count
  FROM events e`);

function serializeOrganizerEvent(row: Record<string, unknown>) {
  return {
    ...serializeEvent(row),
    mediaCount: Number(row.media_count || 0), pendingMediaCount: Number(row.pending_media_count || 0),
    socialCount: Number(row.social_count || 0), pendingSocialCount: Number(row.pending_social_count || 0),
  };
}

function reviewState(value: unknown, allowed: readonly string[], label: string): string {
  const state = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!allowed.includes(state)) throw new Error(`${label} review state is invalid.`);
  return state;
}

const editableEventFields: Record<string, string> = {
  title: "title", description: "description", startsAt: "starts_at", endsAt: "ends_at", timezone: "timezone",
  venueName: "venue_name", addressLine1: "address_line_1", addressLine2: "address_line_2", city: "city",
  stateProvince: "state_province", postalCode: "postal_code", countryCode: "country_code", capacity: "capacity",
  rsvpUrl: "rsvp_url", admissionType: "admission_type", ticketPriceCents: "ticket_price_cents",
  currencyCode: "currency_code", category: "category",
};

const editableOrganizerFields: Record<string, string> = {
  companyName: "company_name", primaryContactName: "primary_contact_name", primaryContactPhone: "primary_contact_phone",
  primaryContactEmail: "primary_contact_email", addressLine1: "address_line_1", addressLine2: "address_line_2",
  city: "city", stateProvince: "state_province", postalCode: "postal_code", countryCode: "country_code",
  websiteUrl: "website_url", instagramUrl: "instagram_url", facebookUrl: "facebook_url", xUrl: "x_url",
  threadsUrl: "threads_url", tiktokUrl: "tiktok_url",
};

function validateOrganizerUpdate(body: Record<string, unknown>): Record<string, unknown> {
  const update: Record<string, unknown> = {};
  for (const key of Object.keys(editableOrganizerFields)) if (key in body) update[key] = body[key];
  if (Object.keys(update).length === 0) throw new Error("No editable organizer fields were provided.");
  for (const key of ["companyName", "primaryContactName", "primaryContactEmail"] as const) {
    if (key in update && (typeof update[key] !== "string" || !String(update[key]).trim())) throw new Error(`${key} must not be empty.`);
  }
  if ("primaryContactEmail" in update && !/^\S+@\S+\.\S+$/.test(String(update.primaryContactEmail))) throw new Error("Primary contact email is invalid.");
  return update;
}

function validateEventUpdate(body: Record<string, unknown>, user: PortalUser): Record<string, unknown> {
  const update: Record<string, unknown> = {};
  for (const key of Object.keys(editableEventFields)) if (key in body) update[key] = body[key];
  if ("eventStatus" in body && canAdminister(user)) update.eventStatus = body.eventStatus;
  if (Object.keys(update).length === 0) throw new Error("No editable event fields were provided.");
  if ("title" in update && (typeof update.title !== "string" || !update.title.trim())) throw new Error("Title must not be empty.");
  if ("capacity" in update && (!Number.isInteger(update.capacity) || Number(update.capacity) < 0)) throw new Error("Capacity must be a non-negative whole number.");
  if ("ticketPriceCents" in update && update.ticketPriceCents !== null && (!Number.isInteger(update.ticketPriceCents) || Number(update.ticketPriceCents) < 0)) throw new Error("Ticket price must be a non-negative whole number of cents.");
  if ("admissionType" in update && !["free", "paid"].includes(String(update.admissionType))) throw new Error("Admission type must be free or paid.");
  for (const key of ["startsAt", "endsAt"] as const) if (key in update && Number.isNaN(Date.parse(String(update[key])))) throw new Error(`${key === "startsAt" ? "Start" : "End"} time is invalid.`);
  return update;
}

async function logActivity(client: PoolClient, user: PortalUser | null, entityType: string, entityId: number, action: string, beforeData: unknown = null, afterData: unknown = null, metadata: unknown = {}): Promise<void> {
  await client.query(
    `INSERT INTO activity_log (actor_user_id, actor_role, entity_type, entity_id, action, before_data, after_data, metadata)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb)`,
    [user?.id ?? null, user ? sessionRole(user) : "system", entityType, entityId, action, JSON.stringify(beforeData), JSON.stringify(afterData), JSON.stringify(metadata)],
  );
}

export function addApiRoutes(app: import("express").Express): void {
  app.post("/api/firebase-login", async (req, res, next) => {
    try {
      const idToken = req.body?.idToken;
      if (typeof idToken !== "string" || !idToken) { res.status(400).json({ error: "A Firebase ID token is required." }); return; }
      const decodedToken = await firebaseAuth().verifyIdToken(idToken);
      if (!decodedToken.email) { res.status(403).json({ error: "Your Firebase account does not include an email address." }); return; }
      if (process.env.PORTAL_REQUIRE_VERIFIED_EMAIL === "1" && !decodedToken.email_verified) { res.status(403).json({ error: "Verify your email address before accessing the portal." }); return; }
      const portalUser = await loadPortalUserByEmail(decodedToken.email);
      if (!portalUser) { res.status(403).json({ error: "This email has not been granted portal access." }); return; }
      await pool.query(`UPDATE portal_users SET firebase_uid = $1, display_name = COALESCE(NULLIF($2, ''), display_name), updated_by_user_id = id WHERE id = $3`, [decodedToken.uid, decodedToken.name || "", portalUser.id]);
      const refreshedUser = await loadPortalUserById(portalUser.id);
      if (!refreshedUser) throw new Error("Portal user disappeared during sign-in.");
      writeSession(res, refreshedUser.id);
      res.json({ user: refreshedUser });
    } catch (error) { next(error); }
  });

  app.post("/api/auth/password-setup", async (req, res, next) => {
    try {
      const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      if (!email) { res.status(400).json({ error: "An email address is required." }); return; }
      const portalUser = await loadPortalUserByEmail(email);
      if (!portalUser) { res.status(403).json({ error: "This email has not been granted portal access." }); return; }
      const auth = firebaseAuth();
      try { await auth.getUserByEmail(email); }
      catch (error: unknown) {
        if ((error as { code?: string }).code !== "auth/user-not-found") throw error;
        await auth.createUser({ email, displayName: portalUser.displayName || undefined });
      }
      const client = await pool.connect();
      try { await logActivity(client, null, "portal_user", portalUser.id, "password_setup_requested", null, null, { email }); }
      finally { client.release(); }
      res.json({ ok: true });
    } catch (error) { next(error); }
  });

  app.post("/api/logout", (_req, res) => { clearSession(res); res.status(204).end(); });
  app.get("/api/me", requireSession, (req, res) => res.json({ user: req.portalUser }));

  app.get("/api/organizers/:organizerId", requireSession, async (req, res, next) => {
    try {
      const organizerId = parseEventId(req.params.organizerId);
      if (!organizerId) { res.status(400).json({ error: "Organizer id is invalid." }); return; }
      if ((await organizerAccess(req.portalUser!, organizerId)) === "none") { res.status(404).json({ error: "Organizer not found." }); return; }
      const result = await pool.query<Record<string, unknown>>("SELECT * FROM organizers WHERE id = $1 AND archived_at IS NULL", [organizerId]);
      if (!result.rows[0]) { res.status(404).json({ error: "Organizer not found." }); return; }
      res.json({ organizer: serializeOrganizer(result.rows[0]) });
    } catch (error) { next(error); }
  });

  app.patch("/api/organizers/:organizerId", requireSession, async (req, res, next) => {
    const client = await pool.connect();
    try {
      const organizerId = parseEventId(req.params.organizerId);
      if (!organizerId) { res.status(400).json({ error: "Organizer id is invalid." }); return; }
      if ((await organizerAccess(req.portalUser!, organizerId)) !== "edit") { res.status(403).json({ error: "You do not have permission to update this organizer." }); return; }
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) { res.status(400).json({ error: "Organizer updates must be an object." }); return; }
      const update = validateOrganizerUpdate(req.body);
      await client.query("BEGIN");
      const currentResult = await client.query<Record<string, unknown>>("SELECT * FROM organizers WHERE id = $1 AND archived_at IS NULL FOR UPDATE", [organizerId]);
      const current = currentResult.rows[0];
      if (!current) { await client.query("ROLLBACK"); res.status(404).json({ error: "Organizer not found." }); return; }
      const entries = Object.entries(update);
      const setClauses = entries.map(([key], index) => `${editableOrganizerFields[key]} = $${index + 1}`);
      const values = entries.map(([, value]) => value);
      values.push(req.portalUser!.id, organizerId);
      const updatedResult = await client.query<Record<string, unknown>>(
        `UPDATE organizers SET ${setClauses.join(", ")}, updated_by_user_id = $${values.length - 1} WHERE id = $${values.length} RETURNING *`, values,
      );
      await logActivity(client, req.portalUser!, "organizer", organizerId, "organizer_updated", current, updatedResult.rows[0], { changedFields: Object.keys(update) });
      await client.query("COMMIT");
      res.json({ organizer: serializeOrganizer(updatedResult.rows[0]) });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      next(error);
    } finally { client.release(); }
  });

  app.get("/api/events", requireSession, async (req, res, next) => {
    try {
      const user = req.portalUser!;
      const result = hasLightshipAccess(user)
        ? await pool.query(`${eventSelect} WHERE e.archived_at IS NULL ORDER BY e.starts_at ASC`)
        : await pool.query(`${eventSelect} JOIN organizer_users ou ON ou.organizer_id = e.organizer_id WHERE e.archived_at IS NULL AND ou.user_id = $1 ORDER BY e.starts_at ASC`, [user.id]);
      res.json({ events: result.rows.map(serializeEvent) });
    } catch (error) { next(error); }
  });

  app.get("/api/events/:eventId", requireSession, async (req, res, next) => {
    try {
      const eventId = parseEventId(req.params.eventId);
      if (!eventId) { res.status(400).json({ error: "Event id is invalid." }); return; }
      if ((await eventAccess(req.portalUser!, eventId)) === "none") { res.status(404).json({ error: "Event not found." }); return; }
      const result = await pool.query(`${eventSelect} WHERE e.id = $1 AND e.archived_at IS NULL`, [eventId]);
      if (!result.rows[0]) { res.status(404).json({ error: "Event not found." }); return; }
      res.json({ event: serializeEvent(result.rows[0]) });
    } catch (error) { next(error); }
  });

  app.get("/api/events/:eventId/activity", requireSession, async (req, res, next) => {
    try {
      const eventId = parseEventId(req.params.eventId);
      if (!eventId) { res.status(400).json({ error: "Event id is invalid." }); return; }
      if ((await eventAccess(req.portalUser!, eventId)) === "none") { res.status(404).json({ error: "Event not found." }); return; }
      const result = await pool.query(`SELECT l.id, l.occurred_at, l.actor_role, l.entity_type, l.entity_id, l.action, l.before_data, l.after_data, l.metadata, u.email AS actor_email, u.display_name AS actor_name FROM activity_log l LEFT JOIN portal_users u ON u.id = l.actor_user_id WHERE l.entity_type = 'event' AND l.entity_id = $1 ORDER BY l.occurred_at DESC, l.id DESC`, [eventId]);
      res.json({ activity: result.rows });
    } catch (error) { next(error); }
  });

  app.patch("/api/events/:eventId", requireSession, async (req, res, next) => {
    const client = await pool.connect();
    try {
      const eventId = parseEventId(req.params.eventId);
      if (!eventId) { res.status(400).json({ error: "Event id is invalid." }); return; }
      if ((await eventAccess(req.portalUser!, eventId)) !== "edit") { res.status(403).json({ error: "You do not have permission to update this event." }); return; }
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) { res.status(400).json({ error: "Event updates must be an object." }); return; }
      const update = validateEventUpdate(req.body, req.portalUser!);
      await client.query("BEGIN");
      const currentResult = await client.query<Record<string, unknown>>(`SELECT * FROM events WHERE id = $1 AND archived_at IS NULL FOR UPDATE`, [eventId]);
      const current = currentResult.rows[0];
      if (!current) { await client.query("ROLLBACK"); res.status(404).json({ error: "Event not found." }); return; }
      const resultingStart = "startsAt" in update ? String(update.startsAt) : String(current.starts_at);
      const resultingEnd = "endsAt" in update ? String(update.endsAt) : String(current.ends_at);
      if (Date.parse(resultingEnd) <= Date.parse(resultingStart)) throw new Error("End time must be after start time.");
      if (update.admissionType === "free") update.ticketPriceCents = null;
      const entries = Object.entries(update);
      const setClauses = entries.map(([key], index) => `${editableEventFields[key] || "event_status"} = $${index + 1}`);
      const values = entries.map(([, value]) => value);
      values.push(req.portalUser!.id, eventId);
      const updatedResult = await client.query<Record<string, unknown>>(`UPDATE events SET ${setClauses.join(", ")}, updated_by_user_id = $${values.length - 1} WHERE id = $${values.length} RETURNING *`, values);
      await client.query("UPDATE event_pipeline SET updated_at = now(), updated_by_user_id = $1 WHERE event_id = $2", [req.portalUser!.id, eventId]);
      await logActivity(client, req.portalUser!, "event", eventId, "event_updated", current, updatedResult.rows[0], { changedFields: Object.keys(update) });
      await client.query("COMMIT");
      const result = await pool.query(`${eventSelect} WHERE e.id = $1`, [eventId]);
      res.json({ event: serializeEvent(result.rows[0]) });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      next(error);
    } finally { client.release(); }
  });

  app.get("/api/events/:eventId/media", requireSession, async (req, res, next) => {
    try {
      const eventId = parseEventId(req.params.eventId);
      if (!eventId) { res.status(400).json({ error: "Event id is invalid." }); return; }
      if ((await eventAccess(req.portalUser!, eventId)) === "none") { res.status(404).json({ error: "Event not found." }); return; }
      const result = await pool.query<Record<string, unknown>>(
        "SELECT * FROM media_assets WHERE event_id = $1 AND archived_at IS NULL ORDER BY uploaded_at DESC, id DESC", [eventId],
      );
      res.json({ media: await Promise.all(result.rows.map(serializeMediaAsset)) });
    } catch (error) { next(error); }
  });

  app.post("/api/events/:eventId/media/upload-intents", requireSession, async (req, res, next) => {
    try {
      const eventId = parseEventId(req.params.eventId);
      if (!eventId) { res.status(400).json({ error: "Event id is invalid." }); return; }
      const access = await eventAccess(req.portalUser!, eventId);
      if (!canContributeToEvent(req.portalUser!, access)) { res.status(403).json({ error: "You do not have permission to upload media for this event." }); return; }
      const intent = await createMediaUploadIntent(eventId, req.body ?? {});
      res.status(201).json({ upload: intent });
    } catch (error) { next(error); }
  });

  app.post("/api/events/:eventId/media/complete", requireSession, async (req, res, next) => {
    const client = await pool.connect();
    try {
      const eventId = parseEventId(req.params.eventId);
      if (!eventId) { res.status(400).json({ error: "Event id is invalid." }); return; }
      const access = await eventAccess(req.portalUser!, eventId);
      if (!canContributeToEvent(req.portalUser!, access)) { res.status(403).json({ error: "You do not have permission to complete media uploads for this event." }); return; }
      const key = typeof req.body?.key === "string" ? req.body.key : "";
      if (!key.startsWith(`event-media/${eventId}/`) || key.length > 500) { res.status(400).json({ error: "Upload key is invalid." }); return; }
      const metadata = validateMediaUpload(req.body ?? {});
      await verifyMediaObject(key, metadata);
      await client.query("BEGIN");
      const inserted = await client.query<Record<string, unknown>>(
        `INSERT INTO media_assets (event_id,storage_key,original_filename,media_type,content_type,byte_size,uploaded_by_user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [eventId, key, metadata.filename, mediaKind(metadata.contentType), metadata.contentType, metadata.byteSize, req.portalUser!.id],
      );
      await logActivity(client, req.portalUser!, "media_asset", Number(inserted.rows[0].id), "media_uploaded", null, inserted.rows[0], { eventId });
      await client.query("COMMIT");
      res.status(201).json({ media: await serializeMediaAsset(inserted.rows[0]) });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      next(error);
    } finally { client.release(); }
  });

  app.get("/api/events/:eventId/social-requests", requireSession, async (req, res, next) => {
    try {
      const eventId = parseEventId(req.params.eventId);
      if (!eventId) { res.status(400).json({ error: "Event id is invalid." }); return; }
      if ((await eventAccess(req.portalUser!, eventId)) === "none") { res.status(404).json({ error: "Event not found." }); return; }
      const result = await pool.query<Record<string, unknown>>(
        `SELECT sr.*, u.display_name AS submitter_name, u.email AS submitter_email
           FROM social_requests sr JOIN portal_users u ON u.id = sr.created_by_user_id
          WHERE sr.event_id = $1 AND sr.archived_at IS NULL
          ORDER BY sr.created_at DESC, sr.id DESC`, [eventId],
      );
      res.json({ socialRequests: result.rows.map(serializeSocialRequest) });
    } catch (error) { next(error); }
  });

  app.post("/api/events/:eventId/social-requests", requireSession, async (req, res, next) => {
    const client = await pool.connect();
    try {
      const eventId = parseEventId(req.params.eventId);
      if (!eventId) { res.status(400).json({ error: "Event id is invalid." }); return; }
      const access = await eventAccess(req.portalUser!, eventId);
      if (!canContributeToEvent(req.portalUser!, access)) { res.status(403).json({ error: "You do not have permission to create a social request for this event." }); return; }
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) { res.status(400).json({ error: "Social request details must be an object." }); return; }
      const request = validateSocialRequestCreate(req.body);
      await client.query("BEGIN");
      const inserted = await client.query<Record<string, unknown>>(
        `INSERT INTO social_requests (event_id, platform, request_type, title, post_url, preferred_publish_date, post_copy, request_context, created_by_user_id, updated_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9) RETURNING *`,
        [eventId, request.platform, request.requestType, request.title, request.postUrl, request.preferredPublishDate, request.postCopy, request.requestContext, req.portalUser!.id],
      );
      const created = inserted.rows[0];
      await logActivity(client, req.portalUser!, "social_request", Number(created.id), "social_request_created", null, created, { eventId });
      await client.query("COMMIT");
      const result = await pool.query<Record<string, unknown>>(
        `SELECT sr.*, u.display_name AS submitter_name, u.email AS submitter_email
           FROM social_requests sr JOIN portal_users u ON u.id = sr.created_by_user_id WHERE sr.id = $1`, [created.id],
      );
      res.status(201).json({ socialRequest: serializeSocialRequest(result.rows[0]) });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      next(error);
    } finally { client.release(); }
  });

  app.get("/api/events/:eventId/social-requests/:requestId/messages", requireSession, async (req, res, next) => {
    try {
      const eventId = parseEventId(req.params.eventId); const requestId = parseEventId(req.params.requestId);
      if (!eventId || !requestId) { res.status(400).json({ error: "Request id is invalid." }); return; }
      if ((await eventAccess(req.portalUser!, eventId)) === "none") { res.status(404).json({ error: "Event not found." }); return; }
      const result = await pool.query<Record<string, unknown>>(
        `SELECT m.*, u.display_name AS author_name, u.email AS author_email,
                COALESCE((SELECT ura.role FROM user_role_assignments ura WHERE ura.user_id = u.id AND ura.role IN ('admin', 'lightship_reviewer') ORDER BY ura.role = 'admin' DESC LIMIT 1), 'partner') AS author_role
           FROM social_request_messages m JOIN social_requests sr ON sr.id = m.social_request_id
           JOIN portal_users u ON u.id = m.created_by_user_id
          WHERE m.social_request_id = $1 AND sr.id = $2 AND sr.event_id = $3 AND sr.archived_at IS NULL
          ORDER BY m.created_at ASC, m.id ASC`, [requestId, requestId, eventId],
      );
      res.json({ messages: result.rows.map(serializeSocialRequestMessage) });
    } catch (error) { next(error); }
  });

  app.post("/api/events/:eventId/social-requests/:requestId/messages", requireSession, async (req, res, next) => {
    const client = await pool.connect();
    try {
      const eventId = parseEventId(req.params.eventId); const requestId = parseEventId(req.params.requestId);
      if (!eventId || !requestId) { res.status(400).json({ error: "Request id is invalid." }); return; }
      const access = await eventAccess(req.portalUser!, eventId);
      if (!canContributeToEvent(req.portalUser!, access)) { res.status(403).json({ error: "You do not have permission to comment on this request." }); return; }
      const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";
      if (!body) { res.status(400).json({ error: "A message is required." }); return; }
      if (body.length > 10000) { res.status(400).json({ error: "Messages must be 10,000 characters or fewer." }); return; }
      await client.query("BEGIN");
      const requestResult = await client.query<Record<string, unknown>>(`SELECT * FROM social_requests WHERE id = $1 AND event_id = $2 AND archived_at IS NULL FOR UPDATE`, [requestId, eventId]);
      if (!requestResult.rows[0]) { await client.query("ROLLBACK"); res.status(404).json({ error: "Social request not found." }); return; }
      const inserted = await client.query<Record<string, unknown>>(`INSERT INTO social_request_messages (social_request_id, body, created_by_user_id) VALUES ($1, $2, $3) RETURNING *`, [requestId, body, req.portalUser!.id]);
      await logActivity(client, req.portalUser!, "social_request", requestId, "social_request_message_added", null, inserted.rows[0], { eventId });
      await client.query("COMMIT");
      const result = await pool.query<Record<string, unknown>>(
        `SELECT m.*, u.display_name AS author_name, u.email AS author_email,
                COALESCE((SELECT ura.role FROM user_role_assignments ura WHERE ura.user_id = u.id AND ura.role IN ('admin', 'lightship_reviewer') ORDER BY ura.role = 'admin' DESC LIMIT 1), 'partner') AS author_role
           FROM social_request_messages m JOIN portal_users u ON u.id = m.created_by_user_id WHERE m.id = $1`, [inserted.rows[0].id],
      );
      res.status(201).json({ message: serializeSocialRequestMessage(result.rows[0]) });
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      next(error);
    } finally { client.release(); }
  });

  // Organizer control room: every queue and action uses the live portal data.
  app.get("/api/organizer/overview", requireSession, async (req, res, next) => {
    try {
      requireLightship(req.portalUser!);
      const [events, media, social] = await Promise.all([
        pool.query<{ total: number; pending_partner: number }>(`SELECT count(*)::int AS total, count(*) FILTER (WHERE p.pending_on = 'partner')::int AS pending_partner FROM events e JOIN event_pipeline p ON p.event_id = e.id WHERE e.archived_at IS NULL`),
        pool.query<{ pending: number }>("SELECT count(*) FILTER (WHERE approval_state = 'pending')::int AS pending FROM media_assets WHERE archived_at IS NULL"),
        pool.query<{ pending: number }>("SELECT count(*) FILTER (WHERE status = 'in_review')::int AS pending FROM social_requests WHERE archived_at IS NULL"),
      ]);
      res.json({ overview: { eventCount: events.rows[0]?.total || 0, pendingPartnerCount: events.rows[0]?.pending_partner || 0, pendingMediaCount: media.rows[0]?.pending || 0, pendingSocialCount: social.rows[0]?.pending || 0 } });
    } catch (error) { next(error); }
  });

  app.get("/api/organizer/events", requireSession, async (req, res, next) => {
    try {
      requireLightship(req.portalUser!);
      const result = await pool.query<Record<string, unknown>>(`${organizerEventSelect} WHERE e.archived_at IS NULL ORDER BY e.starts_at ASC, e.id ASC`);
      res.json({ events: result.rows.map(serializeOrganizerEvent) });
    } catch (error) { next(error); }
  });

  app.get("/api/organizer/events/:eventId", requireSession, async (req, res, next) => {
    try {
      requireLightship(req.portalUser!);
      const eventId = parseEventId(req.params.eventId);
      if (!eventId) { res.status(400).json({ error: "Event id is invalid." }); return; }
      const result = await pool.query<Record<string, unknown>>(`${organizerEventSelect} WHERE e.id = $1 AND e.archived_at IS NULL`, [eventId]);
      if (!result.rows[0]) { res.status(404).json({ error: "Event not found." }); return; }
      res.json({ event: serializeOrganizerEvent(result.rows[0]) });
    } catch (error) { next(error); }
  });

  app.patch("/api/organizer/events/:eventId/review", requireSession, async (req, res, next) => {
    const client = await pool.connect();
    try {
      requireLightship(req.portalUser!);
      const eventId = parseEventId(req.params.eventId);
      if (!eventId) { res.status(400).json({ error: "Event id is invalid." }); return; }
      const state = reviewState(req.body?.state, ["draft", "in_review", "changes_needed", "approved", "live", "not_moving_forward"], "Event");
      const pendingOn = ["changes_needed", "draft"].includes(state) ? "partner" : "lightship";
      await client.query("BEGIN");
      const current = await client.query<Record<string, unknown>>("SELECT e.*, p.current_state, p.pending_on FROM events e JOIN event_pipeline p ON p.event_id = e.id WHERE e.id = $1 AND e.archived_at IS NULL FOR UPDATE", [eventId]);
      if (!current.rows[0]) { await client.query("ROLLBACK"); res.status(404).json({ error: "Event not found." }); return; }
      await client.query("UPDATE events SET event_status = $1, updated_by_user_id = $2 WHERE id = $3", [state, req.portalUser!.id, eventId]);
      await client.query("UPDATE event_pipeline SET current_state = $1, pending_on = $2, updated_at = now(), updated_by_user_id = $3 WHERE event_id = $4", [state, pendingOn, req.portalUser!.id, eventId]);
      await logActivity(client, req.portalUser!, "event", eventId, "event_reviewed", current.rows[0], { state, pendingOn }, {});
      await client.query("COMMIT");
      const updated = await pool.query<Record<string, unknown>>(`${organizerEventSelect} WHERE e.id = $1`, [eventId]);
      res.json({ event: serializeOrganizerEvent(updated.rows[0]) });
    } catch (error) { await client.query("ROLLBACK").catch(() => undefined); next(error); } finally { client.release(); }
  });

  app.get("/api/organizer/media", requireSession, async (req, res, next) => {
    try {
      requireLightship(req.portalUser!);
      const result = await pool.query<Record<string, unknown>>(`SELECT ma.*, e.title AS event_title, o.company_name, u.display_name AS uploader_name, u.email AS uploader_email,
        (SELECT count(*)::int FROM media_comments mc WHERE mc.media_asset_id = ma.id) AS comment_count
        FROM media_assets ma JOIN events e ON e.id = ma.event_id JOIN organizers o ON o.id = e.organizer_id LEFT JOIN portal_users u ON u.id = ma.uploaded_by_user_id
        WHERE ma.archived_at IS NULL ORDER BY ma.uploaded_at DESC, ma.id DESC`);
      res.json({ media: await Promise.all(result.rows.map(async (row) => ({ ...await serializeMediaAsset(row), event: { title: row.event_title, organizerName: row.company_name }, uploader: { name: row.uploader_name, email: row.uploader_email }, commentCount: Number(row.comment_count || 0) }))) });
    } catch (error) { next(error); }
  });

  app.get("/api/organizer/media/:mediaId", requireSession, async (req, res, next) => {
    try {
      requireLightship(req.portalUser!);
      const mediaId = parseEventId(req.params.mediaId);
      if (!mediaId) { res.status(400).json({ error: "Media id is invalid." }); return; }
      const result = await pool.query<Record<string, unknown>>(`SELECT ma.*, e.title AS event_title, o.company_name, u.display_name AS uploader_name, u.email AS uploader_email,
        (SELECT count(*)::int FROM media_comments mc WHERE mc.media_asset_id = ma.id) AS comment_count
        FROM media_assets ma JOIN events e ON e.id = ma.event_id JOIN organizers o ON o.id = e.organizer_id LEFT JOIN portal_users u ON u.id = ma.uploaded_by_user_id
        WHERE ma.id = $1 AND ma.archived_at IS NULL`, [mediaId]);
      if (!result.rows[0]) { res.status(404).json({ error: "Media not found." }); return; }
      const row = result.rows[0];
      res.json({ media: { ...await serializeMediaAsset(row), event: { title: row.event_title, organizerName: row.company_name }, uploader: { name: row.uploader_name, email: row.uploader_email }, commentCount: Number(row.comment_count || 0) } });
    } catch (error) { next(error); }
  });

  app.patch("/api/organizer/media/:mediaId/review", requireSession, async (req, res, next) => {
    const client = await pool.connect();
    try {
      requireLightship(req.portalUser!);
      const mediaId = parseEventId(req.params.mediaId);
      if (!mediaId) { res.status(400).json({ error: "Media id is invalid." }); return; }
      const state = reviewState(req.body?.state, ["pending", "approved", "changes_needed", "rejected"], "Media");
      await client.query("BEGIN");
      const current = await client.query<Record<string, unknown>>("SELECT * FROM media_assets WHERE id = $1 AND archived_at IS NULL FOR UPDATE", [mediaId]);
      if (!current.rows[0]) { await client.query("ROLLBACK"); res.status(404).json({ error: "Media not found." }); return; }
      const updated = await client.query<Record<string, unknown>>("UPDATE media_assets SET approval_state = $1, reviewed_at = now(), reviewed_by_user_id = $2 WHERE id = $3 RETURNING *", [state, req.portalUser!.id, mediaId]);
      await logActivity(client, req.portalUser!, "media_asset", mediaId, "media_reviewed", current.rows[0], updated.rows[0], { eventId: current.rows[0].event_id });
      await client.query("COMMIT");
      res.json({ media: await serializeMediaAsset(updated.rows[0]) });
    } catch (error) { await client.query("ROLLBACK").catch(() => undefined); next(error); } finally { client.release(); }
  });

  app.get("/api/organizer/media/:mediaId/comments", requireSession, async (req, res, next) => {
    try {
      requireLightship(req.portalUser!);
      const mediaId = parseEventId(req.params.mediaId);
      if (!mediaId) { res.status(400).json({ error: "Media id is invalid." }); return; }
      const result = await pool.query(`SELECT mc.*, u.display_name, u.email, COALESCE((SELECT ura.role FROM user_role_assignments ura WHERE ura.user_id = u.id AND ura.role IN ('admin','lightship_reviewer') ORDER BY ura.role = 'admin' DESC LIMIT 1), 'partner') AS role FROM media_comments mc JOIN portal_users u ON u.id = mc.created_by_user_id WHERE mc.media_asset_id = $1 ORDER BY mc.created_at ASC, mc.id ASC`, [mediaId]);
      res.json({ comments: result.rows.map((row) => ({ id: row.id, body: row.body, createdAt: row.created_at, author: { name: row.display_name || row.email, email: row.email, role: row.role } })) });
    } catch (error) { next(error); }
  });

  app.post("/api/organizer/media/:mediaId/comments", requireSession, async (req, res, next) => {
    const client = await pool.connect();
    try {
      requireLightship(req.portalUser!);
      const mediaId = parseEventId(req.params.mediaId); const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";
      if (!mediaId || !body || body.length > 10000) { res.status(400).json({ error: "A comment of 10,000 characters or fewer is required." }); return; }
      await client.query("BEGIN");
      const media = await client.query<Record<string, unknown>>("SELECT * FROM media_assets WHERE id = $1 AND archived_at IS NULL FOR UPDATE", [mediaId]);
      if (!media.rows[0]) { await client.query("ROLLBACK"); res.status(404).json({ error: "Media not found." }); return; }
      const inserted = await client.query("INSERT INTO media_comments (media_asset_id, body, created_by_user_id) VALUES ($1, $2, $3) RETURNING *", [mediaId, body, req.portalUser!.id]);
      await logActivity(client, req.portalUser!, "media_asset", mediaId, "media_comment_added", null, inserted.rows[0], { eventId: media.rows[0].event_id });
      await client.query("COMMIT");
      res.status(201).json({ comment: { id: inserted.rows[0].id, body: inserted.rows[0].body, createdAt: inserted.rows[0].created_at, author: { name: req.portalUser!.displayName || req.portalUser!.email, email: req.portalUser!.email, role: sessionRole(req.portalUser!) } } });
    } catch (error) { await client.query("ROLLBACK").catch(() => undefined); next(error); } finally { client.release(); }
  });

  app.get("/api/organizer/social", requireSession, async (req, res, next) => {
    try {
      requireLightship(req.portalUser!);
      const result = await pool.query<Record<string, unknown>>(`SELECT sr.*, e.title AS event_title, o.company_name, u.display_name AS submitter_name, u.email AS submitter_email,
        (SELECT count(*)::int FROM social_request_messages sm WHERE sm.social_request_id = sr.id) AS comment_count
        FROM social_requests sr JOIN events e ON e.id = sr.event_id JOIN organizers o ON o.id = e.organizer_id JOIN portal_users u ON u.id = sr.created_by_user_id
        WHERE sr.archived_at IS NULL ORDER BY sr.created_at DESC, sr.id DESC`);
      res.json({ socialRequests: result.rows.map((row) => ({ ...serializeSocialRequest(row), event: { title: row.event_title, organizerName: row.company_name }, commentCount: Number(row.comment_count || 0) })) });
    } catch (error) { next(error); }
  });

  app.get("/api/organizer/social/:requestId", requireSession, async (req, res, next) => {
    try {
      requireLightship(req.portalUser!);
      const requestId = parseEventId(req.params.requestId);
      if (!requestId) { res.status(400).json({ error: "Social request id is invalid." }); return; }
      const result = await pool.query<Record<string, unknown>>(`SELECT sr.*, e.title AS event_title, o.company_name, u.display_name AS submitter_name, u.email AS submitter_email,
        (SELECT count(*)::int FROM social_request_messages sm WHERE sm.social_request_id = sr.id) AS comment_count
        FROM social_requests sr JOIN events e ON e.id = sr.event_id JOIN organizers o ON o.id = e.organizer_id JOIN portal_users u ON u.id = sr.created_by_user_id
        WHERE sr.id = $1 AND sr.archived_at IS NULL`, [requestId]);
      if (!result.rows[0]) { res.status(404).json({ error: "Social request not found." }); return; }
      const row = result.rows[0];
      res.json({ socialRequest: { ...serializeSocialRequest(row), event: { title: row.event_title, organizerName: row.company_name }, commentCount: Number(row.comment_count || 0) } });
    } catch (error) { next(error); }
  });

  app.patch("/api/organizer/social/:requestId/review", requireSession, async (req, res, next) => {
    const client = await pool.connect();
    try {
      requireLightship(req.portalUser!);
      const requestId = parseEventId(req.params.requestId);
      if (!requestId) { res.status(400).json({ error: "Social request id is invalid." }); return; }
      const state = reviewState(req.body?.state, ["in_review", "approved", "changes_needed", "not_moving_forward"], "Social");
      await client.query("BEGIN");
      const current = await client.query<Record<string, unknown>>("SELECT * FROM social_requests WHERE id = $1 AND archived_at IS NULL FOR UPDATE", [requestId]);
      if (!current.rows[0]) { await client.query("ROLLBACK"); res.status(404).json({ error: "Social request not found." }); return; }
      const updated = await client.query<Record<string, unknown>>("UPDATE social_requests SET status = $1, reviewed_at = now(), reviewed_by_user_id = $2, updated_by_user_id = $2 WHERE id = $3 RETURNING *", [state, req.portalUser!.id, requestId]);
      await logActivity(client, req.portalUser!, "social_request", requestId, "social_request_reviewed", current.rows[0], updated.rows[0], { eventId: current.rows[0].event_id });
      await client.query("COMMIT");
      res.json({ socialRequest: serializeSocialRequest(updated.rows[0]) });
    } catch (error) { await client.query("ROLLBACK").catch(() => undefined); next(error); } finally { client.release(); }
  });
}

export function portalErrorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error("Portal API error", error);
  const firebaseCode = (error as { code?: string }).code;
  if (typeof firebaseCode === "string" && firebaseCode.startsWith("auth/")) { res.status(401).json({ error: "Firebase authentication could not be verified." }); return; }
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  const clientError = ["No editable event fields", "Title must", "Capacity must", "Ticket price", "Admission type", "Start time", "End time", "Platform is", "Request type", "Post title", "A post", "Post or draft", "Preferred publish", "Post details", "Messages must", "A valid file", "Allowed media", "Media files", "Uploaded object", "Upload key"].some((prefix) => message.startsWith(prefix));
  res.status(clientError ? 400 : 500).json({ error: clientError ? message : "Portal server error." });
}
