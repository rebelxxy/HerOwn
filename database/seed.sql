USE her_own;

INSERT INTO users (
  id,
  name,
  email,
  password_hash,
  city,
  home_area,
  preferred_language,
  budget_min_yen,
  budget_max_yen,
  preferences,
  emergency_note
) VALUES (
  1,
  'Xiao Demo',
  'demo@her-own.test',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llCqqzC0.b5b1yQ4edB1S',
  'Tokyo',
  'Kichijoji',
  'en',
  1000,
  5000,
  JSON_OBJECT(
    'vibe', JSON_ARRAY('quiet', 'women-friendly', 'budget'),
    'areas', JSON_ARRAY('Shinjuku', 'Kichijoji', 'Ueno', 'Shimokitazawa'),
    'placeTypes', JSON_ARRAY('Cafe', 'Bookstore', 'Flower', 'Park'),
    'safetyPreference', 'well-lit and staffed'
  ),
  'If I feel unsafe, contact Mina first and share my current location.'
);

INSERT INTO places (
  id,
  name,
  category,
  description,
  address,
  city,
  area,
  latitude,
  longitude,
  image_url,
  safe_score,
  solo_friendly_score,
  women_friendly_score,
  budget_level,
  average_price_yen,
  price_note,
  opening_hours,
  recommended_reason,
  women_friendly_notes,
  solo_notes
) VALUES
(1, 'Standalone Coffee', 'Cafe', 'A calm neighborhood cafe with window seats and gentle afternoon light.', '1-2-3 Jingumae, Shibuya-ku', 'Tokyo', 'Shibuya', 35.6711000, 139.7046000, 'images/pictures/037_place_01.png', 4.8, 4.7, 4.8, 'low', 900, 'Coffee from 550 yen', JSON_OBJECT('monFri', '08:00-20:00', 'satSun', '09:00-19:00'), 'Good for reading, journaling, and a quiet reset between errands.', 'Bright seating, visible staff counter, and many solo visitors.', 'Counter seats and small tables make solo time feel natural.'),
(2, 'Nagi Bookstore', 'Bookstore', 'An independent bookstore with essays, art books, and a small reading corner.', '2-8-10 Kichijoji Honcho, Musashino', 'Tokyo', 'Kichijoji', 35.7042000, 139.5788000, 'images/pictures/038_place_02.png', 4.9, 4.8, 4.9, 'low', 1400, 'Books and zines from 700 yen', JSON_OBJECT('daily', '10:00-21:00'), 'A soft place for inspiration without needing to talk to anyone.', 'Friendly staff, open aisles, and quiet atmosphere.', 'Easy to browse slowly alone.'),
(3, 'Hana Flower Shop', 'Flower', 'A tiny flower shop for buying one stem, not a whole bouquet.', '4-6-2 Ueno, Taito-ku', 'Tokyo', 'Ueno', 35.7089000, 139.7747000, 'images/pictures/039_place_03.png', 4.7, 4.6, 4.8, 'low', 800, 'Single stems from 300 yen', JSON_OBJECT('daily', '11:00-19:00'), 'A small ritual for romanticizing an ordinary day.', 'Staff are patient with beginners and small purchases.', 'Quick, gentle stop that fits between cafe and park time.'),
(4, 'Riverside Park', 'Park', 'A riverside walk with open paths, benches, and evening lights.', '5-1 Sumida, Sumida-ku', 'Tokyo', 'Asakusa', 35.7102000, 139.8015000, 'images/pictures/040_place_04.png', 4.6, 4.5, 4.6, 'free', 0, 'Free', JSON_OBJECT('daily', 'Open 24 hours'), 'Best for a slow walk when you want air and space.', 'Open sightlines and nearby convenience stores.', 'Comfortable for a short solo walk before sunset.'),
(5, 'Quiet Gallery Room', 'Museum', 'A compact gallery with rotating exhibitions and a peaceful lounge.', '3-4-8 Shimokitazawa, Setagaya-ku', 'Tokyo', 'Shimokitazawa', 35.6614000, 139.6660000, 'images/pictures/041_place_05.png', 4.6, 4.8, 4.7, 'medium', 1200, 'Entry from 1200 yen', JSON_OBJECT('wedMon', '11:00-18:00', 'tue', 'Closed'), 'A small culture stop for a half-day inspiration plan.', 'Clear front desk and calm visitor flow.', 'Quiet rooms make solo viewing feel intentional.'),
(6, 'Luna Studio Gym', 'Gym', 'A small studio gym with women-friendly classes and a bright reception desk.', '3-8 Shinjuku, Shinjuku-ku', 'Tokyo', 'Shinjuku', 35.6909000, 139.7034000, 'images/pictures/037_place_01.png', 4.5, 4.3, 4.8, 'medium', 1800, 'Trial lesson from 1800 yen', JSON_OBJECT('daily', '07:00-22:00'), 'Good for self-care days when structure helps.', 'Staff explain first-visit flow and locker areas are clearly managed.', 'Beginner classes make it easy to arrive alone.'),
(7, 'Sora Women Clinic', 'Clinic', 'A clinic with a calm check-in flow and privacy-conscious waiting area.', '2-6 Ueno, Taito-ku', 'Tokyo', 'Ueno', 35.7078000, 139.7759000, 'images/pictures/038_place_02.png', 4.9, 4.2, 5.0, 'medium', 2500, 'Insurance accepted', JSON_OBJECT('monSat', '09:00-18:00', 'sun', 'Closed'), 'Helpful for practical self-care and first-time appointments.', 'Female doctor days and privacy options are explained clearly.', 'Check-in is simple enough to do alone.'),
(8, 'Yuzu Solo Table', 'Solo Restaurant', 'A small restaurant designed around counter seats and one-person dinners.', '5-11 Kitazawa, Setagaya-ku', 'Tokyo', 'Shimokitazawa', 35.6625000, 139.6679000, 'images/pictures/039_place_03.png', 4.4, 4.9, 4.6, 'medium', 1800, 'Lunch from 1200 yen', JSON_OBJECT('daily', '11:30-22:00'), 'Dinner alone feels ordinary here.', 'Staff ask seating preference and the entrance faces a lively street.', 'Single seats are intentional, not an afterthought.'),
(9, 'Lantern Walk Street', 'Night Walk Spot', 'A bright shopping street route with late shops and station access.', 'Station north shopping street, Musashino', 'Tokyo', 'Kichijoji', 35.7047000, 139.5797000, 'images/nightwalk.png', 4.3, 4.5, 4.4, 'free', 0, 'Free', JSON_OBJECT('daily', '18:00-23:00 recommended'), 'Useful as a safer short route home.', 'Bright storefronts and convenience stores along the street.', 'Good for a short night walk without entering quiet roads.');

INSERT INTO place_reviews (
  user_id,
  place_id,
  safe_rating,
  solo_friendly_rating,
  women_friendly_rating,
  visit_context,
  comment,
  visited_at
) VALUES
(1, 1, 4.8, 4.7, 4.8, 'weekday morning', 'Warm staff and enough solo seats near the window.', '2026-06-20'),
(1, 2, 4.9, 4.8, 4.9, 'weekend afternoon', 'Easy to spend thirty quiet minutes without feeling watched.', '2026-06-24'),
(1, 9, 4.4, 4.5, 4.4, 'early evening', 'The route felt better than the shortcut because shops were still open.', '2026-07-02');

INSERT INTO favorites (user_id, place_id, note) VALUES
(1, 1, 'Good first stop for a peaceful HER Day.'),
(1, 2, 'Save for inspiration days.'),
(1, 3, 'Buy one flower before going home.');

INSERT INTO safety_guides (
  id,
  slug,
  type,
  title,
  summary,
  risk_level,
  first_step,
  say_it_loudly,
  ask_for_help,
  save_evidence,
  emergency_actions,
  display_order
) VALUES
(1, 'train-harassment', 'train', 'Train Harassment', 'Steps for moving toward visibility and asking for help on public transit.', 'high', 'Move toward a crowded area, station staff, or a door where others can see you.', 'やめてください！', 'Ask station staff, nearby passengers, or police for help.', 'Record time, train line, car number, station, and what happened when it is safe.', JSON_ARRAY('Fake Call', 'SOS', 'Nearby Police'), 1),
(2, 'being-followed', 'street', 'Being Followed', 'Simple actions for creating distance, finding light, and contacting help.', 'high', 'Do not go home directly. Move to a bright public place with staff.', '助けてください。', 'Enter a convenience store, station, cafe, or police box and ask staff to stay with you.', 'Write down the location, time, appearance, and direction only after reaching safety.', JSON_ARRAY('Fake Call', 'SOS', 'Nearby Police', 'Share Location'), 2),
(3, 'walking-home', 'night-walk', 'Walking Home', 'A calmer route checklist for going home late.', 'medium', 'Choose lit streets, stations, convenience stores, and roads with people nearby.', '近くまで一緒にいてもらえますか？', 'Call a friend, station staff, store staff, or police box if the route feels unsafe.', 'Save the route, time, and any specific place that felt unsafe.', JSON_ARRAY('Fake Call', 'Share Location', 'Nearby Convenience Store'), 3),
(4, 'stranger-at-door', 'home', 'Stranger at Door', 'What to do when someone knocks or rings unexpectedly.', 'medium', 'Keep the door locked and speak through the door or intercom.', 'どちら様ですか？用件を教えてください。', 'Contact building management, a trusted contact, or police if they do not leave.', 'Record time, claimed company, and anything shown through the intercom.', JSON_ARRAY('Fake Call', 'Emergency Contact', 'Call Police'), 4),
(5, 'unsafe-ride', 'ride', 'Unsafe Ride', 'Actions for taxis or rideshares when the route or driver feels wrong.', 'high', 'Share your live location and keep your own map open.', 'ここで降ります。', 'Ask to stop at a convenience store, station, hotel, or busy crossing.', 'Save plate number, driver name, route, receipt, and time.', JSON_ARRAY('Share Location', 'Fake Call', 'SOS'), 5),
(6, 'emergency', 'emergency', 'Emergency', 'Immediate actions when you cannot safely leave or need urgent help.', 'emergency', 'Call 110 for police in Japan. If injured or in medical danger, call 119.', '助けてください！警察を呼んでください！', 'Ask a specific person nearby to call police or staff.', 'Only record details after you are safe.', JSON_ARRAY('Call 110', 'Call 119', 'Share Location', 'Emergency Contacts'), 6);

INSERT INTO safety_steps (
  safety_guide_id,
  step_order,
  title,
  body,
  phrase,
  action_type
) VALUES
(1, 1, 'First Step', 'Move to a visible place near other passengers or station staff.', NULL, 'move'),
(1, 2, 'Say It Loudly', 'Use a clear voice so people around you understand something is wrong.', 'やめてください！', 'speak'),
(1, 3, 'Ask For Help', 'Point to a station staff member or nearby passenger and ask directly.', '駅員さんを呼んでください。', 'help'),
(1, 4, 'Save Evidence', 'When safe, save the time, line, car number, and station.', NULL, 'record'),
(2, 1, 'Do Not Go Home', 'Change direction toward a staffed and well-lit public place.', NULL, 'move'),
(2, 2, 'Call Or Fake Call', 'Make it visible that someone is expecting you or tracking your location.', NULL, 'call'),
(2, 3, 'Ask Staff', 'Tell staff you feel unsafe and ask to wait inside.', '後をつけられている気がします。ここで待ってもいいですか。', 'help'),
(2, 4, 'Share Details', 'Send your location and a short message to an emergency contact.', NULL, 'share'),
(3, 1, 'Choose Light', 'Use streets with lamps, open stores, stations, and people.', NULL, 'route'),
(3, 2, 'Stay Connected', 'Start a call or Fake Call before leaving the station.', NULL, 'call'),
(3, 3, 'Avoid Shortcuts', 'Skip parks, underpasses, empty alleys, and quiet stairways.', NULL, 'route'),
(3, 4, 'Prepare Arrival', 'Have keys ready and look around before entering your building.', NULL, 'arrive'),
(4, 1, 'Keep Locked', 'Do not open the door chain or say you are alone.', NULL, 'secure'),
(4, 2, 'Ask Clearly', 'Ask for name, company, and purpose through the door or intercom.', 'どちら様ですか？', 'speak'),
(4, 3, 'Verify', 'Use official phone numbers or apps to confirm delivery or utility visits.', NULL, 'verify'),
(4, 4, 'Escalate', 'If they do not leave, contact management, a trusted person, or police.', NULL, 'help'),
(5, 1, 'Open Your Map', 'Keep your own route visible and share live location.', NULL, 'share'),
(5, 2, 'State Details', 'Say the plate, driver name, and route out loud on a call.', NULL, 'call'),
(5, 3, 'Exit Publicly', 'Ask to stop somewhere bright and staffed.', 'ここで降ります。', 'exit'),
(5, 4, 'Report Safely', 'Save receipt, route, time, and report after leaving safely.', NULL, 'record'),
(6, 1, 'Call Emergency Services', 'Call 110 for police or 119 for medical/fire emergency in Japan.', NULL, 'call'),
(6, 2, 'Be Visible', 'Move toward light, people, cameras, or an open business if possible.', NULL, 'move'),
(6, 3, 'Use Short Words', 'Say where you are, what is happening, and what you need.', '助けてください！', 'speak'),
(6, 4, 'Do Not Delay', 'Use emergency services before app features when danger is immediate.', NULL, 'urgent');

INSERT INTO living_guides (
  id,
  slug,
  category,
  title,
  summary,
  risk_level,
  estimated_time_minutes,
  can_do_myself,
  tools_needed,
  warning,
  japanese_phrases,
  display_order
) VALUES
(1, 'apartment-viewing-safety', 'Rent', 'Apartment Viewing Safety Check', 'A room checklist for first-time independent living.', 'low', 20, true, JSON_ARRAY('Phone camera', 'Checklist', 'Station map'), 'If an agent pressures you to decide immediately, step away and compare options.', JSON_ARRAY('この周辺は夜も明るいですか？', '女性の一人暮らしでも安心ですか？'), 1),
(2, 'set-up-utilities', 'Utilities', 'How to Set Up Utilities', 'A beginner-friendly checklist for electricity, gas, water, and internet.', 'low', 30, true, JSON_ARRAY('Lease contract', 'Residence card', 'Phone number', 'Bank or card details'), 'For gas, some apartments require an in-person opening appointment.', JSON_ARRAY('電気を開始したいです。', 'ガスの開栓を予約したいです。'), 2),
(3, 'toilet-keeps-running', 'Home Fix', 'Toilet Keeps Running', 'A low-risk first check before calling building management.', 'low', 10, true, JSON_ARRAY('Towel', 'Phone camera', 'Building management contact'), 'If water is overflowing or leaking onto the floor, call management immediately.', JSON_ARRAY('トイレの水が止まりません。', '修理をお願いできますか。'), 3),
(4, 'prevent-bathroom-mold', 'Cleaning', 'Prevent Bathroom Mold', 'Small daily habits for keeping a compact bathroom healthier.', 'low', 8, true, JSON_ARRAY('Vent fan', 'Squeegee', 'Cleaning gloves', 'Mold spray'), 'Use ventilation and gloves when using cleaning spray.', JSON_ARRAY('浴室のカビを防ぎたいです。', '換気扇の使い方を教えてください。'), 4),
(5, 'first-night-moving-kit', 'Moving', 'First-Night Moving Kit', 'A simple bag for the first night before every box is open.', 'low', 30, true, JSON_ARRAY('Small suitcase', 'Chargers', 'Towel', 'Medication', 'Trash bags'), 'Do not let movers or delivery staff see sensitive documents or spare keys.', JSON_ARRAY('荷物はここに置いてください。', '確認してからサインします。'), 5),
(6, 'earthquake-basics', 'Disaster', 'Earthquake Basics For Your Room', 'Prepare your room for shaking, power loss, and evacuation.', 'medium', 40, false, JSON_ARRAY('Emergency bag', 'Water', 'Flashlight', 'Battery', 'Furniture stoppers'), 'For gas smell, structural damage, or injury, leave and contact emergency services.', JSON_ARRAY('避難場所はどこですか？', 'ガスの元栓を確認したいです。'), 6);

INSERT INTO living_steps (
  living_guide_id,
  step_order,
  title,
  body
) VALUES
(1, 1, 'Check The Route', 'Visit once during daylight and once near evening if possible.'),
(1, 2, 'Check Shared Areas', 'Look at entrance locks, elevator visibility, lighting, and nearby convenience stores.'),
(1, 3, 'Ask About Emergencies', 'Ask how repairs, lost keys, and emergency notices are handled.'),
(2, 1, 'Confirm Providers', 'Check your lease or move-in documents for required utility providers.'),
(2, 2, 'Book Gas Opening', 'If gas is used, book an opening appointment before your first cooking or bath day.'),
(2, 3, 'Save Account Numbers', 'Keep customer numbers and emergency phone numbers in My Page notes.'),
(3, 1, 'Check The Handle', 'Make sure the handle has fully returned to its resting position.'),
(3, 2, 'Open The Tank Carefully', 'If allowed by your lease, take a photo before touching anything inside.'),
(3, 3, 'Call Management', 'Call management if the sound continues or you see leaking water.'),
(4, 1, 'Ventilate', 'Run the ventilation fan during and after showers.'),
(4, 2, 'Remove Water', 'Wipe walls, mirror edges, and silicone lines after bathing.'),
(4, 3, 'Clean Weekly', 'Clean before dark spots spread and keep bottles off the floor when possible.'),
(5, 1, 'Pack Essentials', 'Keep chargers, towel, toiletries, medication, and trash bags in one visible bag.'),
(5, 2, 'Keep Documents Close', 'Keep keys, contract documents, cash, and ID together.'),
(5, 3, 'Set Up Basics First', 'Set up light, bedding, water, and phone charging before decoration.'),
(6, 1, 'Secure Heavy Items', 'Keep heavy items low and secure shelves near your bed.'),
(6, 2, 'Prepare Supplies', 'Store water, snacks, flashlight, battery, medication, and copies of documents.'),
(6, 3, 'Know The Exit', 'Learn your nearest evacuation site and building exit route.');

INSERT INTO day_plans (
  id,
  user_id,
  title,
  mood,
  duration,
  budget_yen,
  area,
  plan_date,
  notes
) VALUES (
  1,
  1,
  'Peaceful Saturday Plan',
  'Peace',
  'Half day',
  3000,
  'Kichijoji',
  '2026-07-11',
  'A slow day with coffee, books, and one small flower.'
);

INSERT INTO day_plan_stops (
  day_plan_id,
  place_id,
  stop_order,
  start_time,
  title,
  category,
  area,
  note
) VALUES
(1, 1, 1, '11:00:00', 'Standalone Coffee', 'Cafe', 'Shibuya', 'Start with coffee and journaling.'),
(1, 2, 2, '13:00:00', 'Nagi Bookstore', 'Bookstore', 'Kichijoji', 'Browse essays and art books.'),
(1, 3, 3, '15:00:00', 'Hana Flower Shop', 'Flower', 'Ueno', 'Buy one stem for the room.'),
(1, 4, 4, '16:00:00', 'Riverside Park', 'Park', 'Asakusa', 'Walk before sunset.');

INSERT INTO notes (
  user_id,
  title,
  body,
  related_type,
  related_id,
  is_pinned
) VALUES
(1, 'First apartment checklist', 'Save emergency contacts, utility numbers, and nearby safe places.', 'general', NULL, true),
(1, 'Favorite quiet route', 'Cafe to bookstore to flower shop feels easy on low-energy days.', 'day_plan', 1, false);

INSERT INTO emergency_contacts (
  user_id,
  name,
  relation,
  phone,
  email,
  preferred_language,
  is_primary,
  share_location,
  notes
) VALUES
(1, 'Mina', 'Friend', '+81-90-0000-0001', 'mina@example.test', 'ja', true, true, 'Can call in Japanese or English.'),
(1, 'Mom', 'Family', '+81-90-0000-0002', NULL, 'zh', false, true, 'Use for Fake Call template and check-ins.');
