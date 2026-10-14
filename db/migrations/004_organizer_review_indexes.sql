BEGIN;

-- Existing review tables already hold the required source-of-truth records.
-- These partial indexes keep the live organizer queues efficient as volume grows.
CREATE INDEX IF NOT EXISTS media_assets_review_queue_idx
  ON media_assets (approval_state, uploaded_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS social_requests_review_queue_idx
  ON social_requests (status, created_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS media_comments_asset_idx
  ON media_comments (media_asset_id, created_at ASC);

COMMIT;
