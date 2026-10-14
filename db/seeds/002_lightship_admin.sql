BEGIN;

WITH admin_user AS (
  INSERT INTO portal_users (email, display_name, role)
  VALUES ('sindhia@lightship.foundation', 'Sindhia', 'admin')
  ON CONFLICT (email) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        role = 'admin'
  RETURNING id
), role_assignments AS (
  INSERT INTO user_role_assignments (user_id, role)
  SELECT id, role
  FROM admin_user
  CROSS JOIN (VALUES ('admin'::text), ('lightship_reviewer'::text)) AS requested_roles(role)
  ON CONFLICT DO NOTHING
)
INSERT INTO activity_log (actor_role, entity_type, entity_id, action, after_data, metadata)
SELECT
  'system',
  'portal_user',
  id,
  'portal_user_roles_assigned',
  jsonb_build_object('email', 'sindhia@lightship.foundation', 'roles', jsonb_build_array('admin', 'lightship_reviewer')),
  jsonb_build_object('source', 'initial_lightship_admin_seed')
FROM admin_user;

COMMIT;
