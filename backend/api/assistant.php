<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function sendJson(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sendSuccess(array $data, int $statusCode = 200): void
{
    sendJson(['success' => true, 'data' => $data], $statusCode);
}

function sendError(string $message, int $statusCode = 500): void
{
    sendJson(['success' => false, 'message' => $message], $statusCode);
}

function readJsonBody(): array
{
    $rawBody = file_get_contents('php://input');
    if (($rawBody === false || trim($rawBody) === '') && PHP_SAPI === 'cli') {
        $rawBody = file_get_contents('php://stdin');
    }
    if ($rawBody === false || trim($rawBody) === '') {
        return [];
    }

    $data = json_decode($rawBody, true);
    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON body.', 400);
    }

    return $data;
}

function language(array $body): string
{
    $lang = (string) ($body['lang'] ?? 'en');
    return in_array($lang, ['en', 'ja', 'zh'], true) ? $lang : 'en';
}

function assistantCopy(string $lang): array
{
    $copies = [
        'en' => [
            'backup' => 'I cannot reach the AI service right now, so this is a simple backup response.',
            'emergency' => 'If this feels urgent or you may be in immediate danger, use emergency services first. I can open HER Safe for you.',
            'followed' => 'Move toward a bright, staffed public place if you can. I can open the Being Followed guide in HER Safe.',
            'night' => 'Choose brighter streets and staffed places if you can. I can open the Walking Home guide in HER Safe.',
            'door' => 'Keep the door locked and use the intercom or peephole. I can open the Stranger at Door guide in HER Safe.',
            'train' => 'Move toward other passengers or station staff if you can. I can open the train harassment guide in HER Safe.',
            'ride' => 'Share your location and ask to stop somewhere bright and staffed if you can. I can open the unsafe ride guide in HER Safe.',
            'washing' => 'Start with dry, visible checks only and stop near electricity or heavy leakage. I can open the washing machine guide in HER Living.',
            'utilities' => 'For electricity, gas, or utility setup, use official provider or building contacts. I can open a HER Living guide.',
            'toilet' => 'Do not flush repeatedly. I can open the toilet guide in HER Living.',
            'hospital' => 'Prepare your insurance card and symptoms note. I can open the first hospital visit guide in HER Living.',
            'places' => 'A quieter place can help when you want a soft pause. I can open HER Places.',
            'day' => 'I can open HER Day so you can use the app\'s existing planning tools.',
            'none' => 'Start with your immediate safety. If this is urgent, use emergency services first. Otherwise, tell me a little more and I will point you to the right HER OWN guide.',
            'openSafe' => 'Open Safe Guide',
            'openLiving' => 'Open Living Guide',
            'openPlaces' => 'Open HER Places',
            'openDay' => 'Open HER Day',
            'openMy' => 'Open My Page',
        ],
        'ja' => [
            'backup' => '現在AIサービスに接続できないため、これは簡易バックアップ応答です。',
            'emergency' => '緊急の危険を感じる場合は、まず緊急連絡を優先してください。HER Safeを開けます。',
            'followed' => '可能なら明るくスタッフのいる場所へ向かってください。HER Safeの尾行ガイドを開けます。',
            'night' => '可能なら明るい道や人のいる場所を選んでください。HER Safeの夜道ガイドを開けます。',
            'door' => 'ドアは開けず、インターホンやのぞき穴で確認してください。HER Safeの玄関ガイドを開けます。',
            'train' => '可能なら他の乗客や駅員の近くへ移動してください。HER Safeの電車内ガイドを開けます。',
            'ride' => '位置情報を共有し、明るく人のいる場所で降りられるか確認してください。HER Safeの乗車ガイドを開けます。',
            'washing' => '電気や大きな水漏れがある場合は触らず止めてください。HER Livingの洗濯機ガイドを開けます。',
            'utilities' => '電気・ガス・水道は公式窓口や管理会社に確認しましょう。HER Livingのガイドを開けます。',
            'toilet' => '何度も流さず、水位を落ち着かせてください。HER Livingのトイレガイドを開けます。',
            'hospital' => '保険証と症状メモを用意すると安心です。HER Livingの初診ガイドを開けます。',
            'places' => '静かな場所で一息つく選択もできます。HER Placesを開けます。',
            'day' => '無理のない、やさしいひとり時間から作れます。HER Dayを開けます。',
            'none' => 'まず今の安全を確認してください。緊急なら緊急連絡を優先し、そうでなければ状況をもう少し教えてください。',
            'openSafe' => 'Safeガイドを開く',
            'openLiving' => 'Livingガイドを開く',
            'openPlaces' => 'HER Placesを開く',
            'openDay' => 'HER Dayを開く',
            'openMy' => 'My Pageを開く',
        ],
        'zh' => [
            'backup' => '我现在无法连接 AI 服务，所以这是一个简单的备用回复。',
            'emergency' => '如果你觉得情况紧急或有立即危险，请先联系紧急服务。我可以为你打开 HER Safe。',
            'followed' => '如果可以，先走向明亮、有工作人员的公共场所。我可以打开 HER Safe 的被尾随指南。',
            'night' => '如果可以，选择更明亮、有人的道路。我可以打开 HER Safe 的夜归指南。',
            'door' => '先保持门锁好，通过门铃对讲或猫眼确认。我可以打开 HER Safe 的门外陌生人指南。',
            'train' => '如果可以，移动到其他乘客或站务员附近。我可以打开 HER Safe 的电车骚扰指南。',
            'ride' => '分享位置，并尽量在明亮、有人的地方下车。我可以打开 HER Safe 的乘车不安指南。',
            'washing' => '只做干燥、可见的检查；靠近电或严重漏水时请停止。我可以打开 HER Living 的洗衣机指南。',
            'utilities' => '电、燃气、水务问题请优先确认官方窗口或管理公司。我可以打开 HER Living 指南。',
            'toilet' => '不要反复冲水，先观察水位。我可以打开 HER Living 的厕所堵塞指南。',
            'hospital' => '准备医保卡和症状记录会更安心。我可以打开 HER Living 的初诊指南。',
            'places' => '找一个安静的地方暂停一下也很好。我可以打开 HER Places。',
            'day' => '可以先从一个轻松的独处日开始。我可以打开 HER Day。',
            'none' => '先确认你当下是否安全。如果紧急，请先联系紧急服务；如果不紧急，可以再告诉我一点情况。',
            'openSafe' => '打开 Safe 指南',
            'openLiving' => '打开 Living 指南',
            'openPlaces' => '打开 HER Places',
            'openDay' => '打开 HER Day',
            'openMy' => '打开 My Page',
        ],
    ];

    return $copies[$lang] ?? $copies['en'];
}

function action(string $type, string $label, string $target = ''): array
{
    return ['type' => $type, 'label' => $label, 'target' => $target];
}

function containsAny(string $message, array $needles): bool
{
    foreach ($needles as $needle) {
        if ($needle !== '' && str_contains($message, lowerText($needle))) {
            return true;
        }
    }
    return false;
}

function lowerText(string $value): string
{
    return function_exists('mb_strtolower') ? mb_strtolower($value, 'UTF-8') : strtolower($value);
}

function sliceText(string $value, int $length): string
{
    return function_exists('mb_substr') ? mb_substr($value, 0, $length, 'UTF-8') : substr($value, 0, $length);
}

function sanitizeHistory(mixed $history): array
{
    if (!is_array($history)) {
        return [];
    }

    $sanitized = [];
    foreach ($history as $item) {
        if (!is_array($item)) {
            continue;
        }

        $role = (string) ($item['role'] ?? '');
        if (!in_array($role, ['user', 'assistant'], true)) {
            continue;
        }

        $contentValue = $item['content'] ?? '';
        if (is_array($contentValue) || is_object($contentValue)) {
            continue;
        }

        $content = trim((string) $contentValue);
        if ($content === '') {
            continue;
        }

        $sanitized[] = [
            'role' => $role,
            'content' => sliceText($content, 900),
        ];
    }

    return array_slice($sanitized, -12);
}

function normalizeTarget(string $type, string $target): string
{
    $safeTargets = [
        'walking-home' => 'night',
        'being-followed' => 'followed',
        'stranger-at-door' => 'door',
        'train-harassment' => 'train',
        'unsafe-ride' => 'ride',
        'emergency' => 'emergency',
        'followed' => 'followed',
        'night' => 'night',
        'door' => 'door',
        'train' => 'train',
        'ride' => 'ride',
    ];
    $livingTargets = [
        'washing-machine-drain',
        'utilities-setup',
        'toilet-clogged',
        'first-hospital-visit',
        'lost-key',
        'garbage-sorting',
        'moving-checklist',
        'gas-smell',
        'electrical-issue',
    ];

    if ($type === 'safe_scenario') {
        return $safeTargets[$target] ?? 'emergency';
    }
    if ($type === 'living_guide') {
        return in_array($target, $livingTargets, true) ? $target : '';
    }
    if ($type === 'places') {
        return 'places';
    }
    if ($type === 'day') {
        return 'day';
    }
    if ($type === 'mypage') {
        return 'mypage';
    }
    return '';
}

function defaultLabel(string $type, string $lang): string
{
    $copy = assistantCopy($lang);
    return match ($type) {
        'safe_scenario' => $copy['openSafe'],
        'living_guide' => $copy['openLiving'],
        'places' => $copy['openPlaces'],
        'day' => $copy['openDay'],
        'mypage' => $copy['openMy'],
        default => '',
    };
}

function languageName(string $lang): string
{
    return match ($lang) {
        'ja' => 'Japanese',
        'zh' => 'Chinese',
        default => 'English',
    };
}

function inferredSafeScenarioTarget(string $message): string
{
    $lower = lowerText($message);

    if (containsAny($lower, [
        'train harassment', 'on the train', 'on a train', 'harassing me on the train',
        '電車', '痴漢', '車内',
        '电车', '列车', '骚扰',
    ])) {
        return 'train';
    }

    if (containsAny($lower, [
        'taxi', 'ride', 'driver', 'car ride', 'rideshare', 'uber',
        'タクシー', '運転手', '乗車',
        '出租车', '司机', '网约车', '乘车',
    ])) {
        return 'ride';
    }

    if (containsAny($lower, [
        'outside my door', 'at my door', 'waiting outside', 'stranger at the door', 'knocking',
        '玄関', 'ドアの外', '外にいる', '待っている', 'インターホン',
        '门外', '门口', '敲门', '外面有人', '有人等',
    ])) {
        return 'door';
    }

    if (containsAny($lower, [
        'following me', 'followed me', 'being followed', 'stalking me', 'same person behind me',
        'keeps walking behind me', 'behind me for a while', 'suspicious person behind',
        '尾行', 'ついてくる', 'つけられて', '後ろにいる', 'ずっと後ろ', '同じ人', '後をつけ',
        '跟着我', '跟踪', '尾随', '一直在后面', '同一个人', '可疑的人',
    ])) {
        return 'followed';
    }

    if (containsAny($lower, [
        'walking home', 'walk home', 'unsafe route', 'night walk', 'dark street', 'on my way home',
        '家まで歩', '帰り道', '歩いて帰', '夜道', '暗い道',
        '走回家', '回家路上', '夜路', '路上不安全', '很暗',
    ])) {
        return 'night';
    }

    if (containsAny($lower, [
        'right now', 'immediate danger', 'emergency', 'help me', 'cannot leave',
        '今すぐ', '緊急', '危険', '助けて',
        '马上', '紧急', '危险', '救我',
    ])) {
        return 'emergency';
    }

    return '';
}

function currentMessageAllowsAction(string $type, string $message): bool
{
    if ($type === 'none') {
        return true;
    }

    $lower = lowerText($message);

    if ($type === 'safe_scenario') {
        return inferredSafeScenarioTarget($message) !== '' || containsAny($lower, [
            'immediate danger', 'danger', 'emergency', 'help me right now', 'cannot leave', 'threatened',
            'follow', 'following', 'stalk', 'harass', 'door', 'stranger', 'ride', 'driver',
            '尾行', 'ついて', '危険', '緊急', '今すぐ助けて', '痴漢', '玄関', 'ドア', 'ストーカー',
            '跟踪', '尾随', '危险', '紧急', '马上救我', '骚扰', '门外', '司机', '威胁',
        ]);
    }

    if ($type === 'day') {
        return containsAny($lower, [
            'plan', 'arrange', 'organize', 'itinerary', 'schedule', 'build my day', 'day plan', 'free hours',
            'help me plan', 'make a plan', 'around the movie', 'before and after',
            '計画', '予定', '日程', '組んで', 'プラン', '半日', '一日',
            '安排', '规划', '計劃', '计划', '行程', '前后', '前後', '几个小时', '幾個小時', '三小时', '三個小時', '半天', '一天',
        ]);
    }

    if ($type === 'places') {
        return containsAny($lower, [
            'find', 'browse', 'look for', 'recommend a place', 'places', 'cafe', 'restaurant', 'bookstore', 'museum', 'park',
            '探す', '場所', 'カフェ', 'レストラン', '本屋', '公園', '美術館',
            '找', '寻找', '推薦地方', '推荐地点', '地点', '地方', '咖啡', '餐厅', '书店', '公园', '美术馆',
        ]);
    }

    if ($type === 'living_guide') {
        return containsAny($lower, [
            'guide', 'how do i', 'how to', 'what should i do', 'washing machine', 'leaking', 'toilet', 'utilities', 'gas',
            'electric', 'key', 'moving', 'hospital', 'repair',
            'ガイド', 'どうすれば', '洗濯機', '水漏れ', 'トイレ', '電気', 'ガス', '鍵', '引っ越し', '病院', '修理',
            '指南', '怎么办', '怎么做', '洗衣机', '漏水', '厕所', '水电', '燃气', '钥匙', '搬家', '医院', '维修',
        ]);
    }

    if ($type === 'mypage') {
        return containsAny($lower, [
            'saved', 'favorite', 'favourite', 'notes', 'my page', 'my days', 'saved plans', 'settings',
            '保存', 'お気に入り', 'メモ', 'マイページ', '設定',
            '收藏', '保存', '笔记', '我的', '设置',
        ]);
    }

    return false;
}

function deterministicResponse(string $message, string $lang): array
{
    $copy = assistantCopy($lang);
    $lower = lowerText($message);
    $reply = static fn (string $key): string => trim($copy['backup'] . ' ' . $copy[$key]);

    if (containsAny($lower, ['urgent', 'emergency', 'danger', 'help me', '助けて', '緊急', '危険', '救命', '紧急', '危险', '救我'])) {
        return ['reply' => $reply('emergency'), 'action' => action('safe_scenario', $copy['openSafe'], 'emergency'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['follow', 'following', 'stalk', '尾行', 'ついて', '跟踪', '尾随'])) {
        return ['reply' => $reply('followed'), 'action' => action('safe_scenario', $copy['openSafe'], 'followed'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['walking home', 'walk home', 'night', '夜道', '帰る', '夜归', '回家'])) {
        return ['reply' => $reply('night'), 'action' => action('safe_scenario', $copy['openSafe'], 'night'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['door', 'stranger', 'knock', '玄関', 'ドア', '陌生人', '敲门', '门外'])) {
        return ['reply' => $reply('door'), 'action' => action('safe_scenario', $copy['openSafe'], 'door'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['train', 'harass', '電車', '痴漢', '骚扰', '电车'])) {
        return ['reply' => $reply('train'), 'action' => action('safe_scenario', $copy['openSafe'], 'train'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['taxi', 'ride', 'driver', 'タクシー', '車', '出租车', '司机'])) {
        return ['reply' => $reply('ride'), 'action' => action('safe_scenario', $copy['openSafe'], 'ride'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['washing machine', 'laundry', 'drain', '洗濯機', '排水', '洗衣机'])) {
        return ['reply' => $reply('washing'), 'action' => action('living_guide', $copy['openLiving'], 'washing-machine-drain'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['electric', 'gas', 'utility', 'utilities', 'bill', '電気', 'ガス', '水道', '电', '燃气', '水费'])) {
        return ['reply' => $reply('utilities'), 'action' => action('living_guide', $copy['openLiving'], 'utilities-setup'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['toilet', 'clog', 'トイレ', '詰まり', '厕所', '堵'])) {
        return ['reply' => $reply('toilet'), 'action' => action('living_guide', $copy['openLiving'], 'toilet-clogged'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['hospital', 'clinic', 'doctor', '病院', '初診', '医院', '看病'])) {
        return ['reply' => $reply('hospital'), 'action' => action('living_guide', $copy['openLiving'], 'first-hospital-visit'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['quiet', 'place', 'cafe', 'alone', 'somewhere', '静か', '場所', 'カフェ', '安静', '地点', '咖啡'])) {
        return ['reply' => $reply('places'), 'action' => action('places', $copy['openPlaces'], 'places'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['today', 'day', 'plan', '何する', '今日', '一天', '今天', '计划'])) {
        return ['reply' => $reply('day'), 'action' => action('day', $copy['openDay'], 'day'), 'fallback' => true, 'source' => 'server_fallback'];
    }
    if (containsAny($lower, ['saved', 'favorite', 'note', 'my page', '保存', 'お気に入り', 'メモ', '收藏', '笔记', '我的'])) {
        return ['reply' => $reply('none'), 'action' => action('mypage', $copy['openMy'], 'mypage'), 'fallback' => true, 'source' => 'server_fallback'];
    }

    return ['reply' => $reply('none'), 'action' => action('none', '', ''), 'fallback' => true, 'source' => 'server_fallback'];
}

function sanitizeAssistantResponse(array $data, string $message, string $lang): array
{
    $fallback = deterministicResponse($message, $lang);
    $action = is_array($data['action'] ?? null) ? $data['action'] : [];
    $type = (string) ($action['type'] ?? 'none');
    $inferredSafeTarget = inferredSafeScenarioTarget($message);

    if (!in_array($type, ['safe_scenario', 'living_guide', 'places', 'day', 'mypage', 'none'], true)) {
        $type = 'none';
    }

    $reply = trim((string) ($data['reply'] ?? ''));
    if ($reply === '') {
        return $fallback;
    }

    $target = normalizeTarget($type, trim((string) ($action['target'] ?? '')));
    if (($type === 'safe_scenario' || $type === 'living_guide') && $target === '') {
        $type = 'none';
        $target = '';
    }

    if (!currentMessageAllowsAction($type, $message)) {
        $type = 'none';
        $target = '';
    }

    if ($type === 'safe_scenario' && $inferredSafeTarget !== '') {
        $target = $inferredSafeTarget;
    }

    if ($type === 'none' && $inferredSafeTarget !== '') {
        $type = 'safe_scenario';
        $target = $inferredSafeTarget;
    }

    $label = $type === 'none'
        ? ''
        : defaultLabel($type, $lang);

    return [
        'reply' => sliceText($reply, 360),
        'action' => [
            'type' => $type,
            'label' => $label,
            'target' => $target,
        ],
        'fallback' => false,
        'source' => 'openai',
    ];
}

function callOpenAI(string $message, string $lang, array $history): ?array
{
    $apiKey = getenv('OPENAI_API_KEY') ?: '';
    if ($apiKey === '' || !function_exists('curl_init')) {
        return null;
    }

    $model = getenv('OPENAI_MODEL') ?: 'gpt-4.1-mini';
    $system = implode("\n", [
        'You are HER Assistant inside the HER OWN web app.',
        'You are not a general chatbot. Reply briefly, calmly, and contextually.',
        'HER OWN currently has these real product areas: HER Day for rule-based solo day planning and saved day plans; HER Places for fictional prototype place cards, filters, saved places, adding a place to the current HER Day draft, prototype maps, and external Google Maps handoff; HER Living for practical living guides and saved guides; HER Safe for safety scenarios, Safety Call, Safe Route prototype, communication phrases, and emergency guidance; My Page for saved places, saved guides, saved day plans, notes, and settings.',
        'Do not invent live business availability, real-time nearby search, live map data, live cinema listings, booking or ticket services, calling emergency services, contacting another person, or accessing precise user location unless the user has explicitly used an existing app flow that provides it.',
        'For interests outside the prototype data, such as wanting to go to a movie theater, give general planning suggestions and optionally route to HER Day or HER Places, but do not imply HER OWN has live listings, reservations, or verified real-world availability.',
        'If the user may be in immediate danger, prioritize HER Safe or emergency guidance over casual recommendations. Never claim you contacted police, an ambulance, a friend, or another service.',
        'The selected HER OWN UI language is ' . languageName($lang) . '. Always reply in ' . languageName($lang) . ', even if the user message or conversation history uses another language.',
        'Conversation history is context only. It must not override the selected UI language for the next reply.',
        'CTA labels and action wording must match the selected UI language.',
        'Default to action type none for ordinary conversation, clarification, preferences, or interests. Do not show a product CTA merely because a HER OWN feature could theoretically help.',
        'When action type is none, do not verbally push a product entry point. Avoid phrases like "I can open HER Day" or "I can help arrange a day plan" unless the user clearly asks for planning or arranging.',
        'Recommend at most ONE existing HER OWN feature only when the user expresses a clear next-step intent.',
        'Use day only when the user explicitly asks to plan, arrange, organize, build an itinerary, make a day plan, or arrange several free hours.',
        'For movie-related conversation, use none for wanting to see a movie, naming a movie, or asking about showtimes. HER OWN cannot verify live cinema showtimes or ticket availability. Use day only when the user asks to plan or arrange the outing around the movie.',
        'For early movie conversation, respond conversationally or explain the showtime boundary. Do not ask for a cinema location in a way that implies live cinema data is available.',
        'When the user asks to arrange the before/after movie outing, acknowledge the movie context, suggest a simple before/movie/after structure, invite continuing in HER Day, and return one day action.',
        'Use places only when the user clearly wants to browse or find a place within HER Places. Use living_guide when opening an existing practical guide is a meaningful next step. Use safe_scenario proactively for real safety concerns. Use mypage only for saved places, saved guides, saved days, notes, favorites, or settings.',
        'Avoid repeating the same CTA in consecutive assistant replies unless the user explicitly asks for that action again.',
        'Allowed action types: safe_scenario, living_guide, places, day, mypage, none.',
        'Allowed safe_scenario targets: followed, night, door, train, ride, emergency.',
        'Allowed living_guide targets: washing-machine-drain, utilities-setup, toilet-clogged, first-hospital-visit, lost-key, garbage-sorting, moving-checklist, gas-smell, electrical-issue.',
        'Allowed mypage target: mypage.',
        'Never say the user is safe, low risk, or has no danger.',
        'Never invent emergency phone numbers. If urgent, mention emergency services generally and route to HER Safe emergency.',
        'Return only JSON with keys reply and action. action must contain type, label, and target. For type none, use empty label and target.',
        'Language: ' . $lang,
    ]);

    $messages = [['role' => 'system', 'content' => $system]];
    foreach ($history as $historyMessage) {
        $messages[] = [
            'role' => $historyMessage['role'],
            'content' => $historyMessage['content'],
        ];
    }
    $messages[] = ['role' => 'user', 'content' => $message];

    $payload = [
        'model' => $model,
        'temperature' => 0.2,
        'messages' => $messages,
        'response_format' => ['type' => 'json_object'],
    ];

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_TIMEOUT => 8,
    ]);

    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);

    if (!is_string($raw) || $status < 200 || $status >= 300) {
        return null;
    }

    $decoded = json_decode($raw, true);
    $content = $decoded['choices'][0]['message']['content'] ?? '';
    $assistantData = is_string($content) ? json_decode($content, true) : null;

    return is_array($assistantData) ? $assistantData : null;
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET' && (string) ($_GET['health'] ?? '') === '1') {
        sendSuccess([
            'status' => 'ok',
            'aiConfigured' => (getenv('OPENAI_API_KEY') ?: '') !== '',
        ]);
    }

    if ($method !== 'POST') {
        sendError('Method not allowed.', 405);
    }

    $body = readJsonBody();
    $message = trim((string) ($body['message'] ?? ''));
    $lang = language($body);
    $history = sanitizeHistory($body['history'] ?? []);

    if ($message === '') {
        sendSuccess(deterministicResponse($message, $lang));
    }

    $aiResponse = callOpenAI($message, $lang, $history);
    if ($aiResponse !== null) {
        sendSuccess(sanitizeAssistantResponse($aiResponse, $message, $lang));
    }

    sendSuccess(deterministicResponse($message, $lang));
} catch (Throwable $error) {
    $body = isset($body) && is_array($body) ? $body : [];
    sendSuccess(deterministicResponse((string) ($body['message'] ?? ''), language($body)));
}
