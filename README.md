# HER OWN

## Concept

**A Room of Her Own. A City of Her Own.**

HER OWN is a front-end prototype for a digital companion designed for women living independently, safely, and freely.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript

## How to Run Locally

Run a local server from the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Important

Do not open `index.html` directly in the browser.

This project uses ES modules, so it needs to be served through a local server.

## Current Version

Front-end prototype.

## Future Plan

- React version
- PHP/MySQL API
- Python recommendation
- HER Assistant AI

## Frontend Demo

The current front-end demo can run on GitHub Pages or through a local static server.

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

The front-end prototype does not require PHP, MySQL, or any build tool.

## Backend Preparation

The `/backend` directory contains a prepared PHP API structure for a future full-stack version.

The `/database` directory contains MySQL schema and seed files:

- `database/schema.sql`
- `database/seed.sql`

Backend requirements for the future full-stack version:

- PHP
- MySQL

Current backend status:

- Prepared PHP API implementation
- API endpoints return JSON from MySQL
- The front-end uses these APIs when available and falls back to local data when unavailable

## PHP API Local Server

Import the database first:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p her_own < database/seed.sql
```

Run the PHP server from the project root:

```bash
php -S localhost:8080
```

Then open API URLs such as:

```text
http://localhost:8080/backend/api/places.php
http://localhost:8080/backend/api/safety-guides.php
http://localhost:8080/backend/api/day-plans.php?user_id=1
```

Optional database environment variables:

```bash
DB_HOST=127.0.0.1 DB_NAME=her_own DB_USER=root DB_PASS= php -S localhost:8080
```

## Frontend API Fallback

The front-end can run without the PHP backend.

- When the PHP API is available, the front-end reads places, guides, favorites, and HER Day plans from MySQL.
- When an API request is unavailable, returns `404`/`500`, or returns invalid JSON, the front-end automatically uses local data from `js/data.js`.
- GitHub Pages continues to work as a standalone front-end demo.

The browser console reports:

```text
API unavailable, using local fallback data.
```
