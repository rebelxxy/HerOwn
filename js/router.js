import { state } from './state.js';
import { renderStaticText } from './i18n.js';
import { saveDayPlan, saveFavoritePlace } from './api.js';
import { hasSavedDayPlan, mergeDayPlans, persistNotes, persistSavedDays, persistSavedGuides, persistSavedPlaces } from './storage.js';
import { renderAssistant } from './components/assistant.js';
import { renderHome } from './pages/home.js';
import { renderSafe } from './pages/safe.js';
import { renderFakeCall, startFakeCall, answerFakeCall, closeCallOverlay } from './pages/fakeCall.js';
import { renderSOS } from './pages/sos.js';
import { renderLiving } from './pages/living.js';
import { renderPlaces } from './pages/places.js';
import { createAdditionalDayStop, createCurrentDayPlan, createDayPlanApiPayload, generateAdjustedDayPlan, getDayPlan, getDaySuggestion, normalizeSuggestionPlan, reflowDayPlan, renderDay } from './pages/day.js';
import { renderMy } from './pages/my.js';
import { pageShell } from './components/layout.js';
import { daySuggestions } from './data.js';

const app = document.querySelector('#app');
const navLinks = [...document.querySelectorAll('.nav-link[data-page], .icon-button[data-page]')];
const mainNav = document.querySelector('.main-nav');
const menuButton = document.querySelector('.mobile-menu');
const phoneOverlay = document.querySelector('#phoneOverlay');
const answerCall = document.querySelector('#answerCall');
const declineCall = document.querySelector('#declineCall');

function navigate(page) {
  state.page = page;
  if (location.hash !== `#${page}`) {
    history.replaceState(null, "", `#${page}`);
  }
  mainNav.classList.remove("is-open");
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
  app.focus({ preventScroll: true });
}

function setActiveNav() {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.page === state.page);
  });
}

function render() {
  renderStaticText();
  setActiveNav();
  const routes = {
    home: renderHome,
    auth: renderAuth,
    dashboard: renderDashboard,
    safe: renderSafe,
    fakeCall: renderFakeCall,
    sos: renderSOS,
    living: renderLiving,
    places: renderPlaces,
    day: renderDay,
    my: renderMy,
  };
  app.innerHTML = routes[state.page]();
  bindPageEvents();
  renderAssistant();
}

function renderAuth() {
  const isRegister = state.authMode === "register";
  return `
    <section class="page auth-layout">
      <div class="auth-visual" aria-hidden="true"></div>
      <div class="auth-panel">
        <div class="tabs" role="tablist" aria-label="Authentication">
          <button class="tab ${isRegister ? "is-selected" : ""}" type="button" data-auth-mode="register">Register</button>
          <button class="tab ${!isRegister ? "is-selected" : ""}" type="button" data-auth-mode="login">Login</button>
        </div>
        <p class="eyebrow">My HER OWN</p>
        <h1 class="section-title">${isRegister ? "Create your own room." : "Welcome back."}</h1>
        <p class="section-copy">
          ${isRegister ? "Save places, routes, emergency contacts, and the preferences that make the city feel yours." : "Return to your saved places, HER Day plans, and safety settings."}
        </p>
        <form class="form-grid auth-form">
          ${
            isRegister
              ? `
                <div class="field">
                  <label for="name">Name</label>
                  <input id="name" name="name" value="${state.user.name}" required />
                </div>
              `
              : ""
          }
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" name="email" value="${state.user.email}" required />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" name="password" value="herownroom" required />
          </div>
          ${
            isRegister
              ? `
                <div class="field">
                  <label for="city">City</label>
                  <select id="city" name="city">
                    ${["Tokyo", "Osaka", "Kyoto", "Fukuoka"].map((city) => `<option ${city === state.user.city ? "selected" : ""}>${city}</option>`).join("")}
                  </select>
                </div>
                <div class="field">
                  <label for="language">Preferred language</label>
                  <select id="language" name="language">
                    <option>English / Japanese</option>
                    <option>Chinese / Japanese</option>
                    <option>English</option>
                    <option>Japanese</option>
                  </select>
                </div>
                <div class="field">
                  <label for="preferences">Preferences</label>
                  <input id="preferences" name="preferences" value="${state.user.preferences.join(", ")}" />
                </div>
              `
              : ""
          }
          <button class="button" type="submit">${isRegister ? "Create account" : "Login"}</button>
        </form>
      </div>
    </section>
  `;
}

function renderDashboard() {
  const places = state.catalogs.places;
  const livingGuides = state.catalogs.livingGuides;
  return pageShell(`
    <div class="dashboard-grid">
      <section class="surface welcome-panel">
        <p class="eyebrow">My Home</p>
        <h1>Welcome back, ${state.user.name}.<br />What do you need today?</h1>
        <div class="quick-grid">
          ${[
            ["safe", "Safe Mode", "◇"],
            ["fakeCall", "Fake Call", "☎"],
            ["places", "HER Places", "⌖"],
            ["day", "HER Day", "✦"],
            ["living", "Living Guide", "⌂"],
          ]
            .map(
              ([page, label, icon]) => `
                <button class="quick-action" type="button" data-page="${page}">
                  <span>${icon}</span>
                  ${label}
                </button>
              `
            )
            .join("")}
        </div>
      </section>
      <aside class="surface">
        <p class="eyebrow">Emergency contacts</p>
        <h3>Ready</h3>
        <div class="list-stack" style="margin-top: 14px;">
          <div class="list-row"><div><strong>Mina</strong><span>Primary contact</span></div><span class="tag">Active</span></div>
          <div class="list-row"><div><strong>Mom</strong><span>Backup contact</span></div><span class="tag">Active</span></div>
          <div class="list-row"><div><strong>Location</strong><span>Browser permission</span></div><span class="tag">${state.user.locationEnabled ? "On" : "Off"}</span></div>
        </div>
      </aside>
    </div>
    <div class="content-grid" style="margin-top: 18px;">
      <section class="surface">
        <p class="eyebrow">Recent places</p>
        <div class="list-stack">
          ${state.savedPlaces
            .map((id) => places.find((place) => place.id === id))
            .filter(Boolean)
            .map(
              (place) => `<div class="list-row"><div><strong>${place.name}</strong><span>${place.category} · ${place.area}</span></div><span class="score">${place.safe}</span></div>`
            )
            .join("")}
        </div>
      </section>
      <section class="surface">
        <p class="eyebrow">Saved HER Day</p>
        <div class="list-stack">
          ${state.savedDays
            .map(
              (day) => `<div class="list-row"><div><strong>${day.title}</strong><span>${day.mood} · ${day.area}</span></div><span class="pill">${day.stops.length} stops</span></div>`
            )
            .join("")}
        </div>
      </section>
      <section class="surface">
        <p class="eyebrow">Recently viewed</p>
        <div class="list-stack">
          ${livingGuides
            .slice(0, 3)
            .map(
              (guide) => `<div class="list-row"><div><strong>${guide.title}</strong><span>${guide.category} · ${guide.time}</span></div><span class="tag">${guide.risk}</span></div>`
            )
            .join("")}
        </div>
      </section>
    </div>
  `);
}

function copyOrToast(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(
      () => showToast("Copied"),
      () => showToast(text)
    );
  } else {
    showToast(text);
  }
}

function showToast(message) {
  document.querySelectorAll(".toast").forEach((toast) => toast.remove());
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2200);
}

function savedPlanToStops(plan) {
  if (Array.isArray(plan.stopDetails) && plan.stopDetails.length) {
    return plan.stopDetails.map((stop) => ({
      time: stop.time || String(stop.start_time || "").slice(0, 5) || "11:00",
      title: stop.title || "Stop",
      type: stop.type || stop.category || "Place",
      area: stop.area || plan.area || state.dayArea,
      description: stop.description || stop.note || "Saved HER Day stop.",
      placeId: stop.placeId || stop.place_id || "",
    }));
  }

  return (plan.stops || []).map((stopText) => {
    const [time = "11:00", ...titleParts] = String(stopText).split(" ");
    const title = titleParts.join(" ") || "Stop";
    return {
      time,
      title,
      type: title,
      area: plan.area || state.dayArea,
      description: "Saved HER Day stop.",
      placeId: "",
    };
  });
}

function bindPageEvents() {
  app.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.page));
  });

  app.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.authMode;
      render();
    });
  });

  app.querySelectorAll(".auth-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      state.user.name = formData.get("name") || state.user.name;
      state.user.email = formData.get("email") || state.user.email;
      state.user.city = formData.get("city") || state.user.city;
      state.user.language = formData.get("language") || state.user.language;
      const preferences = formData.get("preferences");
      if (preferences) {
        state.user.preferences = preferences.split(",").map((item) => item.trim()).filter(Boolean);
      }
      showToast(state.authMode === "register" ? "Account created for this prototype" : "Logged in");
      navigate("dashboard");
    });
  });

  app.querySelectorAll("[data-place-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      state.placeSearch = String(formData.get("placeSearch") || "").trim();
      render();
    });
  });

  app.querySelectorAll("[data-clear-place-search]").forEach((button) => {
    button.addEventListener("click", () => {
      state.placeSearch = "";
      render();
    });
  });

  app.querySelectorAll("[data-my-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.myTab = button.dataset.myTab;
      state.pendingDeleteDayId = "";
      state.pendingRemoveGuideId = "";
      state.pendingRemovePlaceId = "";
      state.pendingDeleteNoteId = "";
      render();
    });
  });

  app.querySelectorAll("[data-open-saved-place]").forEach((button) => {
    button.addEventListener("click", () => {
      const place = state.catalogs.places.find((item) => item.id === button.dataset.openSavedPlace);
      if (!place) return;
      state.selectedPlace = place.id;
      state.selectedPlaceCategory = place.category;
      navigate("places");
    });
  });

  app.querySelectorAll("[data-remove-saved-place]").forEach((button) => {
    button.addEventListener("click", () => {
      const placeId = button.dataset.removeSavedPlace;
      state.savedPlaces = persistSavedPlaces(state.savedPlaces.filter((id) => id !== placeId));
      state.favoritePlaces = state.favoritePlaces.filter((place) => place.id !== placeId);
      showToast("Removed");
      render();
    });
  });

  app.querySelectorAll("[data-open-saved-guide]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedGuide = button.dataset.openSavedGuide;
      state.pendingRemoveGuideId = "";
      navigate("living");
    });
  });

  app.querySelectorAll("[data-request-remove-guide]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingRemoveGuideId = button.dataset.requestRemoveGuide;
      render();
    });
  });

  app.querySelectorAll("[data-cancel-remove-guide]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingRemoveGuideId = "";
      render();
    });
  });

  app.querySelectorAll("[data-confirm-remove-guide]").forEach((button) => {
    button.addEventListener("click", () => {
      const guideId = button.dataset.confirmRemoveGuide;
      state.savedGuideIds = persistSavedGuides(state.savedGuideIds.filter((id) => id !== guideId));
      state.pendingRemoveGuideId = "";
      showToast("Removed");
      render();
    });
  });

  app.querySelectorAll("[data-open-day-plan]").forEach((button) => {
    button.addEventListener("click", () => {
      const plan = state.savedDays.find((day) => day.id === button.dataset.openDayPlan);
      if (!plan) return;

      const sourceSuggestion = daySuggestions.find((suggestion) => suggestion.id === plan.sourceSuggestionId || suggestion.title === plan.title) || getDaySuggestion();
      state.selectedDaySuggestion = sourceSuggestion.id;
      state.dayMood = plan.mood || sourceSuggestion.mood;
      state.dayTime = plan.duration || sourceSuggestion.duration;
      state.dayBudget = plan.budget || sourceSuggestion.budget;
      state.dayArea = plan.area || sourceSuggestion.area;
      state.dayPreference = plan.preference || state.dayPreference;
      state.dayPlan = savedPlanToStops(plan);
      state.dayStartTime = state.dayPlan[0]?.time || state.dayStartTime;
      state.dayAdjustOpen = false;
      state.pendingDeleteDayId = "";
      navigate("day");
    });
  });

  app.querySelectorAll("[data-request-delete-day]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingDeleteDayId = button.dataset.requestDeleteDay;
      render();
    });
  });

  app.querySelectorAll("[data-cancel-delete-day]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingDeleteDayId = "";
      render();
    });
  });

  app.querySelectorAll("[data-confirm-delete-day]").forEach((button) => {
    button.addEventListener("click", () => {
      const dayId = button.dataset.confirmDeleteDay;
      state.savedDays = persistSavedDays(state.savedDays.filter((day) => day.id !== dayId));
      state.pendingDeleteDayId = "";
      showToast("Day plan deleted");
      render();
    });
  });

  app.querySelectorAll("[data-note-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const title = String(formData.get("noteTitle") || "").trim();
      const content = String(formData.get("noteContent") || "").trim();
      if (!title && !content) {
        showToast("Write a title or note first");
        return;
      }

      const now = new Date().toISOString();
      if (state.editingNoteId) {
        state.notes = persistNotes(state.notes.map((note) => (
          note.id === state.editingNoteId
            ? {
              ...note,
              title: title || "Untitled note",
              content,
              updatedAt: now,
            }
            : note
        )));
        state.editingNoteId = "";
        showToast("Note updated");
      } else {
        state.notes = persistNotes([
          {
            id: `note-${Date.now()}`,
            title: title || "Untitled note",
            content,
            createdAt: now,
            updatedAt: now,
          },
          ...state.notes,
        ]);
        showToast("Note added");
      }
      render();
    });
  });

  app.querySelectorAll("[data-edit-note]").forEach((button) => {
    button.addEventListener("click", () => {
      state.editingNoteId = button.dataset.editNote;
      state.pendingDeleteNoteId = "";
      render();
    });
  });

  app.querySelectorAll("[data-cancel-edit-note]").forEach((button) => {
    button.addEventListener("click", () => {
      state.editingNoteId = "";
      render();
    });
  });

  app.querySelectorAll("[data-request-delete-note]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingDeleteNoteId = button.dataset.requestDeleteNote;
      render();
    });
  });

  app.querySelectorAll("[data-cancel-delete-note]").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingDeleteNoteId = "";
      render();
    });
  });

  app.querySelectorAll("[data-confirm-delete-note]").forEach((button) => {
    button.addEventListener("click", () => {
      const noteId = button.dataset.confirmDeleteNote;
      state.notes = persistNotes(state.notes.filter((note) => note.id !== noteId));
      if (state.editingNoteId === noteId) state.editingNoteId = "";
      if (state.expandedNoteId === noteId) state.expandedNoteId = "";
      state.pendingDeleteNoteId = "";
      showToast("Note deleted");
      render();
    });
  });

  app.querySelectorAll("[data-toggle-note]").forEach((button) => {
    button.addEventListener("click", () => {
      state.expandedNoteId = state.expandedNoteId === button.dataset.toggleNote ? "" : button.dataset.toggleNote;
      render();
    });
  });

  app.querySelectorAll("[data-safe]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSafe = button.dataset.safe;
      render();
    });
  });

  app.querySelectorAll("[data-caller]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCaller = button.dataset.caller;
      render();
    });
  });

  app.querySelectorAll("[data-timer]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedTimer = button.dataset.timer;
      render();
    });
  });

  app.querySelectorAll("[data-start-call]").forEach((button) => {
    button.addEventListener("click", startFakeCall);
  });

  app.querySelectorAll("[data-sos]").forEach((button) => {
    let holdTimer;
    const reveal = () => {
      state.sosRevealed = true;
      showToast("SOS information revealed");
      render();
    };
    button.addEventListener("pointerdown", () => {
      button.classList.add("is-holding");
      holdTimer = window.setTimeout(reveal, 900);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((type) => {
      button.addEventListener(type, () => {
        window.clearTimeout(holdTimer);
        button.classList.remove("is-holding");
      });
    });
  });

  app.querySelectorAll("[data-living-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLivingCategory = state.selectedLivingCategory === button.dataset.livingCategory ? "" : button.dataset.livingCategory;
      state.livingSearch = "";
      state.selectedGuide = "";
      render();
    });
  });

  app.querySelectorAll("[data-guide]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedGuide = button.dataset.guide;
      render();
    });
  });

  app.querySelectorAll("[data-living-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      state.livingSearch = String(formData.get("livingSearch") || "").trim();
      state.selectedLivingCategory = "";
      state.selectedGuide = "";
      render();
    });
  });

  app.querySelectorAll("[data-clear-living-filters]").forEach((button) => {
    button.addEventListener("click", () => {
      state.livingSearch = "";
      state.selectedLivingCategory = "";
      state.selectedGuide = "";
      render();
    });
  });

  app.querySelectorAll("[data-living-back]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedGuide = "";
      render();
    });
  });

  app.querySelectorAll("[data-save-guide]").forEach((button) => {
    button.addEventListener("click", () => {
      const guideId = button.dataset.saveGuide;
      if (!state.savedGuideIds.includes(guideId)) {
        state.savedGuideIds = persistSavedGuides([...state.savedGuideIds, guideId]);
      }
      showToast("Guide saved");
      render();
    });
  });

  app.querySelectorAll("[data-living-step]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const guideId = state.selectedGuide;
      if (!guideId) return;
      const stepIndex = Number(checkbox.dataset.livingStep);
      const current = new Set(state.livingStepProgress[guideId] || []);
      if (checkbox.checked) {
        current.add(stepIndex);
      } else {
        current.delete(stepIndex);
      }
      state.livingStepProgress = {
        ...state.livingStepProgress,
        [guideId]: [...current].sort((a, b) => a - b),
      };
      render();
    });
  });

  app.querySelectorAll("[data-place-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPlaceCategory = button.dataset.placeCategory;
      const places = state.catalogs.places;
      const matching = places.find((place) => place.category === state.selectedPlaceCategory);
      if (matching) {
        state.selectedPlace = matching.id;
      }
      render();
    });
  });

  app.querySelectorAll("[data-place]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPlace = button.dataset.place;
      render();
    });
  });

  app.querySelectorAll("[data-save-place]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.savePlace;
      if (!state.savedPlaces.includes(id)) {
        state.savedPlaces.push(id);
        state.savedPlaces = persistSavedPlaces(state.savedPlaces);
        const place = state.catalogs.places.find((item) => item.id === id);
        if (place && !state.favoritePlaces.some((item) => item.id === id)) {
          state.favoritePlaces.push(place);
        }
        void saveFavoritePlace(state.user.id, id);
        showToast("Saved to My Places");
      } else {
        state.savedPlaces = persistSavedPlaces(state.savedPlaces.filter((placeId) => placeId !== id));
        state.favoritePlaces = state.favoritePlaces.filter((place) => place.id !== id);
        showToast("Removed from My Places");
      }
      render();
    });
  });

  app.querySelectorAll("[data-day-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      const suggestion = getDaySuggestion(button.dataset.daySuggestion);
      state.selectedDaySuggestion = suggestion.id;
      state.dayMood = suggestion.mood;
      state.dayTime = suggestion.duration;
      state.dayBudget = suggestion.budget;
      state.dayArea = suggestion.area;
      state.dayStartTime = suggestion.stops[0]?.time || state.dayStartTime;
      state.dayAdjustOpen = false;
      state.dayPlan = normalizeSuggestionPlan(suggestion);
      render();
    });
  });

  app.querySelectorAll("[data-create-my-day]").forEach((button) => {
    button.addEventListener("click", () => {
      showToast("Coming Soon");
    });
  });

  app.querySelectorAll("[data-day-back]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDaySuggestion = "";
      state.dayAdjustOpen = false;
      state.dayPlan = [];
      render();
    });
  });

  app.querySelectorAll("[data-toggle-day-adjust]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayAdjustOpen = !state.dayAdjustOpen;
      render();
    });
  });

  app.querySelectorAll("[data-adjust-day-time]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayTime = button.dataset.adjustDayTime;
      render();
    });
  });

  app.querySelectorAll("[data-adjust-day-budget]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayBudget = button.dataset.adjustDayBudget;
      render();
    });
  });

  app.querySelectorAll("[data-adjust-day-area]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayArea = button.dataset.adjustDayArea;
      render();
    });
  });

  app.querySelectorAll("[data-adjust-day-preference]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayPreference = button.dataset.adjustDayPreference;
      render();
    });
  });

  app.querySelectorAll("[data-day-start-time]").forEach((input) => {
    input.addEventListener("input", () => {
      state.dayStartTime = input.value || state.dayStartTime;
    });
    input.addEventListener("change", () => {
      state.dayStartTime = input.value || state.dayStartTime;
    });
  });

  app.querySelectorAll("[data-apply-day-adjust]").forEach((button) => {
    button.addEventListener("click", () => {
      const startInput = app.querySelector("[data-day-start-time]");
      if (startInput?.value) state.dayStartTime = startInput.value;
      state.dayPlan = generateAdjustedDayPlan();
      state.dayAdjustOpen = false;
      showToast("Day adjusted");
      render();
    });
  });

  app.querySelectorAll("[data-save-day-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      const suggestion = getDaySuggestion(button.dataset.saveDaySuggestion);
      const localPlan = createCurrentDayPlan(suggestion);
      if (hasSavedDayPlan(state.savedDays, localPlan)) {
        showToast("Saved to My Days");
        render();
        return;
      }

      state.savedDays = persistSavedDays(mergeDayPlans([localPlan], state.savedDays));
      void saveDayPlan(state.user.id, createDayPlanApiPayload(localPlan));
      showToast("Saved to My Days");
      render();
    });
  });

  app.querySelectorAll("[data-start-route]").forEach((button) => {
    button.addEventListener("click", () => {
      showToast("Route feature coming soon.");
    });
  });

  app.querySelectorAll("[data-replace-stop]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.replaceStop);
      const place = state.catalogs.places.find((item) => item.id === button.dataset.replacePlace);
      const plan = [...getDayPlan()];
      if (place && plan[index]) {
        plan[index] = {
          ...plan[index],
          title: place.name,
          type: place.category,
          area: place.area,
          description: place.reason,
          placeId: place.id,
          budget: place.budget,
          distance: place.distance,
        };
        state.dayPlan = reflowDayPlan(plan);
        showToast("Stop replaced");
        render();
      }
    });
  });

  app.querySelectorAll("[data-day-move-up]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.dayMoveUp);
      const plan = [...getDayPlan()];
      if (index > 0) {
        [plan[index - 1], plan[index]] = [plan[index], plan[index - 1]];
        state.dayPlan = reflowDayPlan(plan);
        showToast("Moved up");
        render();
      }
    });
  });

  app.querySelectorAll("[data-day-move-down]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.dayMoveDown);
      const plan = [...getDayPlan()];
      if (index < plan.length - 1) {
        [plan[index], plan[index + 1]] = [plan[index + 1], plan[index]];
        state.dayPlan = reflowDayPlan(plan);
        showToast("Moved down");
        render();
      }
    });
  });

  app.querySelectorAll("[data-day-remove-stop]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.dayRemoveStop);
      const plan = getDayPlan().filter((_, stopIndex) => stopIndex !== index);
      state.dayPlan = reflowDayPlan(plan);
      showToast("Stop removed");
      render();
    });
  });

  app.querySelectorAll("[data-add-day-stop]").forEach((button) => {
    button.addEventListener("click", () => {
      const plan = [...getDayPlan(), createAdditionalDayStop()];
      state.dayPlan = reflowDayPlan(plan);
      showToast("Stop added");
      render();
    });
  });

  app.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => copyOrToast(button.dataset.copy));
  });

  app.querySelectorAll("[data-toggle-location]").forEach((button) => {
    button.addEventListener("click", () => {
      state.user.locationEnabled = !state.user.locationEnabled;
      showToast(`Location ${state.user.locationEnabled ? "enabled" : "disabled"}`);
      render();
    });
  });
}

export function initRouter() {
  document.addEventListener('click', (event) => {
    const pageButton = event.target.closest('[data-page]');
    if (pageButton && !app.contains(pageButton)) navigate(pageButton.dataset.page);
  });

  menuButton.addEventListener('click', () => mainNav.classList.toggle('is-open'));

  document.querySelector('#languageSelect').addEventListener('change', (event) => {
    state.lang = event.target.value;
    localStorage.setItem('herOwnLanguage', state.lang);
    render();
  });

  answerCall.addEventListener('click', answerFakeCall);
  declineCall.addEventListener('click', closeCallOverlay);
  phoneOverlay.addEventListener('click', (event) => { if (event.target === phoneOverlay) closeCallOverlay(); });

  const validPages = ['home', 'auth', 'dashboard', 'safe', 'fakeCall', 'sos', 'living', 'places', 'day', 'my'];
  const initialPage = location.hash.replace('#', '');
  if (validPages.includes(initialPage)) state.page = initialPage;

  window.addEventListener('hashchange', () => {
    const nextPage = location.hash.replace('#', '');
    if (validPages.includes(nextPage)) {
      state.page = nextPage;
      render();
    }
  });

  document.addEventListener('herown:data-ready', render);

  render();
}
