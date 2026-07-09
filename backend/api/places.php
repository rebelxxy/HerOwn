<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

requireMethod(['GET']);

try {
    $pdo = getDatabaseConnection();

    $conditions = ['is_active = 1'];
    $params = [];

    $category = trim((string) ($_GET['category'] ?? ''));
    if ($category !== '' && strtolower($category) !== 'all') {
        $conditions[] = 'category = :category';
        $params['category'] = $category;
    }

    $area = trim((string) ($_GET['area'] ?? ''));
    if ($area !== '') {
        $conditions[] = 'area = :area';
        $params['area'] = $area;
    }

    $search = trim((string) ($_GET['search'] ?? ''));
    if ($search !== '') {
        $conditions[] = '(name LIKE :search OR category LIKE :search OR description LIKE :search OR address LIKE :search OR area LIKE :search)';
        $params['search'] = '%' . $search . '%';
    }

    $sql = 'SELECT * FROM places WHERE ' . implode(' AND ', $conditions) . ' ORDER BY safe_score DESC, women_friendly_score DESC, name ASC';
    $statement = $pdo->prepare($sql);
    $statement->execute($params);

    $places = array_map(
        fn (array $place): array => decodeJsonColumns($place, ['opening_hours']),
        $statement->fetchAll()
    );

    sendSuccess($places);
} catch (Throwable $error) {
    sendError('Failed to load places.', 500);
}
