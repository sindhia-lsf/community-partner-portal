BEGIN;

WITH inserted_user AS (
  INSERT INTO portal_users (email, display_name, role)
  VALUES ('sindhiabhanuc@gmail.com', 'Sindhia Bhanuc', 'partner')
  RETURNING id
), inserted_organizer AS (
  INSERT INTO organizers (
    company_name, primary_contact_name, primary_contact_phone, primary_contact_email,
    address_line_1, city, state_province, postal_code, website_url, instagram_url
  )
  VALUES (
    'Sin Coffee Collective', 'Sindhia Bhanuc', '(513) 555-0147', 'sindhiabhanuc@gmail.com',
    '1540 Walnut Street', 'Cincinnati', 'OH', '45202', 'https://sincoffeecollective.example', 'https://instagram.com/sincoffeecollective'
  )
  RETURNING id
), organizer_membership AS (
  INSERT INTO organizer_users (organizer_id, user_id, organizer_role)
  SELECT inserted_organizer.id, inserted_user.id, 'owner'
  FROM inserted_organizer, inserted_user
), inserted_event AS (
  INSERT INTO events (
    organizer_id, title, description, starts_at, ends_at, timezone, venue_name,
    address_line_1, city, state_province, postal_code, capacity, rsvp_url,
    admission_type, category, program_year, event_status, created_by_user_id, updated_by_user_id
  )
  SELECT
    inserted_organizer.id, 'Coffee testing with Sin',
    'A community coffee tasting and conversation for Black Tech Week participants.',
    '2026-10-09 18:00:00 America/New_York'::timestamptz,
    '2026-10-09 20:00:00 America/New_York'::timestamptz,
    'America/New_York', 'Sin Coffee Lab', '1540 Walnut Street', 'Cincinnati', 'OH', '45202',
    40, 'https://sincoffeecollective.example/rsvp', 'free', 'Community gathering', 2026, 'draft',
    inserted_user.id, inserted_user.id
  FROM inserted_organizer, inserted_user
  RETURNING id, created_by_user_id
), inserted_pipeline AS (
  INSERT INTO event_pipeline (event_id, current_state, pending_on, updated_by_user_id)
  SELECT id, 'draft', 'partner', created_by_user_id
  FROM inserted_event
)
INSERT INTO activity_log (actor_user_id, actor_role, entity_type, entity_id, action, after_data)
SELECT created_by_user_id, 'partner', 'event', id, 'event_created',
  jsonb_build_object('title', 'Coffee testing with Sin', 'event_status', 'draft', 'pending_on', 'partner')
FROM inserted_event;

COMMIT;
