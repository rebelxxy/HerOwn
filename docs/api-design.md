# HER OWN API Design

Sprint 4 implements PHP endpoints that return JSON from MySQL. The static front-end is still independent and does not require these APIs.

## Response Format

Success:

```json
{
  "success": true,
  "data": []
}
```

Error:

```json
{
  "success": false,
  "message": "Failed to load places."
}
```

## Database Configuration

The API reads these environment variables:

- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `DB_PORT` optional, default `3306`

Default local values:

- host: `127.0.0.1`
- database: `her_own`
- user: `root`
- password: empty

## `GET /backend/api/places.php`

Returns active HER Places.

Query params:

- `category` optional, for example `Cafe`
- `area` optional, for example `Kichijoji`
- `search` optional, searches name, category, description, address, and area

Example:

```text
/backend/api/places.php?category=Cafe&area=Shibuya&search=coffee
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Standalone Coffee",
      "category": "Cafe",
      "area": "Shibuya",
      "safe_score": "4.8",
      "opening_hours": {
        "monFri": "08:00-20:00"
      }
    }
  ]
}
```

## `GET /backend/api/safety-guides.php`

Returns published Safe guides with ordered `steps`.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "train-harassment",
      "title": "Train Harassment",
      "emergency_actions": ["Fake Call", "SOS", "Nearby Police"],
      "steps": [
        {
          "step_order": 1,
          "title": "First Step",
          "body": "Move to a visible place near other passengers or station staff."
        }
      ]
    }
  ]
}
```

## `GET /backend/api/living-guides.php`

Returns published Living guides with ordered `steps`.

Query params:

- `category` optional, for example `Rent`, `Utilities`, or `Disaster`

Example:

```text
/backend/api/living-guides.php?category=Utilities
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "category": "Utilities",
      "title": "How to Set Up Utilities",
      "tools_needed": ["Lease contract", "Residence card"],
      "japanese_phrases": ["電気を開始したいです。"],
      "steps": []
    }
  ]
}
```

## `GET /backend/api/favorites.php`

Returns saved places for one user.

Query params:

- `user_id` required

Example:

```text
/backend/api/favorites.php?user_id=1
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "favorite_id": 1,
      "favorite_note": "Good first stop for a peaceful HER Day.",
      "id": 1,
      "name": "Standalone Coffee"
    }
  ]
}
```

## `POST /backend/api/favorites.php`

Saves a place for a user. If the favorite already exists, it updates the note.

Request body:

```json
{
  "user_id": 1,
  "place_id": 2,
  "note": "Save for inspiration days."
}
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "favorite_id": 1,
      "name": "Standalone Coffee"
    }
  ]
}
```

## `GET /backend/api/day-plans.php`

Returns saved HER Day plans for one user. Each plan includes `stops`.

Query params:

- `user_id` required

Example:

```text
/backend/api/day-plans.php?user_id=1
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Peaceful Saturday Plan",
      "mood": "Peace",
      "stops": [
        {
          "stop_order": 1,
          "start_time": "11:00:00",
          "title": "Standalone Coffee"
        }
      ]
    }
  ]
}
```

## `POST /backend/api/day-plans.php`

Saves a HER Day plan and its stops in one transaction.

Request body:

```json
{
  "user_id": 1,
  "title": "Soft Kichijoji Afternoon",
  "mood": "Peace",
  "duration": "Half day",
  "budget_yen": 3000,
  "area": "Kichijoji",
  "plan_date": "2026-07-11",
  "notes": "A slow day with coffee and books.",
  "stops": [
    {
      "place_id": 1,
      "start_time": "11:00:00",
      "title": "Standalone Coffee",
      "category": "Cafe",
      "area": "Shibuya",
      "note": "Start with journaling."
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "plans": []
  }
}
```

## `GET /backend/api/notes.php`

Returns notes for one user.

Query params:

- `user_id` required

## `POST /backend/api/notes.php`

Creates a note.

Request body:

```json
{
  "user_id": 1,
  "title": "First apartment checklist",
  "body": "Save utility numbers.",
  "related_type": "general",
  "is_pinned": true
}
```

## `GET /backend/api/assistant.php`

Returns published guide data that can ground a deterministic prototype assistant.

Query params:

- `search` optional

## `POST /backend/api/assistant.php`

Returns a deterministic safety-first reply and related guides from MySQL. This does not use OpenAI.

Request body:

```json
{
  "message": "I feel like someone is following me."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "reply": "Start by checking your immediate safety...",
    "guides": []
  }
}
```
