import { state, PICTURE_ROOT } from '../state.js';
import { categoryIcons } from '../data.js';
import { labelFor, t } from '../i18n.js';
import { pageShell, sectionHead } from '../components/layout.js';
import { categoryButton, listRow } from '../components/cards.js';

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

function dayPlanMeta(day) {
  const meta = [day.area, day.duration, day.budget].filter(Boolean).join(" · ");
  const stops = Array.isArray(day.stops) ? day.stops.join(" · ") : "";
  return [meta, stops].filter(Boolean).join(" — ");
}

function currentLanguageLabel() {
  return {
    en: "English",
    ja: "日本語",
    zh: "中文",
  }[state.lang] || "English";
}

function translatedRisk(value) {
  const key = String(value || "Low").trim().toLowerCase();
  return {
    low: t("myRiskLow"),
    medium: t("myRiskMedium"),
    high: t("myRiskHigh"),
  }[key] || value || t("myRiskLow");
}

function resolveSavedPlace(placeId) {
  return state.catalogs.places.find((place) => place.id === placeId)
    || state.favoritePlaces.find((place) => place.id === placeId)
    || null;
}

function savedPlaceTags(place) {
  return [...asArray(place.experienceTags), ...asArray(place.practicalTags)].slice(0, 2);
}

function savedPlaceVisual(place) {
  if (place.image) {
    return `<img class="favorite-card-image" src="${PICTURE_ROOT}${escapeHtml(place.image)}" alt="" loading="lazy" />`;
  }

  return `
    <div class="favorite-card-icon" aria-hidden="true">
      ${categoryIcons[place.category] || "⌖"}
    </div>
  `;
}

function renderSavedPlaceCard(place) {
  const meta = [place.category, place.area].filter(Boolean).join(" · ");
  const tags = savedPlaceTags(place);
  return `
    <article class="favorite-card">
      <div class="favorite-card-visual">
        ${savedPlaceVisual(place)}
      </div>
      <div class="favorite-card-copy">
        <strong>${escapeHtml(place.name)}</strong>
        <p>${escapeHtml(meta || place.distance || "")}</p>
        ${
          tags.length
            ? `<div class="tag-row">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`
            : ""
        }
      </div>
      <div class="favorite-card-actions">
        <button class="soft-button" type="button" data-open-saved-place="${escapeHtml(place.id)}">${t("myFavoriteOpen")}</button>
        <button class="text-button favorite-remove-action" type="button" data-remove-saved-place="${escapeHtml(place.id)}">${t("myFavoriteRemove")}</button>
      </div>
    </article>
  `;
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
            <button class="soft-button" type="button" data-open-day-plan="${escapeHtml(day.id)}">${t("myActionOpen")}</button>
            <button class="text-button" type="button" data-request-delete-day="${escapeHtml(day.id)}">${t("myActionDelete")}</button>
          </div>
          ${
            isConfirming
              ? `
                <div class="delete-confirm">
                  <span>${t("myDeleteDayConfirm")}</span>
                  <button class="soft-button" type="button" data-confirm-delete-day="${escapeHtml(day.id)}">${t("myActionConfirm")}</button>
                  <button class="text-button" type="button" data-cancel-delete-day>${t("myActionCancel")}</button>
                </div>
              `
              : ""
          }
        </article>
      `;
    }).join("")
    : `<div class="list-row"><div><strong>${t("myDaysEmptyTitle")}</strong><span>${t("myDaysEmptyCopy")}</span></div></div>`;
}

function renderSavedPlaces() {
  const savedPlaces = state.savedPlaces
    .map((placeId) => resolveSavedPlace(placeId))
    .filter(Boolean);

  return savedPlaces.length
    ? savedPlaces.map(renderSavedPlaceCard).join("")
    : `
      <div class="surface favorites-empty-state">
        <strong>${t("myFavoritesEmptyTitle")}</strong>
        <span>${t("myFavoritesEmptyCopy")}</span>
      </div>
    `;
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
              <span>${guide.category} · ${t("myRiskLabel")} ${translatedRisk(guide.riskLevel || guide.risk)}</span>
            </div>
            <div class="day-plan-actions">
              <button class="soft-button" type="button" data-open-saved-guide="${escapeHtml(guide.id)}">${t("myActionOpen")}</button>
              <button class="text-button" type="button" data-request-remove-guide="${escapeHtml(guide.id)}">${t("myActionRemove")}</button>
            </div>
            ${
              isConfirming
                ? `
                  <div class="delete-confirm">
                    <span>${t("myRemoveGuideConfirm")}</span>
                    <button class="soft-button" type="button" data-confirm-remove-guide="${escapeHtml(guide.id)}">${t("myActionConfirm")}</button>
                    <button class="text-button" type="button" data-cancel-remove-guide>${t("myActionCancel")}</button>
                  </div>
                `
                : ""
            }
          </article>
        `;
      })
      .join("")
    : `<div class="list-row"><div><strong>${t("myGuidesEmptyTitle")}</strong><span>${t("myGuidesEmptyCopy")}</span></div></div>`;
}

function formatNoteDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const locale = { en: "en", ja: "ja-JP", zh: "zh-CN" }[state.lang] || "en";
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

function renderNotes() {
  if (!state.notes.length) {
    return `
      <div class="surface living-empty-state">
        <strong>${t("myNotesEmptyTitle")}</strong>
        <p>${t("myNotesEmptyCopy")}</p>
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
            <strong>${escapeHtml(note.title || t("myUntitledNote"))}</strong>
            <p>${escapeHtml(content)}</p>
            <span class="note-date">${formatNoteDate(note.createdAt)}</span>
            ${isLong ? `<button class="text-button" type="button" data-toggle-note="${escapeHtml(note.id)}">${isExpanded ? t("myNoteCollapse") : t("myNoteReadMore")}</button>` : ""}
            <div class="day-plan-actions">
              <button class="soft-button" type="button" data-edit-note="${escapeHtml(note.id)}">${t("myActionEdit")}</button>
              <button class="text-button" type="button" data-request-delete-note="${escapeHtml(note.id)}">${t("myActionDelete")}</button>
            </div>
            ${
              isConfirming
                ? `
                  <div class="delete-confirm">
                    <span>${t("myDeleteNoteConfirm")}</span>
                    <button class="soft-button" type="button" data-confirm-delete-note="${escapeHtml(note.id)}">${t("myActionConfirm")}</button>
                    <button class="text-button" type="button" data-cancel-delete-note>${t("myActionCancel")}</button>
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
      <input name="noteTitle" placeholder="${t("myNoteTitlePlaceholder")}" value="${escapeHtml(editingNote?.title || "")}" />
      <input name="noteContent" placeholder="${t("myNoteContentPlaceholder")}" value="${escapeHtml(editingNote?.content || editingNote?.text || "")}" />
      <button class="button" type="submit">${editingNote ? t("mySaveChanges") : t("myAddNote")}</button>
      ${editingNote ? `<button class="text-button" type="button" data-cancel-edit-note>${t("myCancelEdit")}</button>` : ""}
    </form>
  `;
}

export function renderMy() {
  const livingGuides = state.catalogs.livingGuides;
  const contentTitle = {
    Places: t("myFavorites"),
    Guides: t("mySavedGuides"),
    Day: t("myDayPlans"),
    Notes: t("myNotes"),
    Settings: t("settings"),
  }[state.myTab] || t("myFavorites");
  const savedPlaceCards = renderSavedPlaces();
  const guideCards = renderSavedGuides(livingGuides);
  const settingsContent = `
    <h3 style="margin: 0 0 14px;">${t("myPreferenceSettings")}</h3>
    <div class="settings-grid">
      <div class="settings-readonly-row">
        <span>${t("myCommonCity")}</span>
        <strong>${escapeHtml(state.user.city)}</strong>
        <small>${t("myPrototypeReadOnly")}</small>
      </div>
      <div class="settings-readonly-row">
        <span>${t("myBudgetRange")}</span>
        <strong>${escapeHtml(state.user.budget)}</strong>
        <small>${t("myPrototypeReadOnly")}</small>
      </div>
      <div class="settings-readonly-row">
        <span>${t("myFavoritePlaceTypes")}</span>
        <strong>${state.user.preferences.map((pref) => escapeHtml(labelFor(pref))).join(", ")}</strong>
        <small>${t("myPrototypeReadOnly")}</small>
      </div>
      <div class="field">
        <label for="myLanguageSelect">${t("myLanguage")}</label>
        <select id="myLanguageSelect" data-my-language aria-label="${t("myLanguage")}">
          <option value="en" ${state.lang === "en" ? "selected" : ""}>English</option>
          <option value="ja" ${state.lang === "ja" ? "selected" : ""}>日本語</option>
          <option value="zh" ${state.lang === "zh" ? "selected" : ""}>中文</option>
        </select>
      </div>
      <div class="toggle-row">
        <div>
          <strong>${t("myLocation")}</strong>
          <span>${state.user.locationEnabled ? t("myStatusOn") : t("myStatusOff")}</span>
        </div>
        <button class="toggle ${state.user.locationEnabled ? "is-on" : ""}" type="button" data-toggle-location aria-label="${t("myToggleLocation")}"></button>
      </div>
      <div class="settings-readonly-row">
        <span>${t("myQuietFirst")}</span>
        <strong>${t("myPrototypePreference")}</strong>
        <small>${t("myPrototypeReadOnly")}</small>
      </div>
    </div>
    <button class="soft-button" style="margin-top: 18px;" type="button" data-my-logout>${t("myLogout")}</button>
  `;
  const tabContent = state.myTab === "Places"
    ? `<div class="favorites-grid">${savedPlaceCards}</div>`
    : state.myTab === "Guides"
      ? `<div class="list-stack">${guideCards}</div>`
      : state.myTab === "Day"
        ? `<div class="list-stack">${renderDayPlans()}</div>`
      : state.myTab === "Settings"
          ? settingsContent
          : `${renderNotes()}${renderNoteForm()}`;
  return pageShell(`
    ${sectionHead(
      t("myPageTitle"),
      t("myPageSubtitle"),
      t("myPageDescription")
    )}
    <div class="my-grid">
      <aside class="profile-panel">
        <img class="profile-avatar profile-avatar-image" src="images/pictures/0074.png" alt="" />
        <h2>${t("myTitle")}</h2>
        <p class="section-copy">${escapeHtml(state.user.city)} · ${currentLanguageLabel()}</p>
        <div class="guide-meta">
          ${state.user.preferences.map((pref) => `<span class="tag">${escapeHtml(labelFor(pref))}</span>`).join("")}
        </div>
        <div class="my-menu">
          ${[
            ["Places", "♡", t("myFavorites")],
            ["Guides", "▤", t("mySavedGuides")],
            ["Day", "▣", t("myDayPlans")],
            ["Notes", "□", t("myNotes")],
            ["Settings", "◎", t("settings")],
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
  `, "my-page");
}
