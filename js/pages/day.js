import { state, PICTURE_ROOT } from '../state.js';
import { dayRules, moods, times, budgets, areas } from '../data.js';
import { t } from '../i18n.js';
import { pageShell } from '../components/layout.js';
import { choiceChip } from '../components/cards.js';

export function buildDayStops() {
  const base = [...dayRules[state.dayMood]];
  const rotated = [...base.slice(1), base[0]];
  const selected = state.dayBudget === "1000 yen" ? base : state.dayBudget === "5000 yen" ? rotated : base;
  const start = state.dayTime === "2h" ? ["14:00", "15:00", "16:00"] : state.dayTime === "Full day" ? ["10:00", "12:00", "14:00", "16:00", "18:00"] : ["11:00", "13:00", "15:00", "16:00"];
  return selected.slice(0, start.length).map((type, index) => ({
    time: start[index],
    type,
    area: state.dayArea,
  }));
}

export function getDayPlan() {
  if (state.dayPlan.length) return state.dayPlan;
  return buildDayStops().slice(0, 3);
}

export function nextPlanTime(index) {
  const options = state.dayTime === "2h" ? ["14:00", "15:00", "16:00", "17:00"] : state.dayTime === "Full day" ? ["10:00", "12:00", "14:00", "16:00", "18:00", "19:30"] : ["11:00", "13:00", "15:00", "16:00", "17:30"];
  return options[index] || options[options.length - 1];
}

export function renderDay() {
  const moodImages = ["043_mood_chip_01.png", "044_mood_chip_02.png", "045_mood_chip_03.png", "046_mood_chip_04.png", "047_mood_chip_05.png", "048_small_asset_01.png"];
  const recImages = ["037_place_01.png", "038_place_02.png", "039_place_03.png", "040_place_04.png", "041_place_05.png"];
  const recommendations = buildDayStops();
  const stops = getDayPlan();
  return pageShell(`
    <div class="day-head-product">
      <div>
        <p class="eyebrow">${t("dayTitle")}</p>
        <h1 class="section-title">${t("dayTitle")}</h1>
        <p class="section-copy">${t("daySubtitle")}</p>
      </div>
      <img src="${PICTURE_ROOT}003_large_woman_writing_flowers.png" alt="" />
    </div>
    <div class="day-layout">
      <section class="surface day-control-panel">
        <div class="choice-group">
          <h3>${t("howFeel")}</h3>
          <div class="choice-grid">
            ${moods.map((mood, index) => choiceChip(mood, mood === state.dayMood, `data-day-mood="${mood}"`, `${PICTURE_ROOT}${moodImages[index]}`)).join("")}
          </div>
        </div>
        <div class="choice-group">
          <h3>Time</h3>
          <div class="choice-grid">
            ${times.map((time) => choiceChip(time, time === state.dayTime, `data-day-time="${time}"`)).join("")}
          </div>
        </div>
        <div class="choice-group">
          <h3>Budget</h3>
          <div class="choice-grid">
            ${budgets.map((budget) => choiceChip(budget, budget === state.dayBudget, `data-day-budget="${budget}"`)).join("")}
          </div>
        </div>
        <div class="choice-group">
          <h3>Area</h3>
          <div class="choice-grid">
            ${areas.map((area) => choiceChip(area, area === state.dayArea, `data-day-area="${area}"`)).join("")}
          </div>
        </div>
        <div class="button-row">
          <button class="button" type="button" data-shuffle-day>Shuffle</button>
          <button class="soft-button" type="button" data-clear-day>Clear plan</button>
        </div>
      </section>
      <section class="surface">
        <p class="eyebrow">${t("recommended")}</p>
        <div class="possibility-grid">
          ${recommendations
            .map(
              (stop, index) => `
                <article class="possibility-card">
                  <img class="mini-thumb image-thumb" src="${PICTURE_ROOT}${recImages[index % recImages.length]}" alt="" />
                  <div>
                    <strong>${stop.type}</strong>
                    <span style="display:block;color:var(--muted);margin-top:4px;">${stop.area} · ${index + 1}.${index + 2} km</span>
                  </div>
                  <button type="button" data-add-stop="${index}" aria-label="Add ${stop.type}">+</button>
                </article>
              `
            )
            .join("")}
        </div>
        <div class="section-head places-subhead">
          <h3>${t("myPlan")}</h3>
          <span class="section-copy">Drag and drop places to plan your day.</span>
        </div>
        <div class="timeline">
          ${stops.length
            ? stops
            .map(
              (stop, index) => `
                <article class="timeline-card">
                  <time>${stop.time}</time>
                  <div>
                    <strong>${stop.type}</strong>
                    <span style="display:block;color:var(--muted);margin-top:4px;">${state.dayMood} in ${stop.area}</span>
                  </div>
                  <div class="row-actions">
                    <button type="button" data-move-stop="${index}" aria-label="Move stop up">↑</button>
                    <button type="button" data-remove-stop="${index}" aria-label="Remove ${stop.type}">×</button>
                  </div>
                </article>
              `
            )
            .join("")
            : `<article class="timeline-card empty-plan"><strong>+ ${t("addPlace")}</strong><span>Choose one recommendation above.</span></article>`}
        </div>
        <button class="button" style="margin-top: 18px;" type="button" data-save-day>${t("buildDay")} ✦</button>
      </section>
    </div>
  `);
}
