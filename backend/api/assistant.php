<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

function loadAssistantGuides(PDO $pdo, string $query = ''): array
{
    $search = trim($query);
    $params = [];
    $where = '';

    if ($search !== '') {
        $where = ' AND (title LIKE :search OR summary LIKE :search)';
        $params['search'] = '%' . $search . '%';
    }

    $safetyStatement = $pdo->prepare(
        "SELECT 'safety' AS source, id, slug, title, summary, risk_level, display_order
         FROM safety_guides
         WHERE is_published = 1$where
         ORDER BY display_order ASC
         LIMIT 6"
    );
    $safetyStatement->execute($params);

    $livingStatement = $pdo->prepare(
        "SELECT 'living' AS source, id, slug, title, summary, risk_level, display_order
         FROM living_guides
         WHERE is_published = 1$where
         ORDER BY display_order ASC
         LIMIT 6"
    );
    $livingStatement->execute($params);

    return array_merge($safetyStatement->fetchAll(), $livingStatement->fetchAll());
}

try {
    $pdo = getDatabaseConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        sendSuccess([
            'message' => 'HER Assistant API is deterministic in this prototype. It reads published guides only.',
            'guides' => loadAssistantGuides($pdo, (string) ($_GET['search'] ?? '')),
        ]);
    }

    if ($method === 'POST') {
        $body = readJsonBody();
        $message = trim((string) ($body['message'] ?? ''));

        sendSuccess([
            'reply' => 'Start by checking your immediate safety. If danger is urgent in Japan, call 110 or 119. Here are related HER OWN guides from the database.',
            'guides' => loadAssistantGuides($pdo, $message),
        ]);
    }

    sendError('Method not allowed.', 405);
} catch (Throwable $error) {
    sendError('Failed to handle assistant request.', 500);
}
