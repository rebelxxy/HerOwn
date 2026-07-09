<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

function fetchFavoritePlaces(PDO $pdo, int $userId): array
{
    $statement = $pdo->prepare(
        'SELECT
            f.id AS favorite_id,
            f.note AS favorite_note,
            f.created_at AS favorited_at,
            p.*
        FROM favorites f
        INNER JOIN places p ON p.id = f.place_id
        WHERE f.user_id = :user_id
        ORDER BY f.created_at DESC'
    );
    $statement->execute(['user_id' => $userId]);

    return array_map(
        fn (array $place): array => decodeJsonColumns($place, ['opening_hours']),
        $statement->fetchAll()
    );
}

try {
    $pdo = getDatabaseConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $userId = intParam('user_id', true);
        sendSuccess(fetchFavoritePlaces($pdo, $userId));
    }

    if ($method === 'POST') {
        $body = readJsonBody();
        $userId = requiredIntFromBody($body, 'user_id');
        $placeId = requiredIntFromBody($body, 'place_id');
        $note = isset($body['note']) ? trim((string) $body['note']) : null;

        $statement = $pdo->prepare(
            'INSERT INTO favorites (user_id, place_id, note)
             VALUES (:user_id, :place_id, :note)
             ON DUPLICATE KEY UPDATE note = VALUES(note), updated_at = CURRENT_TIMESTAMP'
        );
        $statement->execute([
            'user_id' => $userId,
            'place_id' => $placeId,
            'note' => $note,
        ]);

        sendSuccess(fetchFavoritePlaces($pdo, $userId), 201);
    }

    sendError('Method not allowed.', 405);
} catch (Throwable $error) {
    sendError('Failed to handle favorites.', 500);
}
