BEGIN;

CREATE TABLE portal_users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  firebase_uid TEXT UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'partner' CHECK (role IN ('partner', 'lightship_reviewer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id BIGINT,
  updated_by_user_id BIGINT,
  archived_at TIMESTAMPTZ,
  archived_by_user_id BIGINT,
  CONSTRAINT portal_users_email_lower_unique UNIQUE (email)
);

CREATE TABLE organizers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_name TEXT NOT NULL,
  primary_contact_name TEXT NOT NULL,
  primary_contact_phone TEXT,
  primary_contact_email TEXT NOT NULL,
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country_code CHAR(2) NOT NULL DEFAULT 'US',
  website_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  x_url TEXT,
  threads_url TEXT,
  tiktok_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id BIGINT,
  updated_by_user_id BIGINT,
  archived_at TIMESTAMPTZ,
  archived_by_user_id BIGINT,
  CONSTRAINT organizers_primary_contact_email_lower_unique UNIQUE (primary_contact_email)
);

CREATE TABLE organizer_users (
  organizer_id BIGINT NOT NULL REFERENCES organizers(id),
  user_id BIGINT NOT NULL REFERENCES portal_users(id),
  organizer_role TEXT NOT NULL DEFAULT 'owner' CHECK (organizer_role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id BIGINT,
  PRIMARY KEY (organizer_id, user_id)
);

CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organizer_id BIGINT NOT NULL REFERENCES organizers(id),
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  venue_name TEXT,
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country_code CHAR(2) NOT NULL DEFAULT 'US',
  capacity INTEGER CHECK (capacity IS NULL OR capacity >= 0),
  rsvp_url TEXT,
  admission_type TEXT NOT NULL DEFAULT 'free' CHECK (admission_type IN ('free', 'paid')),
  ticket_price_cents INTEGER CHECK (ticket_price_cents IS NULL OR ticket_price_cents >= 0),
  currency_code CHAR(3) NOT NULL DEFAULT 'USD',
  category TEXT,
  program_year SMALLINT NOT NULL,
  event_status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id BIGINT,
  updated_by_user_id BIGINT,
  archived_at TIMESTAMPTZ,
  archived_by_user_id BIGINT,
  CHECK (ends_at > starts_at),
  CHECK ((admission_type = 'free' AND ticket_price_cents IS NULL) OR admission_type = 'paid')
);

CREATE TABLE event_pipeline (
  event_id BIGINT PRIMARY KEY REFERENCES events(id),
  current_state TEXT NOT NULL DEFAULT 'draft',
  pending_on TEXT NOT NULL DEFAULT 'partner' CHECK (pending_on IN ('lightship', 'partner')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_user_id BIGINT REFERENCES portal_users(id)
);

CREATE TABLE media_assets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id),
  storage_key TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  media_type TEXT NOT NULL,
  content_type TEXT NOT NULL,
  byte_size BIGINT CHECK (byte_size IS NULL OR byte_size >= 0),
  approval_state TEXT NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by_user_id BIGINT REFERENCES portal_users(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_by_user_id BIGINT REFERENCES portal_users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  archived_at TIMESTAMPTZ,
  archived_by_user_id BIGINT REFERENCES portal_users(id)
);

CREATE TABLE media_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  media_asset_id BIGINT NOT NULL REFERENCES media_assets(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id BIGINT REFERENCES portal_users(id)
);

CREATE TABLE activity_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_user_id BIGINT REFERENCES portal_users(id),
  actor_role TEXT,
  entity_type TEXT NOT NULL,
  entity_id BIGINT NOT NULL,
  action TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX events_organizer_id_idx ON events (organizer_id);
CREATE INDEX events_program_year_idx ON events (program_year);
CREATE INDEX events_status_idx ON events (event_status);
CREATE INDEX media_assets_event_id_idx ON media_assets (event_id);
CREATE INDEX activity_log_entity_idx ON activity_log (entity_type, entity_id, occurred_at DESC);
CREATE INDEX activity_log_actor_idx ON activity_log (actor_user_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER portal_users_updated_at BEFORE UPDATE ON portal_users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER organizers_updated_at BEFORE UPDATE ON organizers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION reject_activity_log_mutation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'activity_log is append-only';
END;
$$;

CREATE TRIGGER activity_log_no_update BEFORE UPDATE ON activity_log FOR EACH ROW EXECUTE FUNCTION reject_activity_log_mutation();
CREATE TRIGGER activity_log_no_delete BEFORE DELETE ON activity_log FOR EACH ROW EXECUTE FUNCTION reject_activity_log_mutation();

ALTER TABLE portal_users
  ADD CONSTRAINT portal_users_created_by_fk FOREIGN KEY (created_by_user_id) REFERENCES portal_users(id),
  ADD CONSTRAINT portal_users_updated_by_fk FOREIGN KEY (updated_by_user_id) REFERENCES portal_users(id),
  ADD CONSTRAINT portal_users_archived_by_fk FOREIGN KEY (archived_by_user_id) REFERENCES portal_users(id);

ALTER TABLE organizers
  ADD CONSTRAINT organizers_created_by_fk FOREIGN KEY (created_by_user_id) REFERENCES portal_users(id),
  ADD CONSTRAINT organizers_updated_by_fk FOREIGN KEY (updated_by_user_id) REFERENCES portal_users(id),
  ADD CONSTRAINT organizers_archived_by_fk FOREIGN KEY (archived_by_user_id) REFERENCES portal_users(id);

ALTER TABLE events
  ADD CONSTRAINT events_created_by_fk FOREIGN KEY (created_by_user_id) REFERENCES portal_users(id),
  ADD CONSTRAINT events_updated_by_fk FOREIGN KEY (updated_by_user_id) REFERENCES portal_users(id),
  ADD CONSTRAINT events_archived_by_fk FOREIGN KEY (archived_by_user_id) REFERENCES portal_users(id);

COMMIT;
