# HER OWN Database Design

Sprint 3 focuses only on database design. The current GitHub Pages front-end still runs independently and does not depend on these tables.

## Overview

The schema is designed for a future PHP + MySQL full-stack version of HER OWN. It separates stable content, user-owned content, and ordered step data so the product can grow without storing large nested blobs everywhere.

Core areas:

- Identity and preferences: `users`
- HER Places: `places`, `place_reviews`, `favorites`
- Safe: `safety_guides`, `safety_steps`
- Living: `living_guides`, `living_steps`
- HER Day: `day_plans`, `day_plan_stops`
- My Page: `notes`, `emergency_contacts`

Every table includes:

- `id`
- `created_at`
- `updated_at`
- indexes for common future API queries
- foreign keys where a row belongs to another table

## Tables

### `users`

Stores the account owner, city, home area, preferred language, budget range, and preference JSON.

Used by:

- login/profile APIs
- My Page settings
- saved places and day plans
- future recommendations using budget, preferred areas, and preferred place types

### `places`

Stores HER Places map data: category, address, area, coordinates, image path, safety scores, solo/women-friendly scores, budget, opening hours, and recommendation notes.

Used by:

- HER Places list/search/map APIs
- place detail APIs
- HER Day recommendation candidates
- Python recommendation scoring

Key indexes:

- category
- city + area
- budget
- score fields
- latitude + longitude
- active flag

### `place_reviews`

Stores user reviews for a place, including separate safety, solo-friendly, and women-friendly ratings.

Relationship:

- many reviews belong to one `place`
- many reviews belong to one `user`

Used by:

- place detail APIs
- score aggregation
- future recommendation weighting

### `favorites`

Stores places saved by a user.

Relationship:

- one user can favorite many places
- one place can be favorited by many users
- unique pair: `user_id + place_id`

Used by:

- My Places API
- save/unsave place API
- recommendation personalization

### `safety_guides`

Stores top-level Safe guide content such as Train Harassment, Being Followed, Walking Home, Stranger at Door, Unsafe Ride, and Emergency.

The main guide table keeps summary-level fields:

- risk level
- first step
- phrase to say loudly
- help instructions
- evidence instructions
- emergency action list

Used by:

- Safe guide list/detail APIs
- HER Assistant grounding for safety answers

### `safety_steps`

Stores ordered steps for each `safety_guide`.

Relationship:

- one safety guide has many safety steps
- steps are ordered by `step_order`

Why separate:

- makes guide details easier to edit and reorder
- avoids storing ordered UI content inside one large JSON blob

### `living_guides`

Stores top-level Living guide content by category: Rent, Utilities, Home Fix, Cleaning, Moving, and Disaster.

Fields include:

- risk level
- estimated time
- whether the user can do it herself
- tools needed
- warning
- useful Japanese phrases

Used by:

- Living guide list/detail APIs
- HER Assistant grounding for daily living questions
- future recommendation around solo-living needs

### `living_steps`

Stores ordered step-by-step instructions for each `living_guide`.

Relationship:

- one living guide has many living steps
- steps are ordered by `step_order`

### `day_plans`

Stores one saved HER Day plan for a user.

Fields include:

- mood
- duration
- budget
- area
- plan date
- notes

Used by:

- My HER Day API
- save HER Day API
- future recommendation learning from saved moods, budgets, and areas

### `day_plan_stops`

Stores ordered stops inside a HER Day plan.

Relationship:

- one day plan has many stops
- a stop can optionally reference a real `place`
- stops stay useful even if a place is removed because `place_id` uses `ON DELETE SET NULL`

Used by:

- HER Day plan detail API
- reorder/remove stops API
- recommendation analysis of common place sequences

### `notes`

Stores user notes for My Page.

Notes can be general or loosely related to:

- a place
- a safety guide
- a living guide
- a day plan

Why loose relation:

- `related_type + related_id` supports multiple content types without creating many small note join tables
- user ownership is still enforced with a real foreign key to `users`

### `emergency_contacts`

Stores emergency contacts for SOS and safety flows.

Fields include:

- relation
- phone
- email
- preferred language
- primary contact flag
- location-sharing permission flag

Used by:

- SOS API
- My Page emergency contact settings
- future safe-mode flows

## Relationships

- `users` 1 -> many `place_reviews`
- `users` 1 -> many `favorites`
- `users` 1 -> many `day_plans`
- `users` 1 -> many `notes`
- `users` 1 -> many `emergency_contacts`
- `places` 1 -> many `place_reviews`
- `places` 1 -> many `favorites`
- `places` 1 -> many `day_plan_stops`
- `safety_guides` 1 -> many `safety_steps`
- `living_guides` 1 -> many `living_steps`
- `day_plans` 1 -> many `day_plan_stops`

## Why This Design

The design keeps content and user activity separate:

- places are reusable public content
- reviews/favorites are user actions
- guides are editorial content
- steps are ordered child records
- day plans are user-owned saved itineraries
- notes and emergency contacts belong only to the user

This makes the future API simpler:

- list endpoints can query parent tables
- detail endpoints can join parent + steps
- My Page endpoints can query by `user_id`
- recommendation systems can read structured scores, categories, budgets, locations, favorites, reviews, and saved plans

## Future PHP API Usage

These tables can support future endpoints such as:

- `GET /api/places`
- `GET /api/places/{id}`
- `POST /api/favorites`
- `DELETE /api/favorites/{place_id}`
- `GET /api/safety-guides`
- `GET /api/living-guides`
- `GET /api/day-plans`
- `POST /api/day-plans`
- `GET /api/notes`
- `POST /api/notes`
- `GET /api/emergency-contacts`

The front-end is not connected to these APIs yet.

## Future Python Recommendation Usage

Python recommendation logic can use:

- `users.preferences`
- `users.budget_min_yen`
- `users.budget_max_yen`
- `places.category`
- `places.area`
- `places.safe_score`
- `places.solo_friendly_score`
- `places.women_friendly_score`
- `places.budget_level`
- `places.average_price_yen`
- `place_reviews` ratings
- `favorites`
- `day_plans.mood`
- `day_plans.area`
- `day_plan_stops` ordered category sequences

Possible recommendation examples:

- Peace + low budget -> cafe, bookstore, park
- Night walk -> high safe score + bright public areas + open-late places
- Self-care -> gym, clinic, healthy solo restaurant
- User frequently favorites bookstores -> prioritize bookstore/cafe routes

## Current Demo Seed Coverage

`seed.sql` currently includes:

- 1 demo user
- 9 HER Places
- 6 Safe Guides
- 24 Safe Steps
- 6 Living Guides
- 18 Living Steps
- 1 demo HER Day plan
- 4 HER Day stops
- 3 favorites
- 3 reviews
- 2 notes
- 2 emergency contacts
