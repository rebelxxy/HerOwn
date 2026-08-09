import { state } from '../state.js';
import { t } from '../i18n.js';
import { pageShell, sectionHead } from '../components/layout.js';
import { categoryButton, listRow } from '../components/cards.js';

function dayPlanMeta(day) {
  const meta = [day.area, day.duration, day.budget].filter(Boolean).join(" · ");
  const stops = Array.isArray(day.stops) ? day.stops.join(" · ") : "";
  return [meta, stops].filter(Boolean).join(" — ");
}

function renderDayPlans() {
  return state.savedDays.length
    ? state.savedDays.map((day) => {
      const isConfirming = state.pendingDeleteDayId === day.id;
      return `
        <article class="list-row day-plan-card">
          <div>
            <strong>${day.title}</strong>
            <span>${dayPlanMeta(day)}</span>
          </div>
          <div class="day-plan-actions">
            <button class="soft-button" type="button" data-open-day-plan="${day.id}">Open</button>
            <button class="text-button" type="button" data-request-delete-day="${day.id}">Delete</button>
          </div>
          ${
            isConfirming
              ? `
                <div class="delete-confirm">
                  <span>Delete this day plan?</span>
                  <button class="soft-button" type="button" data-confirm-delete-day="${day.id}">Confirm</button>
                  <button class="text-button" type="button" data-cancel-delete-day>Cancel</button>
                </div>
              `
              : ""
          }
        </article>
      `;
    }).join("")
    : `<div class="list-row"><div><strong>No saved plans yet</strong><span>Save a HER Day plan to see it here.</span></div></div>`;
}

function renderSavedPlaces() {
  return state.favoritePlaces.length
    ? state.favoritePlaces.map((place) => `
      <article class="mini-card saved-card saved-manage-card">
        <div class="mini-thumb line-place-thumb" aria-hidden="true"></div>
        <div>
          <strong>${place.name}</strong>
          <p>${place.category} · ${place.distance}</p>
        </div>
        <div class="day-plan-actions">
          <button class="soft-button" type="button" data-open-saved-place="${place.id}">Open</button>
          <button class="text-button" type="button" data-remove-saved-place="${place.id}">Remove</button>
        </div>
      </article>
    `).join("")
    : `<div class="list-row"><div><strong>No saved places yet</strong><span>Save a HER Place to see it here.</span></div></div>`;
}

function renderSavedGuides(livingGuides) {
  const savedGuides = state.savedGuideIds
    .map((guideId) => livingGuides.find((guide) => guide.id === guideId))
    .filter(Boolean);

  return savedGuides.length
    ? savedGuides
      .map((guide) => {
        const isConfirming = state.pendingRemoveGuideId === guide.id;
        return `
          <article class="list-row day-plan-card">
            <div>
              <strong>${guide.title}</strong>
              <span>${guide.category} · Risk ${guide.riskLevel || guide.risk || "Low"}</span>
            </div>
            <div class="day-plan-actions">
              <button class="soft-button" type="button" data-open-saved-guide="${guide.id}">Open</button>
              <button class="text-button" type="button" data-request-remove-guide="${guide.id}">Remove</button>
            </div>
            ${
              isConfirming
                ? `
                  <div class="delete-confirm">
                    <span>Remove this guide from saved items?</span>
                    <button class="soft-button" type="button" data-confirm-remove-guide="${guide.id}">Confirm</button>
                    <button class="text-button" type="button" data-cancel-remove-guide>Cancel</button>
                  </div>
                `
                : ""
            }
          </article>
        `;
      })
      .join("")
    : `<div class="list-row"><div><strong>No saved guides yet</strong><span>Save a HER Living guide to see it here.</span></div></div>`;
}

function formatNoteDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}

function renderNotes() {
  if (!state.notes.length) {
    return `
      <div class="surface living-empty-state">
        <strong>No notes yet.</strong>
        <p>Keep small reminders, useful phrases, or things you want to remember here.</p>
      </div>
    `;
  }

  return `
    <div class="notes-grid">
      ${state.notes.map((note) => {
        const content = note.content || note.text || "";
        const isExpanded = state.expandedNoteId === note.id;
        const isConfirming = state.pendingDeleteNoteId === note.id;
        const isLong = content.length > 180;
        return `
          <article class="note-card manageable-note ${isExpanded ? "is-expanded" : ""}">
            <strong>${note.title || "Untitled note"}</strong>
            <p>${content}</p>
            <span class="note-date">${formatNoteDate(note.createdAt)}</span>
            ${isLong ? `<button class="text-button" type="button" data-toggle-note="${note.id}">${isExpanded ? "Collapse" : "Read more"}</button>` : ""}
            <div class="day-plan-actions">
              <button class="soft-button" type="button" data-edit-note="${note.id}">Edit</button>
              <button class="text-button" type="button" data-request-delete-note="${note.id}">Delete</button>
            </div>
            ${
              isConfirming
                ? `
                  <div class="delete-confirm">
                    <span>Delete this note?</span>
                    <button class="soft-button" type="button" data-confirm-delete-note="${note.id}">Confirm</button>
                    <button class="text-button" type="button" data-cancel-delete-note>Cancel</button>
                  </div>
                `
                : ""
            }
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderNoteForm() {
  const editingNote = state.notes.find((note) => note.id === state.editingNoteId);
  return `
    <form class="note-form" data-note-form>
      <input name="noteTitle" placeholder="Note title" value="${editingNote?.title || ""}" />
      <input name="noteContent" placeholder="Write a soft reminder..." value="${editingNote?.content || editingNote?.text || ""}" />
      <button class="button" type="submit">${editingNote ? "Save changes" : "Add note"}</button>
      ${editingNote ? `<button class="text-button" type="button" data-cancel-edit-note>Cancel edit</button>` : ""}
    </form>
  `;
}

export function renderMy() {
  const livingGuides = state.catalogs.livingGuides;
  const contentTitle = {
    Places: "My Favorites",
    Guides: "Saved Guides",
    Day: "My Days",
    Notes: "My Notes",
    Settings: "Settings",
  }[state.myTab] || "My Favorites";
  const savedPlaceCards = renderSavedPlaces();
  const guideCards = renderSavedGuides(livingGuides);
  const settingsContent = `
    <h3 style="margin: 0 0 14px;">Preference Settings</h3>
    <div class="settings-grid">
      <div class="field"><label>Common city</label><input value="${state.user.city}" /></div>
      <div class="field"><label>Budget range</label><input value="${state.user.budget}" /></div>
      <div class="field"><label>Favorite place types</label><input value="Cafe, Bookstore, Flower Shop" /></div>
      <div class="field"><label>Language</label><input value="${state.user.language}" /></div>
      <div class="toggle-row"><strong>Location</strong><button class="toggle ${state.user.locationEnabled ? "is-on" : ""}" type="button" data-toggle-location aria-label="Toggle location"></button></div>
      <div class="toggle-row"><strong>Quiet-first recommendations</strong><button class="toggle is-on" type="button" aria-label="Toggle quiet-first recommendations"></button></div>
    </div>
    <button class="soft-button" style="margin-top: 18px;" type="button" data-copy="Logged out of prototype">Logout</button>
  `;
  const tabContent = state.myTab === "Places"
    ? `<div class="mini-grid">${savedPlaceCards}</div>`
    : state.myTab === "Guides"
      ? `<div class="list-stack">${guideCards}</div>`
      : state.myTab === "Day"
        ? `<div class="list-stack">${renderDayPlans()}</div>`
      : state.myTab === "Settings"
          ? settingsContent
          : `${renderNotes()}${renderNoteForm()}`;
  return pageShell(`
    ${sectionHead(
      "My Page",
      "Everything you save, in one quiet place.",
      "Manage your places, HER Day plans, emergency contacts, language, preferences, and location settings."
    )}
    <div class="my-grid">
      <aside class="profile-panel">
        <img class="profile-avatar profile-avatar-image" src="images/pictures/0074.png" alt="" />
        <h2>${t("myTitle")}</h2>
        <p class="section-copy">${state.user.city} · ${state.user.language}</p>
        <div class="guide-meta">
          ${state.user.preferences.map((pref) => `<span class="tag">${pref}</span>`).join("")}
        </div>
        <div class="my-menu">
          ${[
            ["Places", "♡", "My Favorites"],
            ["Guides", "▤", "Saved Guides"],
            ["Day", "▣", "My Days"],
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
            <p class="eyebrow">${contentTitle}</p>
          </div>
        </div>
        ${tabContent}
      </section>
    </div>
  `);
}
