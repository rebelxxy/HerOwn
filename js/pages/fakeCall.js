import { state, PICTURE_ROOT } from '../state.js';
import { callers } from '../data.js';
import { pageShell, sectionHead } from '../components/layout.js';

export function renderFakeCall() {
  const caller = callers.find((item) => item.id === state.selectedCaller);
  const delayLabel = { now: "Now", "10": "10 seconds", "30": "30 seconds" }[state.selectedTimer];
  return pageShell(`
    ${sectionHead(
      "Fake Call",
      "Create a believable reason to step away.",
      "A front-end simulation only: no real phone call is made. Use it as a gentle exit cue when a situation feels awkward or unsafe."
    )}
    <div class="call-layout">
      <section class="surface">
        <p class="eyebrow">Caller</p>
        <div class="caller-list">
          ${callers
            .map(
              (item) => `
                <button class="caller-option ${item.id === caller.id ? "is-selected" : ""}" type="button" data-caller="${item.id}">
                  <span class="avatar">${item.avatar}</span>
                  <span>
                    <strong>${item.name}</strong>
                    <span style="display:block;color:var(--muted);margin-top:4px;">${item.role}</span>
                  </span>
                </button>
              `
            )
            .join("")}
        </div>
        <p class="eyebrow" style="margin-top: 22px;">Ring time</p>
        <div class="timer-options">
          ${[
            ["now", "Now"],
            ["10", "10 sec"],
            ["30", "30 sec"],
          ]
            .map(
              ([value, label]) => `<button class="${state.selectedTimer === value ? "is-selected" : ""}" type="button" data-timer="${value}">${label}</button>`
            )
            .join("")}
        </div>
        <button class="button" type="button" data-start-call>Start Fake Call · ${delayLabel}</button>
        <button class="soft-button" style="margin-left: 8px;" type="button" data-copy="Saved as favorite Fake Call template">Save template</button>
      </section>
      <section class="surface">
        <div class="phone-preview product-phone-preview">
          <div class="phone-preview-top">
            <p class="incoming-label">Incoming call</p>
            <img class="caller-image" src="${PICTURE_ROOT}085_fake_call_mom.png" alt="" />
            <h2>${caller.name}</h2>
          </div>
          <div class="steps">
            ${caller.lines.map((line) => `<div class="step"><strong>Script</strong><span>${line}</span></div>`).join("")}
          </div>
        </div>
      </section>
    </div>
  `);
}

export function startFakeCall() {
  const delay = state.selectedTimer === "now" ? 0 : Number(state.selectedTimer) * 1000;
  if (delay > 0) {
    showToast(`Fake call will ring in ${state.selectedTimer} seconds`);
  }
  window.setTimeout(openCallOverlay, delay);
}

function openCallOverlay() {
  const phoneOverlay = document.querySelector("#phoneOverlay");
  const caller = callers.find((item) => item.id === state.selectedCaller);
  document.querySelector("#callerAvatar").textContent = caller.avatar;
  document.querySelector("#callerName").textContent = caller.name;
  document.querySelector("#incomingLabel").textContent = "Incoming call";
  document.querySelector("#callerLine").textContent = caller.lines[0];
  phoneOverlay.classList.add("is-open");
  phoneOverlay.setAttribute("aria-hidden", "false");
}

export function closeCallOverlay() {
  const phoneOverlay = document.querySelector("#phoneOverlay");
  phoneOverlay.classList.remove("is-open");
  phoneOverlay.setAttribute("aria-hidden", "true");
}

export function answerFakeCall() {
  const phoneOverlay = document.querySelector("#phoneOverlay");
  const caller = callers.find((item) => item.id === state.selectedCaller);
  document.querySelector("#incomingLabel").textContent = "Connected";
  let index = 0;
  const line = document.querySelector("#callerLine");
  line.textContent = caller.lines[index];
  const interval = window.setInterval(() => {
    index += 1;
    if (index >= caller.lines.length || !phoneOverlay.classList.contains("is-open")) {
      window.clearInterval(interval);
      return;
    }
    line.textContent = caller.lines[index];
  }, 1800);
}
