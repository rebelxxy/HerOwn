# HER OWN Component Guide

This project uses small Vanilla JavaScript template helpers instead of a framework. Components return HTML strings and are composed inside page render functions.

## Layout Components

### `pageShell(content)`

File: `js/components/layout.js`

Wraps page content in the standard page section container.

```js
return pageShell(`
  <div class="surface">Content</div>
`);
```

### `sectionHead(eyebrow, title, copy, action = "")`

File: `js/components/layout.js`

Renders the shared section heading pattern used across product pages.

```js
sectionHead(
  "HER Places",
  "Find gentle places nearby.",
  "Women-friendly places to go alone and feel good.",
  `<button class="text-button" type="button">View all →</button>`
);
```

## Card Components

### `featureMiniCard(title, copy, page, imageSrc)`

File: `js/components/cards.js`

Used on Home for compact feature navigation cards.

```js
featureMiniCard("Safe", "Safety guide, fake call, SOS.", "safe", `${PICTURE_ROOT}006_feature_card_01.png`);
```

### `featureActionCard(imageSrc, title, copy, page)`

File: `js/components/cards.js`

Used on Safe for action cards such as Safety Guide, Fake Call, SOS, and Nearby Help.

```js
featureActionCard(`${PICTURE_ROOT}008_feature_card_03.png`, "SOS", "Send your location and get help.", "sos");
```

### `placeMiniCard(place, imageSrc)`

File: `js/components/cards.js`

Used for non-clickable place summary cards.

```js
placeMiniCard(place, `${PICTURE_ROOT}037_place_01.png`);
```

### `placePickCard(place, imageSrc, options)`

File: `js/components/cards.js`

Used for clickable HER Places recommendation cards.

```js
placePickCard(place, imageSrc, {
  selected: place.id === state.selectedPlace,
  saved: state.savedPlaces.includes(place.id),
});
```

## Control Components

### `filterChip(label, selected, dataAttribute)`

File: `js/components/cards.js`

Used for horizontal filter chips.

```js
filterChip("Cafe", state.selectedPlaceCategory === "Cafe", 'data-place-category="Cafe"');
```

### `choiceChip(label, selected, dataAttribute, imageSrc = "")`

File: `js/components/cards.js`

Used by HER Day for mood, time, budget, and area choices. Passing `imageSrc` creates the mood-chip image version.

```js
choiceChip("Peace", state.dayMood === "Peace", 'data-day-mood="Peace"', `${PICTURE_ROOT}043_mood_chip_01.png`);
```

### `categoryButton(label, selected, dataAttribute, iconHtml = "")`

File: `js/components/cards.js`

Used for sidebar and menu category buttons.

```js
categoryButton("Utilities", state.selectedLivingCategory === "Utilities", 'data-living-category="Utilities"');
```

### `tabButton(label, selected, dataAttribute)`

File: `js/components/cards.js`

Used for compact tab controls in My Page.

```js
tabButton("Places", state.myTab === "Places", 'data-my-tab="Places"');
```

## Data Display Components

### `listRow(title, meta, badge = "", badgeClass = "pill")`

File: `js/components/cards.js`

Used for repeated list rows such as saved guides, saved day plans, and settings.

```js
listRow("Soft Kichijoji afternoon", "11:00 Cafe · 13:00 Bookstore", "Kichijoji");
```

### `stepItem(title, body)`

File: `js/components/cards.js`

Used for repeated guide steps in Safe and Living.

```js
stepItem("First Step", "Move toward a bright public place with staff.");
```

### `scoreText(label, value)`

File: `js/components/cards.js`

Formats prototype score values from 0-100 into 0-5 display text.

```js
scoreText("Safe", place.safe);
```

## Assistant Component

### `renderAssistant()`

File: `js/components/assistant.js`

Renders the local assistant message log and open state.

### `initAssistant()`

File: `js/components/assistant.js`

Binds assistant open, close, prompt, and form submit events.
