import { state } from '../state.js';
import { pageShell, sectionHead } from '../components/layout.js';
import { categoryButton, listRow, tabButton } from '../components/cards.js';

export function renderMy() {
  const livingGuides = state.catalogs.livingGuides;
  const savedPlaceCards = state.favoritePlaces
    .map((place) => `<div class="mini-card saved-card"><div class="mini-thumb line-place-thumb" aria-hidden="true"></div><div><strong>${place.name}</strong><p>${place.category} · ${place.distance}</p></div><span>◇</span></div>`)
    .join("");
  const guideCards = livingGuides
    .slice(0, 4)
    .map((guide) => listRow(guide.title, `${guide.category} · ${guide.time}`, "→", "card-arrow"))
    .join("");
  const noteCards = state.notes
    .map((note) => `<article class="note-card"><strong>${note.title}</strong><p>${note.text}</p></article>`)
    .join("");
  const tabContent = state.myTab === "Places"
    ? `<div class="mini-grid">${savedPlaceCards}</div>`
    : state.myTab === "Guides"
      ? `<div class="list-stack">${guideCards}</div>`
      : state.myTab === "Day"
        ? `<div class="list-stack">${state.savedDays.map((day) => listRow(day.title, day.stops.join(" · "), day.area)).join("")}</div>`
        : state.myTab === "Settings"
          ? `<div class="list-stack">${listRow("Location", state.user.locationEnabled ? "Enabled" : "Disabled", "Browser")}${listRow("Budget", state.user.budget, "Default")}</div>`
          : `<div class="notes-grid">${noteCards}</div>`;
  return pageShell(`
    ${sectionHead(
      "My Page",
      "Everything you save, in one quiet place.",
      "Manage your places, HER Day plans, emergency contacts, language, preferences, and location settings."
    )}
    <div class="my-grid">
      <aside class="profile-panel">
        <div class="profile-avatar line-avatar" aria-hidden="true"></div>
        <h2>Hello, Her</h2>
        <p class="section-copy">${state.user.city} · ${state.user.language}</p>
        <div class="guide-meta">
          ${state.user.preferences.map((pref) => `<span class="tag">${pref}</span>`).join("")}
        </div>
        <div class="my-menu">
          ${[
            ["Places", "♡", "My Favorites"],
            ["Day", "▣", "My Day Plans"],
            ["Notes", "□", "My Notes"],
            ["Settings", "◎", "Settings"],
          ]
            .map(([tab, icon, label]) => categoryButton(label, state.myTab === tab, `data-my-tab="${tab}"`, `<span>${icon}</span>`))
            .join("")}
        </div>
      </aside>
      <section class="surface">
        <div class="my-content-head">
          <div>
            <p class="eyebrow">My Favorites</p>
            <div class="tabs compact-tabs">
              ${["Places", "Guides", "Notes"]
                .map((tab) => tabButton(tab, state.myTab === tab, `data-my-tab="${tab}"`))
                .join("")}
            </div>
          </div>
          <button class="text-button" type="button" data-page="places">View all →</button>
        </div>
        ${tabContent}
        ${
          state.myTab === "Notes"
            ? `<form class="note-form" data-note-form><input name="noteTitle" placeholder="Note title" required /><input name="noteText" placeholder="Write a soft reminder..." required /><button class="button" type="submit">Add note</button></form>`
            : ""
        }
        <h3 style="margin: 26px 0 14px;">My Day Plans</h3>
        <div class="list-stack">
          ${state.savedDays
            .map((day) => listRow(day.title, day.stops.join(" · "), day.area))
            .join("")}
        </div>
        <h3 style="margin: 26px 0 14px;">Preference Settings</h3>
        <div class="settings-grid">
          <div class="field"><label>Common city</label><input value="${state.user.city}" /></div>
          <div class="field"><label>Budget range</label><input value="${state.user.budget}" /></div>
          <div class="field"><label>Favorite place types</label><input value="Cafe, Bookstore, Flower Shop" /></div>
          <div class="field"><label>Language</label><input value="${state.user.language}" /></div>
          <div class="toggle-row"><strong>Location</strong><button class="toggle ${state.user.locationEnabled ? "is-on" : ""}" type="button" data-toggle-location aria-label="Toggle location"></button></div>
          <div class="toggle-row"><strong>Quiet-first recommendations</strong><button class="toggle is-on" type="button" aria-label="Toggle quiet-first recommendations"></button></div>
        </div>
        <button class="soft-button" style="margin-top: 18px;" type="button" data-copy="Logged out of prototype">Logout</button>
      </section>
    </div>
  `);
}
