import { state } from './state.js';
import { renderStaticText } from './i18n.js';
import { moods } from './data.js';
import { saveDayPlan, saveFavoritePlace } from './api.js';
import { renderAssistant } from './components/assistant.js';
import { renderHome } from './pages/home.js';
import { renderSafe } from './pages/safe.js';
import { renderFakeCall, startFakeCall, answerFakeCall, closeCallOverlay } from './pages/fakeCall.js';
import { renderSOS } from './pages/sos.js';
import { renderLiving } from './pages/living.js';
import { renderPlaces } from './pages/places.js';
import { renderDay, buildDayStops, getDayPlan, nextPlanTime } from './pages/day.js';
import { renderMy } from './pages/my.js';
import { pageShell } from './components/layout.js';

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
      state.placeSearch = formData.get("placeSearch") || "";
      render();
    });
  });

  app.querySelectorAll("[data-my-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.myTab = button.dataset.myTab;
      render();
    });
  });

  app.querySelectorAll("[data-note-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      state.notes.unshift({
        id: `note-${Date.now()}`,
        title: formData.get("noteTitle"),
        text: formData.get("noteText"),
      });
      showToast("Note added");
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
      state.selectedLivingCategory = button.dataset.livingCategory;
      const livingGuides = state.catalogs.livingGuides;
      const next = livingGuides.find((guide) => guide.category === state.selectedLivingCategory);
      if (next) {
        state.selectedGuide = next.id;
      }
      render();
    });
  });

  app.querySelectorAll("[data-guide]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedGuide = button.dataset.guide;
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
        const place = state.catalogs.places.find((item) => item.id === id);
        if (place && !state.favoritePlaces.some((item) => item.id === id)) {
          state.favoritePlaces.push(place);
        }
        void saveFavoritePlace(state.user.id, id);
        showToast("Saved to My Places");
      } else {
        state.savedPlaces = state.savedPlaces.filter((placeId) => placeId !== id);
        state.favoritePlaces = state.favoritePlaces.filter((place) => place.id !== id);
        showToast("Removed from My Places");
      }
      render();
    });
  });

  app.querySelectorAll("[data-day-mood]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayMood = button.dataset.dayMood;
      state.dayPlan = [];
      render();
    });
  });

  app.querySelectorAll("[data-day-time]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayTime = button.dataset.dayTime;
      state.dayPlan = [];
      render();
    });
  });

  app.querySelectorAll("[data-day-budget]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayBudget = button.dataset.dayBudget;
      state.dayPlan = [];
      render();
    });
  });

  app.querySelectorAll("[data-day-area]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayArea = button.dataset.dayArea;
      state.dayPlan = [];
      render();
    });
  });

  app.querySelectorAll("[data-shuffle-day]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentIndex = moods.indexOf(state.dayMood);
      state.dayMood = moods[(currentIndex + 1) % moods.length];
      state.dayPlan = [];
      showToast(`Shuffled to ${state.dayMood}`);
      render();
    });
  });

  app.querySelectorAll("[data-add-stop]").forEach((button) => {
    button.addEventListener("click", () => {
      const recommendation = buildDayStops()[Number(button.dataset.addStop)];
      state.dayPlan.push({ ...recommendation, time: nextPlanTime(state.dayPlan.length) });
      showToast(`${recommendation.type} added to My Plan`);
      render();
    });
  });

  app.querySelectorAll("[data-clear-day]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayPlan = [];
      showToast("Plan cleared");
      render();
    });
  });

  app.querySelectorAll("[data-save-day]").forEach((button) => {
    button.addEventListener("click", () => {
      const planStops = getDayPlan();
      const localPlan = {
        id: `day-${Date.now()}`,
        title: `${state.dayMood} in ${state.dayArea}`,
        mood: state.dayMood,
        area: state.dayArea,
        stops: planStops.map((stop) => `${stop.time} ${stop.type}`),
      };
      state.savedDays.unshift(localPlan);
      void saveDayPlan(state.user.id, {
        title: localPlan.title,
        mood: state.dayMood,
        duration: state.dayTime,
        budget_yen: Number.parseInt(state.dayBudget, 10),
        area: state.dayArea,
        stops: planStops.map((stop, index) => ({
          stop_order: index + 1,
          start_time: `${stop.time}:00`,
          title: stop.type,
          category: stop.type,
          area: stop.area,
        })),
      });
      showToast("Saved to My HER Day");
      render();
    });
  });

  app.querySelectorAll("[data-remove-stop]").forEach((button) => {
    button.addEventListener("click", () => {
      state.dayPlan = getDayPlan().filter((_, index) => index !== Number(button.dataset.removeStop));
      showToast("Removed from My Plan");
      render();
    });
  });

  app.querySelectorAll("[data-move-stop]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.moveStop);
      const plan = [...getDayPlan()];
      if (index > 0) {
        [plan[index - 1], plan[index]] = [plan[index], plan[index - 1]];
        state.dayPlan = plan;
        showToast("Moved up");
        render();
      }
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
