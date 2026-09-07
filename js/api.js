import {
  favoritePlaceIds,
  livingGuides as localLivingGuides,
  places as localPlaces,
  safetyGuides as localSafetyGuides,
  savedDayPlans as localSavedDayPlans,
} from './data.js';
import { ASSISTANT_API_URL, USE_REMOTE_DATA_API } from './config.js';

const API_ROOT = new URL('../backend/api/', import.meta.url);
const FALLBACK_MESSAGE = 'API unavailable, using local fallback data.';
const REQUEST_TIMEOUT_MS = 3500;
let fallbackWarningShown = false;

const assistantFallbackCopy = {
  en: {
    backup: "I cannot reach the AI service right now, so this is a simple backup response.",
    emergency: "If this feels urgent or you may be in immediate danger, use emergency services first. I can open HER Safe for you.",
    followed: "Move toward a bright, staffed public place if you can. I can open the Being Followed guide in HER Safe.",
    night: "Choose brighter streets and staffed places if you can. I can open the Walking Home guide in HER Safe.",
    door: "Keep the door locked and use the intercom or peephole. I can open the Stranger at Door guide in HER Safe.",
    train: "Move toward other passengers or station staff if you can. I can open the train harassment guide in HER Safe.",
    ride: "Share your location and ask to stop somewhere bright and staffed if you can. I can open the unsafe ride guide in HER Safe.",
    washing: "Start with dry, visible checks only and stop near electricity or heavy leakage. I can open the washing machine guide in HER Living.",
    utilities: "For electricity, gas, or utility setup, use official provider or building contacts. I can open a HER Living guide.",
    toilet: "Do not flush repeatedly. I can open the toilet guide in HER Living.",
    hospital: "Prepare your insurance card and symptoms note. I can open the first hospital visit guide in HER Living.",
    places: "A quieter place can help when you want a soft pause. I can open HER Places.",
    day: "I can open HER Day so you can use the app's existing planning tools.",
    none: "Start with your immediate safety. If this is urgent, use emergency services first. Otherwise, tell me a little more and I will point you to the right HER OWN guide.",
    openSafe: "Open Safe Guide",
    openLiving: "Open Living Guide",
    openPlaces: "Open HER Places",
    openDay: "Open HER Day",
    openMy: "Open My Page",
  },
  ja: {
    backup: "現在AIサービスに接続できないため、これは簡易バックアップ応答です。",
    emergency: "緊急の危険を感じる場合は、まず緊急連絡を優先してください。HER Safeを開けます。",
    followed: "可能なら明るくスタッフのいる場所へ向かってください。HER Safeの尾行ガイドを開けます。",
    night: "可能なら明るい道や人のいる場所を選んでください。HER Safeの夜道ガイドを開けます。",
    door: "ドアは開けず、インターホンやのぞき穴で確認してください。HER Safeの玄関ガイドを開けます。",
    train: "可能なら他の乗客や駅員の近くへ移動してください。HER Safeの電車内ガイドを開けます。",
    ride: "位置情報を共有し、明るく人のいる場所で降りられるか確認してください。HER Safeの乗車ガイドを開けます。",
    washing: "電気や大きな水漏れがある場合は触らず止めてください。HER Livingの洗濯機ガイドを開けます。",
    utilities: "電気・ガス・水道は公式窓口や管理会社に確認しましょう。HER Livingのガイドを開けます。",
    toilet: "何度も流さず、水位を落ち着かせてください。HER Livingのトイレガイドを開けます。",
    hospital: "保険証と症状メモを用意すると安心です。HER Livingの初診ガイドを開けます。",
    places: "静かな場所で一息つく選択もできます。HER Placesを開けます。",
    day: "無理のない、やさしいひとり時間から作れます。HER Dayを開けます。",
    none: "まず今の安全を確認してください。緊急なら緊急連絡を優先し、そうでなければ状況をもう少し教えてください。",
    openSafe: "Safeガイドを開く",
    openLiving: "Livingガイドを開く",
    openPlaces: "HER Placesを開く",
    openDay: "HER Dayを開く",
    openMy: "My Pageを開く",
  },
  zh: {
    backup: "我现在无法连接 AI 服务，所以这是一个简单的备用回复。",
    emergency: "如果你觉得情况紧急或有立即危险，请先联系紧急服务。我可以为你打开 HER Safe。",
    followed: "如果可以，先走向明亮、有工作人员的公共场所。我可以打开 HER Safe 的被尾随指南。",
    night: "如果可以，选择更明亮、有人的道路。我可以打开 HER Safe 的夜归指南。",
    door: "先保持门锁好，通过门铃对讲或猫眼确认。我可以打开 HER Safe 的门外陌生人指南。",
    train: "如果可以，移动到其他乘客或站务员附近。我可以打开 HER Safe 的电车骚扰指南。",
    ride: "分享位置，并尽量在明亮、有人的地方下车。我可以打开 HER Safe 的乘车不安指南。",
    washing: "只做干燥、可见的检查；靠近电或严重漏水时请停止。我可以打开 HER Living 的洗衣机指南。",
    utilities: "电、燃气、水务问题请优先确认官方窗口或管理公司。我可以打开 HER Living 指南。",
    toilet: "不要反复冲水，先观察水位。我可以打开 HER Living 的厕所堵塞指南。",
    hospital: "准备医保卡和症状记录会更安心。我可以打开 HER Living 的初诊指南。",
    places: "找一个安静的地方暂停一下也很好。我可以打开 HER Places。",
    day: "可以先从一个轻松的独处日开始。我可以打开 HER Day。",
    none: "先确认你当下是否安全。如果紧急，请先联系紧急服务；如果不紧急，可以再告诉我一点情况。",
    openSafe: "打开 Safe 指南",
    openLiving: "打开 Living 指南",
    openPlaces: "打开 HER Places",
    openDay: "打开 HER Day",
    openMy: "打开 My Page",
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function warnFallback() {
  if (!fallbackWarningShown) {
    console.warn(FALLBACK_MESSAGE);
    fallbackWarningShown = true;
  }
}

async function request(endpoint, options = {}) {
  const { timeoutMs = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(new URL(endpoint, API_ROOT), {
      ...fetchOptions,
      headers: {
        Accept: 'application/json',
        ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
        ...fetchOptions.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    if (!payload || payload.success !== true || !Object.prototype.hasOwnProperty.call(payload, 'data')) {
      throw new Error('Invalid API response format');
    }

    return payload.data;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function withFallback(loader, fallback) {
  try {
    return await loader();
  } catch (error) {
    warnFallback();
    return clone(fallback);
  }
}

async function assistantClientFallback(message, lang) {
  console.warn("[HER Assistant] CLIENT FALLBACK USED");
  return {
    ...clone(localAssistantFallback(message, lang)),
    source: "client_fallback",
  };
}

function copyForLang(lang) {
  return assistantFallbackCopy[lang] || assistantFallbackCopy.en;
}

function localAssistantFallback(message = '', lang = 'en') {
  const copy = copyForLang(lang);
  const lower = String(message).trim().toLowerCase();
  const has = (...words) => words.some((word) => lower.includes(word));
  const reply = (key) => `${copy.backup} ${copy[key]}`.trim();

  if (has('urgent', 'emergency', 'danger', 'help me', '助けて', '緊急', '危険', '救命', '紧急', '危险', '救命', '救我')) {
    return { reply: reply('emergency'), action: { type: 'safe_scenario', label: copy.openSafe, target: 'emergency' }, fallback: true };
  }
  if (has('follow', 'following', 'stalk', '尾行', 'ついて', '跟踪', '尾随')) {
    return { reply: reply('followed'), action: { type: 'safe_scenario', label: copy.openSafe, target: 'followed' }, fallback: true };
  }
  if (has('walking home', 'walk home', 'night', '夜道', '帰る', '夜归', '回家')) {
    return { reply: reply('night'), action: { type: 'safe_scenario', label: copy.openSafe, target: 'night' }, fallback: true };
  }
  if (has('door', 'stranger', 'knock', '玄関', 'ドア', '陌生人', '敲门', '门外')) {
    return { reply: reply('door'), action: { type: 'safe_scenario', label: copy.openSafe, target: 'door' }, fallback: true };
  }
  if (has('train', 'harass', '電車', '痴漢', '骚扰', '电车')) {
    return { reply: reply('train'), action: { type: 'safe_scenario', label: copy.openSafe, target: 'train' }, fallback: true };
  }
  if (has('taxi', 'ride', 'driver', 'タクシー', '車', '出租车', '司机')) {
    return { reply: reply('ride'), action: { type: 'safe_scenario', label: copy.openSafe, target: 'ride' }, fallback: true };
  }
  if (has('washing machine', 'laundry', 'drain', '洗濯機', '排水', '洗衣机')) {
    return { reply: reply('washing'), action: { type: 'living_guide', label: copy.openLiving, target: 'washing-machine-drain' }, fallback: true };
  }
  if (has('electric', 'gas', 'utility', 'utilities', 'bill', '電気', 'ガス', '水道', '电', '燃气', '水费')) {
    return { reply: reply('utilities'), action: { type: 'living_guide', label: copy.openLiving, target: 'utilities-setup' }, fallback: true };
  }
  if (has('toilet', 'clog', 'トイレ', '詰まり', '厕所', '堵')) {
    return { reply: reply('toilet'), action: { type: 'living_guide', label: copy.openLiving, target: 'toilet-clogged' }, fallback: true };
  }
  if (has('hospital', 'clinic', 'doctor', '病院', '初診', '医院', '看病')) {
    return { reply: reply('hospital'), action: { type: 'living_guide', label: copy.openLiving, target: 'first-hospital-visit' }, fallback: true };
  }
  if (has('quiet', 'place', 'cafe', 'alone', 'somewhere', '静か', '場所', 'カフェ', '安静', '地点', '咖啡')) {
    return { reply: reply('places'), action: { type: 'places', label: copy.openPlaces, target: 'places' }, fallback: true };
  }
  if (has('today', 'day', 'plan', '何する', '今日', '一天', '今天', '计划')) {
    return { reply: reply('day'), action: { type: 'day', label: copy.openDay, target: 'day' }, fallback: true };
  }
  if (has('saved', 'favorite', 'note', 'my page', '保存', 'お気に入り', 'メモ', '收藏', '笔记', '我的')) {
    return { reply: reply('none'), action: { type: 'mypage', label: copy.openMy, target: 'mypage' }, fallback: true };
  }

  return { reply: reply('none'), action: { type: 'none', label: '', target: '' }, fallback: true };
}

function asPercentScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return score <= 5 ? Math.round(score * 20) : Math.round(score);
}

function normalizePlace(place) {
  return {
    id: String(place.id),
    name: place.name,
    category: place.category === 'Flower' ? 'Flower Shop' : place.category,
    distance: place.distance || 'Nearby',
    budget: place.price_note || place.budget || (place.average_price_yen ? `${place.average_price_yen} yen` : ''),
    open: place.open ?? Boolean(Number(place.is_active ?? 1)),
    safe: asPercentScore(place.safe_score ?? place.safe),
    solo: asPercentScore(place.solo_friendly_score ?? place.solo),
    women: asPercentScore(place.women_friendly_score ?? place.women),
    area: place.area || '',
    address: place.address || '',
    hours: place.hours || place.opening_hours || '',
    reason: place.recommended_reason || place.reason || '',
    womenFriendly: place.women_friendly_notes || place.womenFriendly || '',
    soloReason: place.solo_notes || place.soloReason || '',
    review: place.review || '',
    imageUrl: place.image_url || place.imageUrl || '',
    favoriteId: place.favorite_id ? String(place.favorite_id) : null,
    favoriteNote: place.favorite_note || '',
  };
}

function normalizeSafetyGuide(guide) {
  const identity = {
    'train-harassment': ['train', '🚇'],
    'being-followed': ['followed', '🚶'],
    'walking-home': ['night', '🌃'],
    'stranger-at-door': ['door', '🏠'],
    'unsafe-ride': ['ride', '🚕'],
    emergency: ['emergency', '🆘'],
  }[guide.slug] || [String(guide.id), '◇'];

  return {
    id: identity[0],
    icon: identity[1],
    title: guide.title,
    subtitle: guide.summary || '',
    phrase: guide.say_it_loudly || '',
    steps: (guide.steps || []).map((step) => [step.title, step.body]),
  };
}

function normalizeLivingGuide(guide) {
  return {
    id: guide.slug || String(guide.id),
    category: guide.category,
    title: guide.title,
    risk: guide.risk_level ? `${guide.risk_level.charAt(0).toUpperCase()}${guide.risk_level.slice(1)}` : 'Low',
    time: guide.estimated_time_minutes ? `${guide.estimated_time_minutes} min` : '',
    diy: Boolean(Number(guide.can_do_myself)) ? 'Yes' : 'Mostly',
    tools: Array.isArray(guide.tools_needed) ? guide.tools_needed : [],
    problem: guide.summary || '',
    steps: (guide.steps || []).map((step) => step.body),
    warning: guide.warning || '',
    phrases: Array.isArray(guide.japanese_phrases) ? guide.japanese_phrases : [],
  };
}

function normalizeDayPlan(plan) {
  const preference = plan.preference || String(plan.notes || '').match(/^Preference:\s*(.+)$/)?.[1] || '';
  return {
    id: String(plan.id),
    title: plan.title,
    mood: plan.mood || '',
    area: plan.area || '',
    duration: plan.duration || '',
    budget: plan.budget || (plan.budget_yen ? `${plan.budget_yen} yen` : ''),
    preference,
    stops: (plan.stops || []).map((stop) => {
      const time = String(stop.start_time || '').slice(0, 5);
      const title = stop.title || stop.place_name || stop.category || 'Stop';
      return `${time} ${title}`.trim();
    }),
  };
}

export async function fetchPlaces(filters = {}) {
  if (!USE_REMOTE_DATA_API) {
    return clone(localPlaces);
  }

  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  const endpoint = `places.php${queryString ? `?${queryString}` : ''}`;
  return withFallback(async () => {
    const data = await request(endpoint);
    if (!Array.isArray(data) || data.length === 0) throw new Error('Places data is empty');
    return data.map(normalizePlace);
  }, localPlaces);
}

export async function fetchSafetyGuides() {
  if (!USE_REMOTE_DATA_API) {
    return clone(localSafetyGuides);
  }

  return withFallback(async () => {
    const data = await request('safety-guides.php');
    if (!Array.isArray(data) || data.length === 0) throw new Error('Safety guide data is empty');
    return data.map(normalizeSafetyGuide);
  }, localSafetyGuides);
}

export async function fetchLivingGuides() {
  if (!USE_REMOTE_DATA_API) {
    return clone(localLivingGuides);
  }

  return withFallback(async () => {
    const data = await request('living-guides.php');
    if (!Array.isArray(data) || data.length === 0) throw new Error('Living guide data is empty');
    return data.map(normalizeLivingGuide);
  }, localLivingGuides);
}

export async function fetchFavorites(userId) {
  const localFavorites = localPlaces.filter((place) => favoritePlaceIds.includes(place.id));
  if (!USE_REMOTE_DATA_API) {
    return clone(localFavorites);
  }

  return withFallback(async () => {
    const data = await request(`favorites.php?user_id=${encodeURIComponent(userId)}`);
    if (!Array.isArray(data)) throw new Error('Invalid favorites data');
    return data.map(normalizePlace);
  }, localFavorites);
}

export async function fetchDayPlans(userId) {
  if (!USE_REMOTE_DATA_API) {
    return clone(localSavedDayPlans);
  }

  return withFallback(async () => {
    const data = await request(`day-plans.php?user_id=${encodeURIComponent(userId)}`);
    if (!Array.isArray(data)) throw new Error('Invalid day plan data');
    return data.map(normalizeDayPlan);
  }, localSavedDayPlans);
}

export async function saveFavoritePlace(userId, placeId) {
  if (!USE_REMOTE_DATA_API) {
    return { userId, placeId, savedLocally: true, remoteSkipped: true };
  }

  return withFallback(
    () => {
      const numericPlaceId = Number(placeId);
      if (!Number.isInteger(numericPlaceId) || numericPlaceId < 1) {
        throw new Error('Local place does not have a backend id');
      }
      return request('favorites.php', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          place_id: numericPlaceId,
        }),
      });
    },
    { userId, placeId, savedLocally: true }
  );
}

export async function saveDayPlan(userId, plan) {
  if (!USE_REMOTE_DATA_API) {
    return { ...plan, userId, savedLocally: true, remoteSkipped: true };
  }

  return withFallback(
    () => request('day-plans.php', {
      method: 'POST',
      body: JSON.stringify({
        ...plan,
        user_id: userId,
      }),
    }),
    { ...plan, userId, savedLocally: true }
  );
}

export async function askAssistant(message, context = {}) {
  const lang = context.lang || 'en';
  const history = Array.isArray(context.history) ? context.history : [];
  try {
    const data = await request(ASSISTANT_API_URL, {
        method: 'POST',
        body: JSON.stringify({
          message,
          lang,
          page: context.page || '',
          history,
        }),
        timeoutMs: 10000,
      });

    if (!data || typeof data.reply !== 'string' || typeof data.action !== 'object') {
      throw new Error('Invalid assistant response format');
    }

    const response = {
      reply: data.reply,
      action: {
        type: data.action?.type || 'none',
        label: data.action?.label || '',
        target: data.action?.target || '',
      },
      fallback: Boolean(data.fallback),
      source: data.source || (data.fallback ? 'server_fallback' : 'openai'),
    };

    console.log("[HER SOURCE]", response.source);
    console.log("[HER FALLBACK]", response.fallback);
    console.log("[HER ACTION]", response.action);

    return response;
  } catch (error) {
    const response = await assistantClientFallback(message, lang);
    console.log("[HER SOURCE]", response.source);
    console.log("[HER FALLBACK]", response.fallback);
    console.log("[HER ACTION]", response.action);
    return response;
  }
}
