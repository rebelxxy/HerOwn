# HER OWN Project Structure

HER OWN currently keeps the GitHub Pages front-end prototype independent from the prepared PHP/MySQL backend skeleton.

## Root Files

- `index.html`  
  Static app shell. It contains the top navigation, language selector, assistant panel, fake call overlay, CSS links, and the `type="module"` entry script.

- `README.md`  
  Project concept, local run instructions, current version, and future full-stack plan.

- `PROJECT_REVIEW.md`  
  Sprint review report for code quality, structure, maintainability, and recommended next improvements.

## CSS

- `css/base.css`  
  Original base layer and early shared UI styling. Kept first in the cascade.

- `css/layout.css`  
  Core page layout, form, dashboard, assistant, and page composition rules from the original stylesheet.

- `css/components.css`  
  Responsive and design-refresh component layer. Loaded after layout to preserve the existing visual overrides.

- `css/pages.css`  
  Product-page visual layer for the supplied design-board style, including HER Places, HER Day, Safe, Living, and Fake Call presentation rules.

- `css/responsive.css`  
  Final mobile overflow hardening and responsive corrections. Loaded last.

## JavaScript

- `js/main.js`  
  Front-end entry point. Initializes the assistant and router.

- `js/state.js`  
  In-memory prototype state, current language, selected filters, saved places, saved plans, notes, and asset roots.

- `js/data.js`  
  Static prototype data for safety guides, fake call callers, living guides, HER Places, HER Day rules, categories, and icons.

- `js/api.js`  
  PHP API client, backend response normalization, request timeout handling, and automatic local data fallback.

- `js/i18n.js`  
  English, Japanese, and Chinese copy dictionaries plus DOM text synchronization.

- `js/router.js`  
  Hash-based routing, page rendering, event binding, navigation state, and prototype interactions.

## Components

- `js/components/layout.js`  
  Shared page shell and section header helpers.

- `js/components/cards.js`  
  Shared card, chip, tab, row, score, and step markup helpers.

- `js/components/assistant.js`  
  HER Assistant panel rendering, prompt handling, and local prototype replies.

## Pages

- `js/pages/home.js`  
  Landing page and popular nearby places.

- `js/pages/safe.js`  
  Safe page, safety topic selection, action cards, and selected guide detail.

- `js/pages/fakeCall.js`  
  Fake Call page, caller selection, timer selection, and phone overlay behavior.

- `js/pages/sos.js`  
  SOS page, hold interaction, emergency text, and safety map illustration.

- `js/pages/living.js`  
  Living guide categories, guide cards, and selected guide detail.

- `js/pages/places.js`  
  HER Places search, category filters, map pins, selected place popover, and top picks.

- `js/pages/day.js`  
  HER Day rule-based recommendations, plan builder, save, remove, and reorder interactions.

- `js/pages/my.js`  
  My Page saved places, saved day plans, notes, preferences, and location toggle.

## Assets

- `images/`  
  Runtime illustration assets used by the current front-end prototype.

- `images/pictures/`  
  Cropped design-board illustrations used by feature cards, places, categories, moods, map, Living, HER Day, and Fake Call.

- `assets/`  
  Background images used by the CSS visual layers.

## Backend Skeleton

- `backend/config/db.php`  
  Prepared PDO database connection helper for the future PHP/MySQL version.

- `backend/api/*.php`  
  PHP API endpoints backed by MySQL. The front-end attempts these endpoints when available and remains functional through local fallback data.

## Database

- `database/schema.sql`  
  MySQL schema for users, places, reviews, favorites, safety guides, living guides, day plans, notes, and emergency contacts.

- `database/seed.sql`  
  Demo user and sample data for the future full-stack version.
