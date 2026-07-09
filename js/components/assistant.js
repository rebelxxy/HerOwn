import { state } from '../state.js';

export function renderAssistant() {
  const assistantPanel = document.querySelector("#assistantPanel");
  const assistantLog = document.querySelector("#assistantLog");
  assistantPanel.classList.toggle("is-open", state.assistantOpen);
  assistantPanel.setAttribute("aria-hidden", String(!state.assistantOpen));
  assistantLog.innerHTML = state.assistantMessages
    .map((message) => `<div class="message ${message.role === "user" ? "user" : ""}">${message.text}</div>`)
    .join("");
  assistantLog.scrollTop = assistantLog.scrollHeight;
}

function answerAssistant(text) {
  const lower = text.toLowerCase();
  if (lower.includes("follow")) {
    return "First, do not go home. Move toward a bright store, station gate, or police box. Share your location with Mina. I can open the Being Followed guide in Safe.";
  }
  if (lower.includes("door") || lower.includes("stranger")) {
    return "Keep the door locked. Ask for name and purpose through the door or intercom. If they will not leave, call building management or 110.";
  }
  if (lower.includes("rent") || lower.includes("apartment")) {
    return "Start with entrance safety, night lighting, repair rules, phone signal, and station route. I recommend the Apartment viewing safety check in Living.";
  }
  if (lower.includes("day") || lower.includes("solo") || lower.includes("go")) {
    return "For a gentle solo day, choose Peace, Half day, 3000 yen, and Kichijoji. A cafe, bookstore, flower shop, and park is a soft plan.";
  }
  if (lower.includes("electric") || lower.includes("bill")) {
    return "Check air conditioner mode, water heater settings, always-on appliances, and your plan. If usage jumped suddenly, contact the provider.";
  }
  return "I will start with safety: are you in immediate danger? If yes, call 110. If not, tell me the situation and I will give short steps plus a HER OWN guide.";
}

export function initAssistant() {
  const assistantInput = document.querySelector('#assistantInput');
  const assistantForm = document.querySelector('#assistantForm');

  document.querySelector('.assistant-launch').addEventListener('click', () => {
    state.assistantOpen = true;
    renderAssistant();
    assistantInput.focus();
  });

  document.querySelector('.assistant-pill').addEventListener('click', () => {
    state.assistantOpen = true;
    renderAssistant();
    assistantInput.focus();
  });

  document.querySelector('.assistant-close').addEventListener('click', () => {
    state.assistantOpen = false;
    renderAssistant();
  });

  document.querySelectorAll('.assistant-prompts button').forEach((button) => {
    button.addEventListener('click', () => {
      assistantInput.value = button.dataset.prompt;
      assistantForm.requestSubmit();
    });
  });

  assistantForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = assistantInput.value.trim();
    if (!text) return;
    state.assistantMessages.push({ role: 'user', text });
    state.assistantMessages.push({ role: 'assistant', text: answerAssistant(text) });
    assistantInput.value = '';
    renderAssistant();
  });
}
