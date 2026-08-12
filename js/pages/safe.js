import { state, ASSET_ROOT } from '../state.js';
import { t } from '../i18n.js';
import { pageShell } from '../components/layout.js';
import { buildGoogleMapsDirectionsUrl, buildGoogleMapsSearchUrl } from '../utils/maps.js';

let safetyCallRender = () => {};
let countdownTimer = null;
let conversationTimer = null;
let callDurationTimer = null;
let ringtoneTimer = null;
let audioContext = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function localize(value) {
  if (!value || typeof value !== "object") return value || "";
  return value[state.lang] || value.en || "";
}

const safetyCallCallers = [
  {
    id: "anna",
    avatar: "A",
    name: {
      en: "Anna",
      ja: "Anna",
      zh: "Anna",
    },
    preview: {
      en: "I'm waiting outside.",
      ja: "外で待っているね。",
      zh: "我在外面等你。",
    },
    messages: {
      en: ["Hey!", "Where are you?", "I'm already here.", "Take your time.", "I'll wait for you.", "See you soon."],
      ja: ["もしもし。", "今どこにいる？", "もう近くにいるよ。", "急がなくて大丈夫。", "ここで待っているね。", "もうすぐ会おう。"],
      zh: ["喂。", "你现在在哪里？", "我已经到附近了。", "不用急。", "我会等你。", "一会儿见。"],
    },
  },
  {
    id: "mia",
    avatar: "M",
    name: {
      en: "Mia",
      ja: "Mia",
      zh: "Mia",
    },
    preview: {
      en: "Did you get here?",
      ja: "もう着いた？",
      zh: "你到了吗？",
    },
    messages: {
      en: ["Hi, it's me.", "Did you get here?", "I can stay on the line.", "Look for the brighter street.", "I'll meet you near the entrance.", "You're doing okay."],
      ja: ["私だよ。", "もう着いた？", "このまま電話つないでおくね。", "明るい道を選んで。", "入口の近くで会おう。", "大丈夫、落ち着いているよ。"],
      zh: ["是我。", "你到了吗？", "我可以先不挂电话。", "往亮一点的路走。", "我在入口附近等你。", "你做得很好。"],
    },
  },
  {
    id: "dad",
    avatar: "D",
    name: {
      en: "Dad",
      ja: "父",
      zh: "爸爸",
    },
    preview: {
      en: "Are you home yet?",
      ja: "もう家に着いた？",
      zh: "你到家了吗？",
    },
    messages: {
      en: ["Hey.", "Are you home yet?", "Tell me when you're near the station.", "Stay where there are people.", "I'll keep talking with you.", "Message me when you're inside."],
      ja: ["もしもし。", "もう家に着いた？", "駅の近くに来たら教えて。", "人のいる場所にいてね。", "このまま話しているよ。", "中に入ったら連絡して。"],
      zh: ["喂。", "你到家了吗？", "快到车站附近时告诉我。", "待在有人的地方。", "我会一直和你说话。", "进屋后给我发消息。"],
    },
  },
  {
    id: "cafe",
    avatar: "C",
    name: {
      en: "Cafe",
      ja: "カフェ",
      zh: "咖啡店",
    },
    preview: {
      en: "Your table is ready.",
      ja: "お席の準備ができました。",
      zh: "你的座位已经准备好了。",
    },
    messages: {
      en: ["Hello.", "Your table is ready.", "You can come in now.", "The entrance is on the bright street.", "Take your time.", "We'll be here."],
      ja: ["お電話ありがとうございます。", "お席の準備ができました。", "今からお入りいただけます。", "入口は明るい通り側です。", "ゆっくりで大丈夫です。", "お待ちしています。"],
      zh: ["您好。", "你的座位已经准备好了。", "现在可以进来了。", "入口在明亮的街道一侧。", "慢慢来就好。", "我们在这里等你。"],
    },
  },
];

const safetyCallDelays = [
  { value: "now", key: "safetyCallDelayNow", seconds: 0 },
  { value: "10", key: "safetyCallDelay10", seconds: 10 },
  { value: "30", key: "safetyCallDelay30", seconds: 30 },
  { value: "60", key: "safetyCallDelay60", seconds: 60 },
];

const safeRouteProfiles = [
  {
    id: "fastest",
    icon: "⚡",
    titleKey: "safeRouteFastest",
    labelKey: "safeRouteFastestLabel",
    timeKey: "safeRouteFastestTime",
    characteristics: ["safeRouteFastestChar1", "safeRouteFastestChar2"],
    reasons: ["safeRouteFastestReason1", "safeRouteFastestReason2"],
    tradeoffKey: "safeRouteFastestTradeoff",
  },
  {
    id: "main",
    icon: "🛣",
    titleKey: "safeRouteMainRoads",
    labelKey: "safeRouteMainRoadsLabel",
    timeKey: "safeRouteMainRoadsTime",
    characteristics: ["safeRouteMainRoadsChar1", "safeRouteMainRoadsChar2", "safeRouteMainRoadsChar3"],
    reasons: ["safeRouteMainRoadsReason1", "safeRouteMainRoadsReason2", "safeRouteMainRoadsReason3", "safeRouteMainRoadsReason4"],
    comfortPoints: ["safeRouteComfortConvenience", "safeRouteComfortStation", "safeRouteComfortCafe", "safeRouteComfortKoban"],
    pick: true,
  },
  {
    id: "convenient",
    icon: "🏪",
    titleKey: "safeRouteConvenient",
    labelKey: "safeRouteConvenientLabel",
    timeKey: "safeRouteConvenientTime",
    characteristics: ["safeRouteConvenientChar1", "safeRouteConvenientChar2", "safeRouteConvenientChar3"],
    reasons: ["safeRouteConvenientReason1", "safeRouteConvenientReason2", "safeRouteConvenientReason3"],
    comfortPoints: ["safeRouteComfortConvenience", "safeRouteComfortStation", "safeRouteComfortKoban"],
  },
];

function safetyCaller() {
  return safetyCallCallers.find((caller) => caller.id === state.safetyCallCaller) || safetyCallCallers[0];
}

function safetyDelay() {
  return safetyCallDelays.find((delay) => delay.value === state.safetyCallDelay) || safetyCallDelays[1];
}

function requestSafetyCallRender() {
  safetyCallRender();
}

export function setSafetyCallRender(callback) {
  safetyCallRender = typeof callback === "function" ? callback : () => {};
}

function clearCountdownTimer() {
  if (countdownTimer) window.clearInterval(countdownTimer);
  countdownTimer = null;
}

function clearConversationTimer() {
  if (conversationTimer) window.clearInterval(conversationTimer);
  conversationTimer = null;
}

function clearCallDurationTimer() {
  if (callDurationTimer) window.clearInterval(callDurationTimer);
  callDurationTimer = null;
}

function stopRingtone() {
  if (ringtoneTimer) window.clearInterval(ringtoneTimer);
  ringtoneTimer = null;
}

function clearSafetyCallTimers() {
  clearCountdownTimer();
  clearConversationTimer();
  clearCallDurationTimer();
  stopRingtone();
}

function ensureAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playSafetyTone() {
  if (!state.safetyCallSoundOn) return;
  const context = ensureAudioContext();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(660, context.currentTime);
  oscillator.frequency.setValueAtTime(520, context.currentTime + 0.16);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.34);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.36);
}

function startRingtone() {
  stopRingtone();
  if (!state.safetyCallSoundOn) return;
  playSafetyTone();
  ringtoneTimer = window.setInterval(playSafetyTone, 1400);
}

function enterIncomingCall() {
  clearCountdownTimer();
  state.safetyCallStep = "incoming";
  state.safetyCallRemaining = 0;
  state.safetyCallVisibleMessages = 0;
  startRingtone();
  requestSafetyCallRender();
}

export function openSafetyCall() {
  clearSafetyCallTimers();
  state.selectedSafe = "";
  state.safetyCallStep = "caller";
  state.safetyCallCaller = state.safetyCallCaller || "anna";
  state.safetyCallDelay = state.safetyCallDelay || "10";
  state.safetyCallRemaining = safetyDelay().seconds;
  state.safetyCallDuration = 0;
  state.safetyCallVisibleMessages = 0;
  requestSafetyCallRender();
}

export function resetSafetyCallState() {
  clearSafetyCallTimers();
  state.safetyCallStep = "intro";
  state.safetyCallRemaining = safetyDelay().seconds;
  state.safetyCallDuration = 0;
  state.safetyCallVisibleMessages = 0;
}

export function setSafetyCallCaller(callerId) {
  state.safetyCallCaller = safetyCallCallers.some((caller) => caller.id === callerId) ? callerId : "anna";
  requestSafetyCallRender();
}

export function setSafetyCallDelay(delayValue) {
  state.safetyCallDelay = safetyCallDelays.some((delay) => delay.value === delayValue) ? delayValue : "10";
  state.safetyCallRemaining = safetyDelay().seconds;
  requestSafetyCallRender();
}

export function goToSafetyCallStep(step) {
  if (!["intro", "caller", "delay"].includes(step)) return;
  clearSafetyCallTimers();
  state.safetyCallStep = step;
  state.safetyCallDuration = 0;
  state.safetyCallVisibleMessages = 0;
  requestSafetyCallRender();
}

export function toggleSafetyCallSound() {
  state.safetyCallSoundOn = !state.safetyCallSoundOn;
  if (!state.safetyCallSoundOn) {
    stopRingtone();
  } else if (state.safetyCallStep === "incoming") {
    startRingtone();
  } else {
    ensureAudioContext();
  }
  requestSafetyCallRender();
}

export function startSafetyCallCountdown() {
  clearSafetyCallTimers();
  ensureAudioContext();
  const delay = safetyDelay();
  state.safetyCallRemaining = delay.seconds;
  state.safetyCallVisibleMessages = 0;

  if (delay.seconds === 0) {
    enterIncomingCall();
    return;
  }

  state.safetyCallStep = "countdown";
  state.safetyCallDuration = 0;
  requestSafetyCallRender();
  countdownTimer = window.setInterval(() => {
    state.safetyCallRemaining = Math.max(0, Number(state.safetyCallRemaining) - 1);
    if (state.safetyCallRemaining <= 0) {
      enterIncomingCall();
      return;
    }
    requestSafetyCallRender();
  }, 1000);
}

export function cancelSafetyCall() {
  clearSafetyCallTimers();
  state.safetyCallStep = "intro";
  state.safetyCallRemaining = safetyDelay().seconds;
  state.safetyCallDuration = 0;
  state.safetyCallVisibleMessages = 0;
  requestSafetyCallRender();
}

export function cancelSafetyCallCountdown() {
  if (state.safetyCallStep !== "countdown") return false;
  cancelSafetyCall();
  return true;
}

export function acceptSafetyCall() {
  stopRingtone();
  clearConversationTimer();
  clearCallDurationTimer();
  state.safetyCallStep = "conversation";
  state.safetyCallDuration = 0;
  state.safetyCallVisibleMessages = 1;
  requestSafetyCallRender();
  callDurationTimer = window.setInterval(() => {
    state.safetyCallDuration = Math.max(0, Number(state.safetyCallDuration) || 0) + 1;
    requestSafetyCallRender();
  }, 1000);
  conversationTimer = window.setInterval(() => {
    const messages = localize(safetyCaller().messages);
    state.safetyCallVisibleMessages = Math.min(messages.length, state.safetyCallVisibleMessages + 1);
    requestSafetyCallRender();
    if (state.safetyCallVisibleMessages >= messages.length) clearConversationTimer();
  }, 1700);
}

export function declineSafetyCall() {
  clearSafetyCallTimers();
  state.safetyCallStep = "finished";
  state.safetyCallVisibleMessages = 0;
  requestSafetyCallRender();
}

export function endSafetyCall() {
  clearSafetyCallTimers();
  state.safetyCallStep = "finished";
  requestSafetyCallRender();
}

export function finishSafetyCall() {
  clearSafetyCallTimers();
  state.safetyCallStep = "intro";
  state.selectedSafe = "";
  state.safetyCallDuration = 0;
  state.safetyCallVisibleMessages = 0;
  requestSafetyCallRender();
}

const safeScenarios = [
  {
    id: "followed",
    icon: "⌖",
    title: {
      en: "Someone is following me",
      ja: "誰かについてこられている",
      zh: "有人一直跟着我",
    },
    description: {
      en: "I think someone is following me.",
      ja: "誰かが後をついてきている気がします。",
      zh: "我觉得有人在跟着我。",
    },
    support: {
      en: "Stay calm. Let's focus on what you can do next.",
      ja: "落ち着いて。次にできることを一緒に確認しましょう。",
      zh: "先保持冷静。我们先看下一步可以做什么。",
    },
    actions: [
      {
        labelKey: "mapsOpenMaps",
        copyKey: "safeMapSupportingCopy",
        behavior: "maps",
        mapQuery: { en: "Tokyo station convenience store police box", ja: "東京 駅 コンビニ 交番", zh: "东京 车站 便利店 派出所" },
      },
      {
        labelKey: "safetyCallTitle",
        copyKey: "safetyCallShortExplanation",
        behavior: "safetyCall",
      },
      {
        label: { en: "Find a public place", ja: "人のいる場所へ", zh: "去公共场所" },
        copy: { en: "Go somewhere with other people.", ja: "コンビニ、駅、開いている店へ向かいます。", zh: "去便利店、车站或仍在营业的店。" },
        behavior: "tip",
        tip: { en: "Go to a convenience store, station gate, open shop, or bright lobby.", ja: "コンビニ、駅の改札、開いている店、明るいロビーへ向かってください。", zh: "去便利店、车站闸口、营业中的店或明亮大厅。" },
      },
      {
        label: { en: "Communication", ja: "伝える", zh: "沟通" },
        copy: { en: "Show or play helpful phrases.", ja: "必要な言葉を見せたり再生します。", zh: "展示或播放可用短句。" },
        behavior: "communication",
      },
    ],
    phrases: [
      { ja: "助けてください。\n誰かにつけられています。", en: "Please help me. Someone is following me.", zh: "请帮帮我。有人一直跟着我。" },
      { ja: "このお店の中で少し待ってもいいですか？", en: "May I wait inside this shop for a little while?", zh: "我可以在店里等一会儿吗？" },
      { ja: "警察を呼んでもらえますか？", en: "Could you call the police?", zh: "可以帮我报警吗？" },
    ],
    why: {
      avoid: {
        en: ["Do not go straight home if you are worried.", "Avoid quiet alleys."],
        ja: ["不安な時はまっすぐ帰宅しないでください。", "人通りの少ない路地は避けてください。"],
        zh: ["如果感到不安，不要直接回家。", "避开安静的小巷。"],
      },
      tips: {
        en: ["Stay near other people.", "Enter a convenience store or station."],
        ja: ["人の近くにいてください。", "コンビニや駅に入ってください。"],
        zh: ["尽量靠近有人的地方。", "进入便利店或车站。"],
      },
      emergency: true,
    },
  },
  {
    id: "night",
    icon: "☾",
    title: {
      en: "I feel unsafe walking home",
      ja: "帰り道が不安",
      zh: "夜路回家不安心",
    },
    description: {
      en: "I don't feel comfortable walking alone.",
      ja: "ひとりで歩くのが不安です。",
      zh: "我不太敢一个人走回去。",
    },
    support: {
      en: "You can change the plan. Take one step at a time.",
      ja: "予定を変えて大丈夫です。一つずつ確認しましょう。",
      zh: "你可以改变路线或方式。一步一步来。",
    },
    actions: [
      { labelKey: "mapsOpenMaps", copyKey: "safeMapSupportingCopy", behavior: "maps", mapQuery: { en: "Tokyo station convenience store police box", ja: "東京 駅 コンビニ 交番", zh: "东京 车站 便利店 派出所" } },
      { label: { en: "Find a public place", ja: "人のいる場所へ", zh: "去公共场所" }, copy: { en: "Go to a convenience store, station, or open shop.", ja: "コンビニ、駅、開いている店へ向かいます。", zh: "去便利店、车站或营业中的店。" }, behavior: "tip", tip: { en: "Wait in a staffed or bright place before deciding your next step.", ja: "次の行動を決める前に、明るくスタッフのいる場所で待ってください。", zh: "先在明亮、有工作人员的地方等一下再决定下一步。" } },
      { label: { en: "Take a taxi", ja: "タクシーにする", zh: "改坐出租车" }, copy: { en: "Choose another way home if walking feels unsafe.", ja: "歩くのが不安なら別の帰り方にします。", zh: "如果走路不安心，换一种回家方式。" }, behavior: "tip", tip: { en: "Choose a staffed taxi stand or a trusted taxi app. Share your location if you can.", ja: "タクシー乗り場や信頼できるアプリを使い、可能なら位置情報を共有してください。", zh: "使用正规出租车点或可信打车软件，可以的话分享位置。" } },
      { label: { en: "Communication", ja: "伝える", zh: "沟通" }, copy: { en: "Show or play helpful phrases.", ja: "必要な言葉を見せたり再生します。", zh: "展示或播放可用短句。" }, behavior: "communication" },
    ],
    phrases: [
      { ja: "ひとりで帰るのが不安です。", en: "I feel unsafe going home alone.", zh: "我一个人回家有点不安。" },
      { ja: "タクシー乗り場はどこですか？", en: "Where is the taxi stand?", zh: "出租车乘车点在哪里？" },
      { ja: "少しここで待ってもいいですか？", en: "May I wait here for a little while?", zh: "我可以在这里等一会儿吗？" },
    ],
    why: {
      avoid: { en: ["Avoid shortcuts through quiet places.", "Do not force yourself to keep walking."], ja: ["静かな近道は避けてください。", "無理に歩き続けないでください。"], zh: ["避开安静的捷径。", "不要勉强自己继续走。"] },
      tips: { en: ["Choose light, people, and staffed places.", "Changing your route is allowed."], ja: ["明るさ、人、スタッフのいる場所を選んでください。", "帰り方を変えて大丈夫です。"], zh: ["选择有灯、有人的地方。", "改变路线或方式是可以的。"] },
      emergency: true,
    },
  },
  {
    id: "door",
    icon: "⌂",
    title: { en: "Someone is outside my door", ja: "玄関の外に誰かがいる", zh: "门外有人" },
    description: { en: "I don't feel safe opening the door.", ja: "ドアを開けるのが不安です。", zh: "我不放心开门。" },
    support: { en: "You do not need to open the door first.", ja: "先にドアを開ける必要はありません。", zh: "你不需要先开门。" },
    actions: [
      { label: { en: "Check safely", ja: "安全に確認", zh: "安全确认" }, copy: { en: "Use the intercom or peephole without opening the door.", ja: "ドアを開けずにインターホンやのぞき穴で確認します。", zh: "不开门，用门铃对讲或猫眼确认。" }, behavior: "tip", tip: { en: "Keep the door locked. Ask who they are through the door or intercom.", ja: "鍵をかけたまま、ドア越しやインターホンで相手を確認してください。", zh: "保持门锁好，通过门或对讲询问对方是谁。" } },
      { label: { en: "Do not open the door", ja: "開けない", zh: "不要开门" }, copy: { en: "Keep the door locked until you know who is outside.", ja: "相手がわかるまで鍵を開けません。", zh: "确认身份前保持门锁好。" }, behavior: "tip", tip: { en: "You can stay silent or say you will confirm with management first.", ja: "黙っていても、管理会社に確認すると伝えても大丈夫です。", zh: "可以不回应，也可以说先联系管理公司确认。" } },
      { label: { en: "Contact building management", ja: "管理会社に連絡", zh: "联系物业或房东" }, copy: { en: "Ask the landlord, management company, or security staff for help.", ja: "大家、管理会社、警備スタッフに相談します。", zh: "联系房东、管理公司或安保人员。" }, behavior: "tip", tip: { en: "Contact your landlord, management company, or security desk before opening the door.", ja: "ドアを開ける前に、大家、管理会社、警備室へ連絡してください。", zh: "开门前先联系房东、管理公司或安保。" } },
      { label: { en: "Emergency", ja: "緊急", zh: "紧急情况" }, copy: { en: "Call for help if you feel in immediate danger.", ja: "すぐ危険を感じる場合は助けを呼びます。", zh: "如果马上有危险，请求助。" }, behavior: "page", page: "sos" },
    ],
    phrases: [
      { ja: "どちら様ですか？", en: "Who is it?", zh: "请问是哪位？" },
      { ja: "今はドアを開けられません。", en: "I cannot open the door right now.", zh: "我现在不能开门。" },
      { ja: "管理会社に確認します。", en: "I will check with building management.", zh: "我会先和管理公司确认。" },
    ],
    why: {
      avoid: { en: ["Do not unlock the door to check.", "Do not say you are alone."], ja: ["確認のために鍵を開けないでください。", "ひとりでいることを伝えないでください。"], zh: ["不要为了确认而开锁。", "不要说自己一个人在家。"] },
      tips: { en: ["Use the intercom or peephole.", "Verify through official contact channels."], ja: ["インターホンやのぞき穴を使ってください。", "公式の連絡先で確認してください。"], zh: ["使用对讲或猫眼。", "通过官方联系方式确认。"] },
      emergency: true,
    },
  },
  {
    id: "lost-key",
    icon: "□",
    title: { en: "I lost my key", ja: "鍵をなくした", zh: "钥匙丢了" },
    description: { en: "I can't get back into my home.", ja: "家に入れません。", zh: "我回不了家。" },
    support: { en: "Find a safe place first, then contact the right help.", ja: "まず安全な場所へ。その後、必要な連絡をしましょう。", zh: "先找安全的地方，再联系合适的人。" },
    actions: [
      { label: { en: "Contact landlord", ja: "大家へ連絡", zh: "联系房东" }, copy: { en: "Ask your landlord or management company first.", ja: "まず大家や管理会社に連絡します。", zh: "先联系房东或管理公司。" }, behavior: "tip", tip: { en: "Contact your landlord or management company before choosing a locksmith.", ja: "鍵業者の前に、大家や管理会社に連絡してください。", zh: "找锁匠前，先联系房东或管理公司。" } },
      { label: { en: "Call a locksmith", ja: "鍵業者へ", zh: "联系锁匠" }, copy: { en: "Use a trusted locksmith service.", ja: "信頼できる鍵業者を使います。", zh: "使用可信的锁匠服务。" }, behavior: "tip", tip: { en: "Confirm identity rules and price before agreeing to locksmith service.", ja: "依頼前に本人確認と料金を確認してください。", zh: "同意服务前先确认身份要求和价格。" } },
      { label: { en: "Find a safe place", ja: "安全な場所へ", zh: "找安全地点" }, copy: { en: "Wait somewhere bright and public.", ja: "明るく人のいる場所で待ちます。", zh: "在明亮公共场所等待。" }, behavior: "tip", tip: { en: "Wait at a convenience store, station, cafe, or bright lobby.", ja: "コンビニ、駅、カフェ、明るいロビーで待ってください。", zh: "在便利店、车站、咖啡店或明亮大厅等待。" } },
      { label: { en: "Communication", ja: "伝える", zh: "沟通" }, copy: { en: "Show or play helpful phrases.", ja: "必要な言葉を見せたり再生します。", zh: "展示或播放可用短句。" }, behavior: "communication" },
    ],
    phrases: [
      { ja: "鍵をなくしました。", en: "I lost my key.", zh: "我的钥匙丢了。" },
      { ja: "管理会社に連絡したいです。", en: "I want to contact building management.", zh: "我想联系管理公司。" },
      { ja: "料金を先に教えてください。", en: "Please tell me the price first.", zh: "请先告诉我费用。" },
    ],
    why: {
      avoid: { en: ["Do not try to force the door open.", "Avoid waiting alone in a dark place."], ja: ["無理にドアを開けようとしないでください。", "暗い場所でひとりで待つのは避けてください。"], zh: ["不要强行开门。", "避免在黑暗处独自等待。"] },
      tips: { en: ["Call management first.", "Wait somewhere bright while arranging help."], ja: ["先に管理会社へ連絡してください。", "手配中は明るい場所で待ってください。"], zh: ["先联系管理公司。", "安排帮助时在明亮地方等待。"] },
    },
  },
  {
    id: "train",
    icon: "▤",
    title: { en: "Train harassment", ja: "電車内で不快なことがある", zh: "电车骚扰" },
    description: { en: "Someone is making me uncomfortable.", ja: "誰かの行動が不快です。", zh: "有人让我感到不舒服。" },
    support: { en: "You can move away and ask for help.", ja: "離れて、助けを求めて大丈夫です。", zh: "你可以离开并寻求帮助。" },
    actions: [
      { label: { en: "Move away", ja: "離れる", zh: "离开" }, copy: { en: "Move near other passengers or to another carriage.", ja: "他の乗客の近くや別の車両へ移動します。", zh: "移动到其他乘客附近或换车厢。" }, behavior: "tip", tip: { en: "Move toward other passengers, the door, or another carriage when you can.", ja: "可能なら他の乗客、ドア付近、別の車両へ移動してください。", zh: "可以的话移动到其他乘客旁、车门附近或换车厢。" } },
      { label: { en: "Talk to station staff", ja: "駅員に相談", zh: "找站务员" }, copy: { en: "Ask station staff for help.", ja: "駅員に助けを求めます。", zh: "向站务员求助。" }, behavior: "tip", tip: { en: "Get off at the next safe station and tell station staff what happened.", ja: "安全な駅で降りて、駅員に状況を伝えてください。", zh: "在安全的车站下车，告诉站务员发生了什么。" } },
      { label: { en: "Communication", ja: "伝える", zh: "沟通" }, copy: { en: "Show or play helpful phrases.", ja: "必要な言葉を見せたり再生します。", zh: "展示或播放可用短句。" }, behavior: "communication" },
      { label: { en: "Emergency", ja: "緊急", zh: "紧急情况" }, copy: { en: "Call for help if the situation becomes dangerous.", ja: "危険を感じる場合は助けを呼びます。", zh: "如果情况变危险，请求助。" }, behavior: "page", page: "sos" },
    ],
    phrases: [
      { ja: "やめてください。", en: "Please stop.", zh: "请停止。" },
      { ja: "駅員さんを呼んでください。", en: "Please call station staff.", zh: "请帮我叫站务员。" },
      { ja: "この人に困っています。", en: "This person is bothering me.", zh: "这个人让我很困扰。" },
    ],
    why: {
      avoid: { en: ["Do not stay frozen if you can move safely.", "Do not blame yourself."], ja: ["安全に動けるなら、その場に固まらなくて大丈夫です。", "自分を責めないでください。"], zh: ["如果能安全移动，不必僵在原地。", "不要责怪自己。"] },
      tips: { en: ["Move toward people or staff.", "Record station, line, and time if you can."], ja: ["人やスタッフの近くへ移動してください。", "可能なら駅、路線、時間を記録してください。"], zh: ["移动到人或工作人员附近。", "可以的话记录车站、线路和时间。"] },
      emergency: true,
    },
  },
  {
    id: "emergency",
    icon: "!",
    emergency: true,
    title: { en: "Emergency", ja: "緊急", zh: "紧急情况" },
    description: { en: "I need immediate help.", ja: "すぐ助けが必要です。", zh: "我需要立刻求助。" },
    support: { en: "If you are in immediate danger, use emergency services first.", ja: "すぐ危険がある場合は、先に緊急連絡をしてください。", zh: "如果有立即危险，请先联系紧急服务。" },
    actions: [
      { label: { en: "Call 110", ja: "110 警察", zh: "拨打 110" }, copy: { en: "Police emergency.", ja: "警察への緊急連絡。", zh: "报警电话。" }, behavior: "number", number: "110", tip: { en: "Police emergency: 110", ja: "警察への緊急連絡: 110", zh: "报警电话: 110" } },
      { label: { en: "Call 119", ja: "119 救急・消防", zh: "拨打 119" }, copy: { en: "Ambulance or fire emergency.", ja: "救急・消防への緊急連絡。", zh: "急救或火灾电话。" }, behavior: "number", number: "119", tip: { en: "Ambulance or fire emergency: 119", ja: "救急・消防への緊急連絡: 119", zh: "急救或火灾电话: 119" } },
      { label: { en: "Communication", ja: "伝える", zh: "沟通" }, copy: { en: "Show or play emergency phrases.", ja: "緊急時の言葉を見せたり再生します。", zh: "展示或播放紧急短句。" }, behavior: "communication" },
      { label: { en: "Return to safety options", ja: "安全オプションへ戻る", zh: "返回安全选项" }, copy: { en: "Go back to other HER Safe scenarios.", ja: "他のHER Safeシナリオへ戻ります。", zh: "回到其他 HER Safe 场景。" }, behavior: "home" },
    ],
    phrases: [
      { ja: "助けてください。", en: "Please help me.", zh: "请帮帮我。" },
      { ja: "警察を呼んでください。", en: "Please call the police.", zh: "请帮我报警。" },
      { ja: "救急車を呼んでください。", en: "Please call an ambulance.", zh: "请帮我叫救护车。" },
    ],
    why: {
      avoid: { en: ["Do not delay if there is immediate danger.", "Do not use app features before emergency services if you need urgent help."], ja: ["すぐ危険がある場合は遅らせないでください。", "緊急時はアプリ機能より緊急連絡を優先してください。"], zh: ["如果有立即危险，不要拖延。", "紧急时先联系紧急服务，不要先使用 App 功能。"] },
      tips: { en: ["Say where you are.", "Say what is happening and what help you need."], ja: ["今いる場所を伝えてください。", "何が起きているか、何が必要かを伝えてください。"], zh: ["说明你在哪里。", "说明发生了什么和你需要什么帮助。"] },
      emergency: true,
    },
  },
];

const SCENARIO_GUIDE_VIEW = "guide";

function scenarioById(id = state.selectedSafe) {
  return safeScenarios.find((scenario) => scenario.id === id) || null;
}

function selectedRouteProfile() {
  return safeRouteProfiles.find((profile) => profile.id === state.selectedSafeRoute) || safeRouteProfiles[1];
}

function safeRouteDirectionsUrl() {
  const originCoordinates = state.safeRouteFromCoordinates || {};
  const destinationCoordinates = state.safeRouteToCoordinates || {};
  return buildGoogleMapsDirectionsUrl({
    origin: state.safeRouteFrom,
    originLat: originCoordinates.lat,
    originLng: originCoordinates.lng,
    destination: state.safeRouteTo,
    destinationLat: destinationCoordinates.lat,
    destinationLng: destinationCoordinates.lng,
    travelMode: "walking",
  });
}

function safeRouteSavedPlaces() {
  const ids = [...new Set(state.savedPlaces || [])];
  return ids
    .map((id) => state.favoritePlaces.find((place) => place.id === id) || state.catalogs.places.find((place) => place.id === id))
    .filter(Boolean);
}

function actionText(action, field) {
  const key = action[`${field}Key`];
  return key ? t(key) : localize(action[field]);
}

function safeIconSvg(id) {
  const icons = {
    followed: `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="16" r="7"></circle>
        <path d="M12 39c2-9 7-14 12-14s10 5 12 14"></path>
      </svg>
    `,
    night: `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M32 36a16 16 0 1 1-15-25 14 14 0 0 0 15 25Z"></path>
      </svg>
    `,
    door: `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M15 7h20v34H15z"></path>
        <path d="M29 24h2"></path>
      </svg>
    `,
    "lost-key": `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="18" cy="18" r="8"></circle>
        <path d="M24 24l13 13"></path>
        <path d="M32 32l-5 5"></path>
        <path d="M36 36l-4 4"></path>
      </svg>
    `,
    train: `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="14" y="8" width="20" height="25" rx="4"></rect>
        <path d="M18 15h12"></path>
        <path d="M18 24h12"></path>
        <path d="M18 40l5-7"></path>
        <path d="M30 33l5 7"></path>
      </svg>
    `,
    emergency: `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <text x="24" y="30" text-anchor="middle">SOS</text>
      </svg>
    `,
  };

  return icons[id] || `<span aria-hidden="true">${escapeHtml(id)}</span>`;
}

function renderAction(action, scenario) {
  if (action.behavior === "maps") {
    const url = buildGoogleMapsSearchUrl({ query: localize(action.mapQuery) });
    return `
      <a class="surface safe-action-v1-card safe-map-action ${scenario.emergency ? "is-emergency-soft" : ""}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${t("mapsOpenMaps")}. ${t("mapsOpensExternal")}`)}">
        <strong>${escapeHtml(actionText(action, "label"))}</strong>
        <span>${escapeHtml(actionText(action, "copy"))}</span>
      </a>
    `;
  }

  const attrs = {
    page: action.behavior === "page" ? `data-safe-action-page="${action.page}"` : "",
    safetyCall: action.behavior === "safetyCall" ? `data-safety-call-open` : "",
    communication: action.behavior === "communication" ? `data-safe-scroll-communication` : "",
    home: action.behavior === "home" ? `data-safe-home` : "",
    tip: action.behavior === "tip" ? `data-safe-action-tip="${escapeHtml(localize(action.tip))}"` : "",
    number: action.behavior === "number" ? `data-safe-number="${escapeHtml(action.number)}" data-safe-action-tip="${escapeHtml(localize(action.tip))}"` : "",
  };

  return `
    <button class="surface safe-action-v1-card ${scenario.emergency ? "is-emergency-soft" : ""}" type="button" ${Object.values(attrs).filter(Boolean).join(" ")}>
      <strong>${escapeHtml(actionText(action, "label"))}</strong>
      <span>${escapeHtml(actionText(action, "copy"))}</span>
    </button>
  `;
}

function phraseTranslation(phrase) {
  if (state.lang === "ja") return "";
  return `<p>${escapeHtml(phrase[state.lang] || phrase.en)}</p>`;
}

function renderCommunication(scenario) {
  return `
    <section id="safeCommunication" class="surface safe-communication-section">
      <p class="eyebrow">${t("safeCommunication")}</p>
      <div class="safe-phrase-list">
        ${scenario.phrases.map((phrase, index) => `
          <article class="safe-phrase-card">
            <div>
              <strong>${escapeHtml(phrase.ja).replaceAll("\n", "<br />")}</strong>
              ${phraseTranslation(phrase)}
            </div>
            <div class="safe-phrase-actions">
              <button class="soft-button" type="button" data-safe-phrase-show="${escapeHtml(phrase.ja)}">${t("safeShow")}</button>
              <button class="soft-button" type="button" data-safe-phrase-play="${escapeHtml(phrase.ja)}">${t("safePlay")}</button>
              <button class="text-button" type="button" data-safe-phrase-copy="${escapeHtml(phrase.ja)}">${t("safeCopy")}</button>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function listItems(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderWhy(scenario) {
  return `
    <section class="surface safe-why-section">
      <button class="safe-why-toggle" type="button" aria-expanded="true" aria-controls="safeWhyPanel" data-safe-why-toggle>
        <span>${t("safeWhyHelps")}</span>
        <span aria-hidden="true">−</span>
      </button>
      <div id="safeWhyPanel" class="safe-why-panel">
        <div>
          <strong>${t("safeAvoid")}</strong>
          ${listItems(localize(scenario.why.avoid))}
        </div>
        <div>
          <strong>${t("safeTips")}</strong>
          ${listItems(localize(scenario.why.tips))}
        </div>
        ${scenario.why.emergency ? `
          <div>
            <strong>${t("safeEmergencyInfo")}</strong>
            <ul>
              <li>${t("safePoliceEmergency")}: 110</li>
              <li>${t("safeAmbulanceFireEmergency")}: 119</li>
            </ul>
          </div>
        ` : ""}
      </div>
    </section>
  `;
}

function routeInputError(errorKey) {
  return errorKey ? `<p class="field-error" role="alert">${t(errorKey)}</p>` : "";
}

function routeLocationError() {
  if (!state.safeRouteLocationError) return "";
  return `
    <p class="field-error safe-route-inline-message" role="alert">
      ${t(state.safeRouteLocationError)} ${t("safeRouteEnterStartingPointInstead")}
    </p>
  `;
}

function renderSavedPlacesPicker() {
  if (!state.safeRouteSavedPickerOpen) return "";
  const savedPlaces = safeRouteSavedPlaces();
  return `
    <div class="surface safe-route-saved-picker" role="region" aria-label="${escapeHtml(t("safeRouteChooseSavedPlace"))}">
      <p>${t("safeRouteChooseSavedPlace")}</p>
      ${
        savedPlaces.length
          ? `<div class="safe-route-saved-list">
              ${savedPlaces.map((place) => `
                <button class="safe-route-saved-place" type="button" data-safe-route-saved-place="${escapeHtml(place.id)}">
                  <span>
                    <strong>${escapeHtml(place.name)}</strong>
                    <small>${escapeHtml([place.category, place.area].filter(Boolean).join(" · "))}</small>
                  </span>
                  <span>${t("safeRouteUseThisPlace")}</span>
                </button>
              `).join("")}
            </div>`
          : `<p class="safe-route-empty-copy">${t("safeRouteNoSavedPlaces")}</p>`
      }
    </div>
  `;
}

function renderRouteOption(profile) {
  const selected = profile.id === selectedRouteProfile().id;
  return `
    <button class="surface safe-route-option ${selected ? "is-selected" : ""}" type="button" data-safe-route-option="${escapeHtml(profile.id)}" aria-pressed="${selected}">
      <span class="safe-route-option-icon" aria-hidden="true">${escapeHtml(profile.icon)}</span>
      <span class="safe-route-option-copy">
        <span class="safe-route-option-head">
          <strong>${t(profile.titleKey)}</strong>
          ${profile.pick ? `<span class="prototype-badge safe-route-pick">${t("safeRoutePick")}</span>` : ""}
        </span>
        <small>${t(profile.labelKey)}</small>
      </span>
      <span class="safe-route-time">${t(profile.timeKey)}</span>
      <span class="safe-route-characteristics">
        ${profile.characteristics.map((key) => `<span>${t(key)}</span>`).join("")}
      </span>
    </button>
  `;
}

function renderComfortPoints(profile) {
  if (!profile.comfortPoints?.length) return "";
  return `
    <section class="safe-route-comfort">
      <h4>${t("safeRouteAlongTheWay")}</h4>
      <p>${t("safeRouteComfortCopy")}</p>
      <div class="tag-row">
        ${profile.comfortPoints.map((key) => `<span class="tag">${t(key)}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderRoutePreview(profile) {
  return `
    <aside class="surface safe-route-preview" aria-label="${escapeHtml(t("safeRoutePreviewTitle"))}">
      <span class="prototype-badge">${t("mapsPrototypeMap")}</span>
      <h4>${t("safeRoutePreviewTitle")}</h4>
      <div class="safe-route-preview-line is-${escapeHtml(profile.id)}" aria-hidden="true">
        <span>${t("safeRouteFrom")}</span>
        <i></i>
        <span>${t("safeRouteTo")}</span>
      </div>
      <p>${t("safeRoutePreviewCopy")}</p>
    </aside>
  `;
}

function renderRouteDetail() {
  const profile = selectedRouteProfile();
  const mapsUrl = safeRouteDirectionsUrl();
  return `
    <section class="safe-route-detail-grid">
      <article class="surface safe-route-detail" id="safeRouteDetail" aria-live="polite">
        <div class="safe-route-detail-head">
          <div>
            <p class="eyebrow">${t("safeRouteSelectedRoute")}</p>
            <h3>${t(profile.titleKey)}</h3>
          </div>
          <span class="safe-route-time is-large">${t(profile.timeKey)}</span>
        </div>
        <div>
          <h4>${t("safeRouteWhyChoose")}</h4>
          <ul class="safe-route-checklist">
            ${profile.reasons.map((key) => `<li><span aria-hidden="true">✓</span>${t(key)}</li>`).join("")}
          </ul>
        </div>
        ${profile.tradeoffKey ? `
          <div class="safe-route-tradeoff">
            <strong>${t("safeRouteTradeoff")}</strong>
            <p>${t(profile.tradeoffKey)}</p>
          </div>
        ` : ""}
        ${renderComfortPoints(profile)}
        <div class="safe-route-handoff">
          <p>${t("safeRouteGoogleHandoffNote")}</p>
          ${mapsUrl
            ? `<a class="button" href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${t("safeRouteContinueMaps")}. ${t("mapsOpensExternal")}`)}">${t("safeRouteContinueMaps")}</a>`
            : `<button class="button" type="button" disabled>${t("safeRouteContinueMaps")}</button>`}
        </div>
        <p class="safe-route-closing">${t("safeRouteClosingNote")}</p>
      </article>
      ${renderRoutePreview(profile)}
    </section>
  `;
}

function renderSafeRoute() {
  const fromValue = state.safeRouteFromSource === "currentLocation" ? t("safeRouteCurrentLocation") : state.safeRouteFrom;
  return `
    <div class="safe-detail-v1 safe-route-view">
      <button class="text-button safe-back-button" type="button" data-safe-home>${t("safeBack")}</button>
      <section class="surface safe-route-head">
        <div>
          <p class="eyebrow">${t("safeHeroTitle")}</p>
          <h1 class="section-title">${t("safeRouteTitle")}</h1>
          <p class="section-copy">${t("safeRouteSubtitle")}</p>
        </div>
        <p class="safe-route-disclosure">${t("safeRoutePrototypeDisclosure")}</p>
      </section>

      <form class="surface safe-route-form" data-safe-route-form novalidate>
        <div class="safe-route-fields">
          <div class="safe-route-field-group">
            <label class="field">
              <span>${t("safeRouteFrom")}</span>
              <input name="safeRouteFrom" data-safe-route-input="from" value="${escapeHtml(fromValue)}" placeholder="${escapeHtml(t("safeRouteFromPlaceholder"))}" autocomplete="street-address" />
              ${routeInputError(state.safeRouteFromError)}
            </label>
            <div class="safe-route-quick-actions">
              <button class="soft-button" type="button" data-safe-route-current-location aria-label="${escapeHtml(t("safeRouteUseCurrentLocation"))}" ${state.safeRouteLocationStatus === "loading" ? "disabled" : ""}>
                <span aria-hidden="true">📍</span>
                ${state.safeRouteLocationStatus === "loading" ? t("safeRouteUseCurrentLocation") : t("safeRouteCurrentLocation")}
              </button>
            </div>
            ${routeLocationError()}
          </div>
          <div class="safe-route-field-group">
            <label class="field">
              <span>${t("safeRouteTo")}</span>
              <input name="safeRouteTo" data-safe-route-input="to" value="${escapeHtml(state.safeRouteTo)}" placeholder="${escapeHtml(t("safeRouteToPlaceholder"))}" autocomplete="street-address" />
              ${routeInputError(state.safeRouteToError)}
            </label>
            <div class="safe-route-quick-actions">
              <button class="soft-button" type="button" data-safe-route-saved-toggle aria-expanded="${state.safeRouteSavedPickerOpen}" aria-controls="safeRouteSavedPicker">
                <span aria-hidden="true">♡</span>
                ${t("safeRouteSavedPlaces")}
              </button>
            </div>
            <div id="safeRouteSavedPicker">
              ${renderSavedPlacesPicker()}
            </div>
          </div>
        </div>
        <button class="button" type="submit">${t("safeRouteFindRoutes")}</button>
      </form>

      ${state.safeRouteHasResults ? `
        <section class="safe-route-results">
          <div class="section-head places-subhead">
            <div>
              <p class="eyebrow">${t("safeRouteChooseEyebrow")}</p>
              <h3>${t("safeRouteChooseRoute")}</h3>
              <p>${t("safeRouteChooseCopy")}</p>
            </div>
          </div>
          <div class="safe-route-options" role="radiogroup" aria-label="${escapeHtml(t("safeRouteChooseRoute"))}">
            ${safeRouteProfiles.map(renderRouteOption).join("")}
          </div>
          ${renderRouteDetail()}
        </section>
      ` : `
        <section class="surface safe-route-empty-state">
          <h3>${t("safeRouteBeforeResultsTitle")}</h3>
          <p>${t("safeRouteBeforeResultsCopy")}</p>
        </section>
      `}
    </div>
  `;
}

function countdownLabel() {
  return timeLabel(state.safetyCallRemaining);
}

function callDurationLabel() {
  return timeLabel(state.safetyCallDuration);
}

function timeLabel(value) {
  const seconds = Math.max(0, Number(value) || 0);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function renderSafetyCallIntro() {
  return `
    <div class="safety-call-intro">
      <div>
        <p class="eyebrow">${t("safetyCallTitle")}</p>
        <h2>${t("safetyCallFeelingTitle")}</h2>
        <p>${t("safetyCallFeelingCopy")}</p>
        <p class="safety-call-note">${t("safetyCallShortExplanation")}</p>
      </div>
      <div class="safety-call-actions">
        <button class="button" type="button" data-safety-call-open>${t("safetyCallStart")}</button>
        <div class="safety-call-secondary">
          <button class="soft-button" type="button" data-safe-route-open>${t("safetyCallOpenSafeRoute")}</button>
          <button class="soft-button" type="button" data-safe-scenario-guide>${t("safetyCallScenarioGuide")}</button>
          <button class="soft-button" type="button" data-safety-call-emergency-phrases="${escapeHtml(t("safetyCallEmergencyPhraseText"))}">${t("safetyCallEmergencyPhrases")}</button>
        </div>
      </div>
    </div>
  `;
}

function renderSafetyCallCallerChoice() {
  const caller = safetyCaller();
  return `
    <div class="safety-call-stage">
      <div>
        <p class="eyebrow">${t("safetyCallTitle")}</p>
        <h2>${t("safetyCallChooseCaller")}</h2>
        <p>${t("safetyCallChooseCallerCopy")}</p>
      </div>
      <div class="safety-caller-grid" role="radiogroup" aria-label="${escapeHtml(t("safetyCallChooseCaller"))}">
        ${safetyCallCallers.map((item) => `
          <button class="safety-caller-card ${item.id === caller.id ? "is-selected" : ""}" type="button" data-safety-call-caller="${escapeHtml(item.id)}" aria-pressed="${item.id === caller.id}">
            <span class="safety-caller-avatar" aria-hidden="true">${escapeHtml(item.avatar)}</span>
            <span>
              <strong>${escapeHtml(localize(item.name))}</strong>
              <small>${escapeHtml(localize(item.preview))}</small>
            </span>
          </button>
        `).join("")}
      </div>
      <div class="safety-call-footer">
        <button class="text-button" type="button" data-safety-call-step="intro">${t("safetyCallBack")}</button>
        <button class="button" type="button" data-safety-call-step="delay">${t("safetyCallContinue")}</button>
      </div>
    </div>
  `;
}

function renderSafetyCallDelayChoice() {
  const delay = safetyDelay();
  return `
    <div class="safety-call-stage">
      <div>
        <p class="eyebrow">${t("safetyCallTitle")}</p>
        <h2>${t("safetyCallChooseDelay")}</h2>
        <p>${t("safetyCallChooseDelayCopy")}</p>
        <p class="safety-call-note">${t("safetyCallDefaultDelay")}</p>
      </div>
      <div class="safety-delay-grid" role="radiogroup" aria-label="${escapeHtml(t("safetyCallChooseDelay"))}">
        ${safetyCallDelays.map((item) => `
          <button class="safety-delay-button ${item.value === delay.value ? "is-selected" : ""}" type="button" data-safety-call-delay="${escapeHtml(item.value)}" aria-pressed="${item.value === delay.value}">
            ${t(item.key)}
          </button>
        `).join("")}
      </div>
      <div class="safety-call-footer">
        <button class="soft-button" type="button" data-safety-call-sound aria-pressed="${state.safetyCallSoundOn}">
          ${state.safetyCallSoundOn ? t("safetyCallSoundOn") : t("safetyCallSoundOff")}
        </button>
        <button class="text-button" type="button" data-safety-call-step="caller">${t("safetyCallBack")}</button>
        <button class="button" type="button" data-safety-call-begin>${t("safetyCallStart")}</button>
      </div>
    </div>
  `;
}

function renderSafetyCallCountdown() {
  return `
    <div class="safety-call-stage safety-call-centered" aria-live="polite">
      <p class="eyebrow">${t("safetyCallTitle")}</p>
      <h2>${t("safetyCallPreparing")}</h2>
      <div class="safety-countdown">${countdownLabel()}</div>
      <button class="soft-button" type="button" data-safety-call-cancel>${t("safetyCallCancel")}</button>
    </div>
  `;
}

function renderSafetyCallIncoming() {
  const caller = safetyCaller();
  return `
    <div class="safety-call-stage safety-call-centered">
      <p class="eyebrow">${t("safetyCallIncoming")}</p>
      <div class="safety-incoming-orb" aria-hidden="true">${escapeHtml(caller.avatar)}</div>
      <h2>${escapeHtml(localize(caller.name))}</h2>
      <p>${t("safetyCallRingingCopy")}</p>
      <div class="safety-call-footer is-centered">
        <button class="soft-button" type="button" data-safety-call-decline>${t("safetyCallDecline")}</button>
        <button class="button" type="button" data-safety-call-accept>${t("safetyCallAccept")}</button>
      </div>
      <button class="text-button" type="button" data-safety-call-sound aria-pressed="${state.safetyCallSoundOn}">
        ${state.safetyCallSoundOn ? t("safetyCallSoundOn") : t("safetyCallSoundOff")}
      </button>
    </div>
  `;
}

function renderSafetyCallConversation() {
  const caller = safetyCaller();
  const messages = localize(caller.messages);
  const visibleMessages = messages.slice(0, Math.max(1, state.safetyCallVisibleMessages));
  return `
    <div class="safety-call-stage safety-call-connected">
      <div class="safety-connected-head">
        <div class="safety-connected-status">
          <span class="safety-live-dot" aria-hidden="true"></span>
          <span>${t("safetyCallConnected")}</span>
        </div>
        <strong>${callDurationLabel()}</strong>
      </div>
      <div class="safety-connected-person">
        <span class="safety-caller-avatar" aria-hidden="true">${escapeHtml(caller.avatar)}</span>
        <div>
          <p class="eyebrow">${t("safetyCallConversation")}</p>
          <h2>${escapeHtml(localize(caller.name))}</h2>
          <p>${t("safetyCallDuration")}: ${callDurationLabel()}</p>
        </div>
      </div>
      <div class="safety-message-list" aria-live="polite">
        ${visibleMessages.map((message) => `
          <div class="safety-message">
            <strong>${escapeHtml(localize(caller.name))}</strong>
            <span>${escapeHtml(message)}</span>
          </div>
        `).join("")}
      </div>
      <div class="safety-call-footer">
        <button class="button" type="button" data-safety-call-end>${t("safetyCallEnd")}</button>
      </div>
    </div>
  `;
}

function renderSafetyCallFinished() {
  return `
    <div class="safety-call-stage safety-call-centered">
      <p class="eyebrow">${t("safetyCallTitle")}</p>
      <h2>${t("safetyCallFinishedTitle")}</h2>
      <p>${t("safetyCallFinishedCopy")}</p>
      <div class="safety-call-footer is-centered">
        <button class="soft-button" type="button" data-safe-route-open>${t("safetyCallOpenSafeRoute")}</button>
        <button class="button" type="button" data-safety-call-done>${t("safetyCallDone")}</button>
      </div>
    </div>
  `;
}

function renderSafetyCall() {
  const step = state.safetyCallStep || "intro";
  const content = {
    intro: renderSafetyCallIntro,
    caller: renderSafetyCallCallerChoice,
    delay: renderSafetyCallDelayChoice,
    countdown: renderSafetyCallCountdown,
    incoming: renderSafetyCallIncoming,
    conversation: renderSafetyCallConversation,
    finished: renderSafetyCallFinished,
  }[step]?.() || renderSafetyCallIntro();

  return `
    <section id="safetyCall" class="surface safety-call-panel safety-call-${escapeHtml(step)}" aria-label="${escapeHtml(t("safetyCallTitle"))}">
      ${content}
    </section>
  `;
}

function renderScenarioHome() {
  return `
    <section class="safe-v1-hero">
      <div class="safe-v1-copy">
        <p class="safe-v1-brand">${t("safeHeroTitle")}</p>
        <span class="safe-v1-rule" aria-hidden="true"></span>
        <h1>${t("safeHeroSupport")}</h1>
        <p>${t("safeWhatHappened")}</p>
      </div>
      <div class="safe-hero-visual" aria-hidden="true">
        <img src="${ASSET_ROOT}nightwalk.png" alt="" />
      </div>
    </section>
    ${renderSafetyCall()}
    ${renderScenarioCards()}
  `;
}

function renderScenarioCards() {
  return `
    <div id="safeScenarioGuide" class="safe-scenario-grid">
      ${safeScenarios.map((scenario) => `
        <button class="surface safe-scenario-card ${scenario.emergency ? "is-emergency" : ""}" type="button" data-safe="${scenario.id}">
          <span class="safe-scenario-icon ${scenario.emergency ? "is-emergency" : ""}">${safeIconSvg(scenario.id)}</span>
          <span>
            <strong>${escapeHtml(localize(scenario.title))}</strong>
            <small>${escapeHtml(localize(scenario.description))}</small>
          </span>
          <span class="safe-scenario-arrow" aria-hidden="true">›</span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderScenarioGuideSelection() {
  return `
    <div class="safe-detail-v1">
      <section class="surface safe-scenario-detail-head">
        <div>
          <p class="eyebrow">${t("safeHeroTitle")}</p>
          <h1 class="section-title">${t("safetyCallScenarioGuide")}</h1>
          <p class="section-copy">${t("safeWhatHappened")}</p>
        </div>
      </section>
      ${renderScenarioCards()}
    </div>
  `;
}

function renderScenarioDetail(scenario) {
  return `
    <div class="safe-detail-v1">
      <button class="text-button safe-back-button" type="button" data-safe-home>${t("safeBack")}</button>
      <section class="surface safe-scenario-detail-head ${scenario.emergency ? "is-emergency" : ""}">
        <span class="safe-scenario-icon ${scenario.emergency ? "is-emergency" : ""}" aria-hidden="true">${safeIconSvg(scenario.id)}</span>
        <div>
          <p class="eyebrow">${t("safeHeroTitle")}</p>
          <h1 class="section-title">${escapeHtml(localize(scenario.title))}</h1>
          <p class="section-copy">${escapeHtml(localize(scenario.support))}</p>
        </div>
      </section>

      <section>
        <div class="section-head places-subhead">
          <div>
            <p class="eyebrow">${t("safeRecommendedActions")}</p>
            <h3>${t("safeTakeStep")}</h3>
          </div>
        </div>
        <div class="safe-action-v1-grid">
          ${scenario.actions.slice(0, 4).map((action) => renderAction(action, scenario)).join("")}
        </div>
      </section>

      ${renderCommunication(scenario)}
      ${renderWhy(scenario)}

      <p class="safe-ending-copy">${t("safeTakeStep")}</p>
    </div>
  `;
}

export function renderSafe() {
  if (state.selectedSafe === "route") {
    return pageShell(renderSafeRoute(), "safe-v1-page");
  }
  if (state.selectedSafe === SCENARIO_GUIDE_VIEW) {
    return pageShell(renderScenarioGuideSelection(), "safe-v1-page");
  }
  const selected = scenarioById();
  return pageShell(selected ? renderScenarioDetail(selected) : renderScenarioHome(), "safe-v1-page");
}
