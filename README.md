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

## Add to Home Screen

HER OWN includes a lightweight Web App Manifest for GitHub Pages project sites.
It uses relative `start_url` and `scope` values, so the installed app works when
the repository is hosted below a project path instead of the domain root.

- App manifest: `manifest.webmanifest`
- App icons: `assets/icons/icon-192.png`, `assets/icons/icon-512.png`, and `assets/icons/apple-touch-icon.png`
- No service worker is registered. Assistant responses, PHP API responses, and user-specific data are not cached.

On iPhone, open the deployed GitHub Pages URL in Safari, tap Share, choose **Add
to Home Screen**, keep the name `HER OWN`, and tap Add. On Android Chrome, open
the site menu and choose **Install app** or **Add to Home screen**.

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
