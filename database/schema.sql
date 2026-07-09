CREATE DATABASE IF NOT EXISTS her_own
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE her_own;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS emergency_contacts;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS day_plan_stops;
DROP TABLE IF EXISTS day_plans;
DROP TABLE IF EXISTS living_steps;
DROP TABLE IF EXISTS living_guides;
DROP TABLE IF EXISTS safety_steps;
DROP TABLE IF EXISTS safety_guides;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS place_reviews;
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  city VARCHAR(120) NULL,
  home_area VARCHAR(120) NULL,
  preferred_language ENUM('en', 'ja', 'zh') NOT NULL DEFAULT 'en',
  budget_min_yen INT UNSIGNED NULL,
  budget_max_yen INT UNSIGNED NULL,
  preferences JSON NULL,
  emergency_note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX users_city_index (city),
  INDEX users_language_index (preferred_language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE places (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NULL,
  address VARCHAR(255) NULL,
  city VARCHAR(120) NULL,
  area VARCHAR(120) NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  image_url VARCHAR(255) NULL,
  safe_score DECIMAL(3, 1) NOT NULL DEFAULT 0.0,
  solo_friendly_score DECIMAL(3, 1) NOT NULL DEFAULT 0.0,
  women_friendly_score DECIMAL(3, 1) NOT NULL DEFAULT 0.0,
  budget_level ENUM('free', 'low', 'medium', 'high') NOT NULL DEFAULT 'low',
  average_price_yen INT UNSIGNED NULL,
  price_note VARCHAR(120) NULL,
  opening_hours JSON NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  recommended_reason TEXT NULL,
  women_friendly_notes TEXT NULL,
  solo_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX places_category_index (category),
  INDEX places_city_area_index (city, area),
  INDEX places_budget_index (budget_level, average_price_yen),
  INDEX places_scores_index (safe_score, solo_friendly_score, women_friendly_score),
  INDEX places_geo_index (latitude, longitude),
  INDEX places_active_index (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE place_reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  place_id BIGINT UNSIGNED NOT NULL,
  safe_rating DECIMAL(3, 1) NOT NULL,
  solo_friendly_rating DECIMAL(3, 1) NOT NULL,
  women_friendly_rating DECIMAL(3, 1) NOT NULL,
  visit_context VARCHAR(120) NULL,
  comment TEXT NULL,
  visited_at DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT place_reviews_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT place_reviews_place_fk FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  INDEX place_reviews_user_index (user_id),
  INDEX place_reviews_place_index (place_id),
  INDEX place_reviews_rating_index (safe_rating, solo_friendly_rating, women_friendly_rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favorites (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  place_id BIGINT UNSIGNED NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT favorites_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT favorites_place_fk FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
  UNIQUE KEY favorites_user_place_unique (user_id, place_id),
  INDEX favorites_place_index (place_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE safety_guides (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(160) NOT NULL,
  summary TEXT NULL,
  risk_level ENUM('low', 'medium', 'high', 'emergency') NOT NULL DEFAULT 'medium',
  first_step TEXT NULL,
  say_it_loudly VARCHAR(255) NULL,
  ask_for_help TEXT NULL,
  save_evidence TEXT NULL,
  emergency_actions JSON NULL,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX safety_guides_type_index (type),
  INDEX safety_guides_risk_index (risk_level),
  INDEX safety_guides_order_index (display_order),
  INDEX safety_guides_published_index (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE safety_steps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  safety_guide_id BIGINT UNSIGNED NOT NULL,
  step_order INT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  phrase VARCHAR(255) NULL,
  action_type VARCHAR(80) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT safety_steps_guide_fk FOREIGN KEY (safety_guide_id) REFERENCES safety_guides(id) ON DELETE CASCADE,
  UNIQUE KEY safety_steps_order_unique (safety_guide_id, step_order),
  INDEX safety_steps_action_index (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE living_guides (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  title VARCHAR(160) NOT NULL,
  summary TEXT NULL,
  risk_level ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'low',
  estimated_time_minutes INT UNSIGNED NULL,
  can_do_myself BOOLEAN NOT NULL DEFAULT true,
  tools_needed JSON NULL,
  warning TEXT NULL,
  japanese_phrases JSON NULL,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX living_guides_category_index (category),
  INDEX living_guides_risk_index (risk_level),
  INDEX living_guides_order_index (display_order),
  INDEX living_guides_published_index (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE living_steps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  living_guide_id BIGINT UNSIGNED NOT NULL,
  step_order INT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT living_steps_guide_fk FOREIGN KEY (living_guide_id) REFERENCES living_guides(id) ON DELETE CASCADE,
  UNIQUE KEY living_steps_order_unique (living_guide_id, step_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE day_plans (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  mood VARCHAR(80) NULL,
  duration VARCHAR(80) NULL,
  budget_yen INT UNSIGNED NULL,
  area VARCHAR(120) NULL,
  plan_date DATE NULL,
  notes TEXT NULL,
  is_saved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT day_plans_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX day_plans_user_index (user_id),
  INDEX day_plans_user_date_index (user_id, plan_date),
  INDEX day_plans_mood_area_index (mood, area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE day_plan_stops (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  day_plan_id BIGINT UNSIGNED NOT NULL,
  place_id BIGINT UNSIGNED NULL,
  stop_order INT UNSIGNED NOT NULL,
  start_time TIME NULL,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(80) NULL,
  area VARCHAR(120) NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT day_plan_stops_plan_fk FOREIGN KEY (day_plan_id) REFERENCES day_plans(id) ON DELETE CASCADE,
  CONSTRAINT day_plan_stops_place_fk FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL,
  UNIQUE KEY day_plan_stops_order_unique (day_plan_id, stop_order),
  INDEX day_plan_stops_place_index (place_id),
  INDEX day_plan_stops_category_index (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  body TEXT NULL,
  related_type ENUM('general', 'place', 'safety_guide', 'living_guide', 'day_plan') NOT NULL DEFAULT 'general',
  related_id BIGINT UNSIGNED NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT notes_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX notes_user_index (user_id),
  INDEX notes_related_index (related_type, related_id),
  INDEX notes_pinned_index (user_id, is_pinned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE emergency_contacts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  relation VARCHAR(80) NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(190) NULL,
  preferred_language ENUM('en', 'ja', 'zh') NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  share_location BOOLEAN NOT NULL DEFAULT true,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT emergency_contacts_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX emergency_contacts_user_index (user_id),
  INDEX emergency_contacts_primary_index (user_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
