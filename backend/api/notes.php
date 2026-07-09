<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

try {
    $pdo = getDatabaseConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $userId = intParam('user_id', true);
        $statement = $pdo->prepare(
            'SELECT * FROM notes WHERE user_id = :user_id ORDER BY is_pinned DESC, updated_at DESC'
        );
        $statement->execute(['user_id' => $userId]);
        sendSuccess($statement->fetchAll());
    }

    if ($method === 'POST') {
        $body = readJsonBody();
        $userId = requiredIntFromBody($body, 'user_id');
        $title = trim((string) ($body['title'] ?? ''));
        if ($title === '') {
            sendError('Missing required field: title.', 400);
        }

        $statement = $pdo->prepare(
            'INSERT INTO notes (user_id, title, body, related_type, related_id, is_pinned)
             VALUES (:user_id, :title, :body, :related_type, :related_id, :is_pinned)'
        );
        $statement->execute([
            'user_id' => $userId,
            'title' => $title,
            'body' => $body['body'] ?? null,
            'related_type' => $body['related_type'] ?? 'general',
            'related_id' => isset($body['related_id']) && $body['related_id'] !== '' ? (int) $body['related_id'] : null,
            'is_pinned' => !empty($body['is_pinned']) ? 1 : 0,
        ]);

        sendSuccess(['id' => (int) $pdo->lastInsertId()], 201);
    }

    sendError('Method not allowed.', 405);
} catch (Throwable $error) {
    sendError('Failed to handle notes.', 500);
}
