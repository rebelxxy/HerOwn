import { askAssistant } from '../api.js';
import { t } from '../i18n.js';
import { state } from '../state.js';

let assistantReturnFocus = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function actionMarkup(action) {
  if (!action || action.type === "none" || !action.label) return "";
  return `
    <button
      class="assistant-cta"
      type="button"
      data-assistant-action="${escapeHtml(action.type)}"
      data-assistant-target="${escapeHtml(action.target || "")}"
    >
      ${escapeHtml(action.label)}
    </button>
  `;
}

function setHash(hash) {
  if (location.hash === hash) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    location.hash = hash;
  }
}

function navigateAssistantAction(actionType, target) {
  closeAssistant();

  if (actionType === "safe_scenario") {
    state.page = "safe";
    state.selectedSafe = target || "emergency";
    setHash(`#safe-scenario-${state.selectedSafe}`);
    return;
  }

  if (actionType === "living_guide") {
    state.page = "living";
    state.selectedGuide = target || "";
    setHash("#living");
    return;
  }

  if (actionType === "places") {
    state.page = "places";
    setHash("#places");
    return;
  }

  if (actionType === "day") {
    state.page = "day";
    setHash("#day");
    return;
  }

  if (actionType === "mypage") {
    state.page = "my";
    setHash("#my");
  }
}

function assistantIsWaiting() {
  return state.assistantMessages.some((message) => message.loading);
}

function assistantHasUserMessage() {
  return state.assistantMessages.some((message) => message.role === "user");
}

function updateAssistantPromptState() {
  const assistantPrompts = document.querySelector(".assistant-prompts");
  if (!assistantPrompts) return;

  const shouldHide = assistantHasUserMessage();
  assistantPrompts.hidden = shouldHide;
  assistantPrompts.setAttribute("aria-hidden", String(shouldHide));
}

function updateAssistantSendState() {
  const assistantForm = document.querySelector("#assistantForm");
  const assistantInput = document.querySelector("#assistantInput");
  const sendButton = assistantForm?.querySelector('button[type="submit"]');
  if (!assistantInput || !sendButton) return;

  const isWaiting = assistantIsWaiting();
  const hasText = assistantInput.value.trim().length > 0;
  const canSend = hasText && !isWaiting;

  sendButton.disabled = !canSend;
  sendButton.textContent = isWaiting ? "…" : "↑";
  sendButton.classList.toggle("is-active", canSend);
  sendButton.classList.toggle("is-sending", isWaiting);
  sendButton.setAttribute("aria-disabled", String(!canSend));
  sendButton.setAttribute("aria-busy", String(isWaiting));
  assistantForm.classList.toggle("is-sending", isWaiting);
}

function assistantFocusTarget() {
  if (assistantReturnFocus?.isConnected && !assistantReturnFocus.disabled) {
    return assistantReturnFocus;
  }
  return document.querySelector(".assistant-launch") || document.querySelector(".assistant-pill");
}

function openAssistant(trigger) {
  assistantReturnFocus = trigger || document.activeElement || document.querySelector(".assistant-launch");
  state.assistantOpen = true;
  renderAssistant();
  document.querySelector("#assistantInput")?.focus();
}

function closeAssistant() {
  const assistantPanel = document.querySelector("#assistantPanel");
  const activeElement = document.activeElement;
  if (assistantPanel?.contains(activeElement)) {
    assistantFocusTarget()?.focus();
  }
  state.assistantOpen = false;
  renderAssistant();
}

function assistantMessageText(message) {
  const text = message.i18nKey ? t(message.i18nKey) : message.text;
  return String(text ?? "").trim();
}

function buildAssistantHistory() {
  return state.assistantMessages
    .filter((message) => !message.loading && (message.role === "user" || message.role === "assistant"))
    .map((message) => ({
      role: message.role,
      content: assistantMessageText(message),
    }))
    .filter((message) => message.content)
    .slice(-10);
}

export function renderAssistant() {
  const assistantPanel = document.querySelector("#assistantPanel");
  const assistantLog = document.querySelector("#assistantLog");
  assistantPanel.classList.toggle("is-open", state.assistantOpen);
  assistantPanel.setAttribute("aria-hidden", String(!state.assistantOpen));
  assistantPanel.inert = !state.assistantOpen;
  assistantPanel.toggleAttribute("inert", !state.assistantOpen);
  assistantLog.innerHTML = state.assistantMessages
    .map((message) => {
      const text = message.i18nKey ? t(message.i18nKey) : message.text;
      return `
        <div class="message ${message.role === "user" ? "user" : ""} ${message.loading ? "is-loading" : ""}">
          <span>${escapeHtml(text)}</span>
          ${message.role === "assistant" ? actionMarkup(message.action) : ""}
        </div>
      `;
    })
    .join("");
  assistantLog.scrollTop = assistantLog.scrollHeight;

  assistantLog.querySelectorAll("[data-assistant-action]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateAssistantAction(button.dataset.assistantAction, button.dataset.assistantTarget);
      renderAssistant();
    });
  });
  updateAssistantPromptState();
  updateAssistantSendState();
}

export function initAssistant() {
  const assistantInput = document.querySelector('#assistantInput');
  const assistantForm = document.querySelector('#assistantForm');

  document.querySelector('.assistant-launch').addEventListener('click', (event) => {
    openAssistant(event.currentTarget);
  });

  document.querySelector('.assistant-pill').addEventListener('click', (event) => {
    openAssistant(event.currentTarget);
  });

  document.querySelector('.assistant-close').addEventListener('click', () => {
    closeAssistant();
  });

  document.querySelectorAll('.assistant-prompts button').forEach((button) => {
    button.addEventListener('click', () => {
      if (assistantIsWaiting()) return;
      assistantInput.value = button.dataset.prompt;
      updateAssistantSendState();
      assistantForm.requestSubmit();
    });
  });

  assistantInput.addEventListener('input', updateAssistantSendState);
  assistantInput.addEventListener('change', updateAssistantSendState);

  assistantForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (assistantIsWaiting()) return;
    const text = assistantInput.value.trim();
    if (!text) {
      updateAssistantSendState();
      return;
    }

    const history = buildAssistantHistory();
    const loadingId = `assistant-${Date.now()}`;
    state.assistantMessages.push({ role: 'user', text });
    state.assistantMessages.push({ id: loadingId, role: 'assistant', text: '...', loading: true });
    assistantInput.value = '';
    updateAssistantSendState();
    renderAssistant();

    const response = await askAssistant(text, {
      lang: state.lang,
      page: state.page,
      history,
    });

    state.assistantMessages = state.assistantMessages.map((message) => (
      message.id === loadingId
        ? { role: 'assistant', text: response.reply, action: response.action, source: response.source }
        : message
    ));
    renderAssistant();
    updateAssistantSendState();
  });

  updateAssistantSendState();
  updateAssistantPromptState();
}
