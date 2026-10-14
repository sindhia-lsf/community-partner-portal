BEGIN;

CREATE TABLE user_role_assignments (
  user_id BIGINT NOT NULL REFERENCES portal_users(id),
  role TEXT NOT NULL CHECK (role IN ('partner', 'lightship_reviewer', 'admin')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by_user_id BIGINT REFERENCES portal_users(id),
  PRIMARY KEY (user_id, role)
);

CREATE INDEX user_role_assignments_role_idx ON user_role_assignments (role, user_id);

INSERT INTO user_role_assignments (user_id, role)
SELECT id, role
FROM portal_users
WHERE archived_at IS NULL
ON CONFLICT DO NOTHING;

COMMIT;
