import { state, ASSET_ROOT } from '../state.js';
import { t } from '../i18n.js';
import { pageShell } from '../components/layout.js';

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
        label: { en: "Safe Route", ja: "明るい道へ", zh: "安全路线" },
        copy: { en: "Find a brighter, busier route.", ja: "明るく人のいる道を選びます。", zh: "选择更明亮、人更多的路线。" },
        behavior: "tip",
        tip: { en: "Safe Route MVP: choose a brighter, busier route and avoid going straight home.", ja: "明るく人の多い道へ移動し、心配な時はそのまま帰宅しないでください。", zh: "请往明亮、人多的路线移动，感到不安时不要直接回家。" },
      },
      {
        label: { en: "Fake Call", ja: "フェイクコール", zh: "假电话" },
        copy: { en: "Make it look like someone is waiting for you.", ja: "誰かが待っているように見せます。", zh: "让对方感觉有人在等你。" },
        behavior: "page",
        page: "fakeCall",
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
      { label: { en: "Safe Route", ja: "明るい道へ", zh: "安全路线" }, copy: { en: "Choose a brighter and busier way home.", ja: "明るく人のいる帰り道を選びます。", zh: "选择更明亮、人更多的回家路。" }, behavior: "tip", tip: { en: "Use bright streets, station exits, convenience stores, and roads with people nearby.", ja: "明るい通り、駅、コンビニ、人通りのある道を選んでください。", zh: "选择明亮街道、车站出口、便利店和有人经过的路。" } },
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

function scenarioById(id = state.selectedSafe) {
  return safeScenarios.find((scenario) => scenario.id === id) || null;
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
  const attrs = {
    page: action.behavior === "page" ? `data-safe-action-page="${action.page}"` : "",
    communication: action.behavior === "communication" ? `data-safe-scroll-communication` : "",
    home: action.behavior === "home" ? `data-safe-home` : "",
    tip: action.behavior === "tip" ? `data-safe-action-tip="${escapeHtml(localize(action.tip))}"` : "",
    number: action.behavior === "number" ? `data-safe-number="${escapeHtml(action.number)}" data-safe-action-tip="${escapeHtml(localize(action.tip))}"` : "",
  };

  return `
    <button class="surface safe-action-v1-card ${scenario.emergency ? "is-emergency-soft" : ""}" type="button" ${Object.values(attrs).filter(Boolean).join(" ")}>
      <strong>${escapeHtml(localize(action.label))}</strong>
      <span>${escapeHtml(localize(action.copy))}</span>
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
      <button class="safe-why-toggle" type="button" aria-expanded="false" aria-controls="safeWhyPanel" data-safe-why-toggle>
        <span>${t("safeWhyHelps")}</span>
        <span aria-hidden="true">+</span>
      </button>
      <div id="safeWhyPanel" class="safe-why-panel" hidden>
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
              <li>Police: 110</li>
              <li>Ambulance / Fire: 119</li>
            </ul>
          </div>
        ` : ""}
      </div>
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
    <div class="safe-scenario-grid">
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
  const selected = scenarioById();
  return pageShell(selected ? renderScenarioDetail(selected) : renderScenarioHome(), "safe-v1-page");
}
