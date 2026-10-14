BEGIN;

CREATE TABLE social_requests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'tiktok', 'other')),
  request_type TEXT NOT NULL CHECK (request_type IN ('collab_post', 'reshare', 'story_mention', 'newsletter_inclusion', 'other')),
  title TEXT NOT NULL,
  post_url TEXT NOT NULL,
  preferred_publish_date DATE,
  post_copy TEXT,
  request_context TEXT,
  status TEXT NOT NULL DEFAULT 'in_review' CHECK (status IN ('in_review', 'approved', 'changes_needed', 'not_moving_forward')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id BIGINT NOT NULL REFERENCES portal_users(id),
  updated_by_user_id BIGINT NOT NULL REFERENCES portal_users(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_by_user_id BIGINT REFERENCES portal_users(id),
  archived_at TIMESTAMPTZ,
  archived_by_user_id BIGINT REFERENCES portal_users(id)
);

CREATE TABLE social_request_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  social_request_id BIGINT NOT NULL REFERENCES social_requests(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_user_id BIGINT NOT NULL REFERENCES portal_users(id)
);

CREATE INDEX social_requests_event_id_idx ON social_requests (event_id, created_at DESC);
CREATE INDEX social_request_messages_request_id_idx ON social_request_messages (social_request_id, created_at ASC);

CREATE TRIGGER social_requests_updated_at BEFORE UPDATE ON social_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
