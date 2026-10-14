# Community Partner Events Database

This schema is intentionally separate from the existing Lightship and Black Tech Week databases.

Create a PostgreSQL database named `community_partner_events`, then apply the migration and seed:

```bash
psql "$COMMUNITY_PARTNER_EVENTS_DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_initial_schema.sql
psql "$COMMUNITY_PARTNER_EVENTS_DATABASE_URL" -v ON_ERROR_STOP=1 -f db/seeds/001_coffee_testing_with_sin.sql
```

`activity_log` is append-only. Every application mutation should insert one activity record in the same database transaction, with the actor, action, timestamp, entity, and before/after payload.

## Portal API and Firebase

The portal server connects only to `community_partner_events`. Configure its database URL through `PORTAL_DATABASE_URL`, or set `PORTAL_DATABASE_NAME=community_partner_events` when the runtime already injects a shared Postgres URL.

Firebase users are matched to pre-approved `portal_users` by the email in their verified Firebase token. Email-verification enforcement can be enabled with `PORTAL_REQUIRE_VERIFIED_EMAIL=1`. The server writes a signed, HttpOnly portal session after Firebase token verification; the browser never chooses its own role. The required deployment variables are listed in `.env.example`. Keep the Firebase Admin credential and `PORTAL_SESSION_SECRET` in the host secret manager, not in the repository.
