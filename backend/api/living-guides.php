<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

requireMethod(['GET']);

try {
    $pdo = getDatabaseConnection();

    $conditions = ['is_published = 1'];
    $params = [];

    $category = trim((string) ($_GET['category'] ?? ''));
    if ($category !== '' && strtolower($category) !== 'all') {
        $conditions[] = 'category = :category';
        $params['category'] = $category;
    }

    $guidesStatement = $pdo->prepare(
        'SELECT * FROM living_guides WHERE ' . implode(' AND ', $conditions) . ' ORDER BY display_order ASC, id ASC'
    );
    $guidesStatement->execute($params);
    $guides = $guidesStatement->fetchAll();

    if ($guides === []) {
        sendSuccess([]);
    }

    $ids = array_column($guides, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stepsStatement = $pdo->prepare(
        "SELECT * FROM living_steps WHERE living_guide_id IN ($placeholders) ORDER BY living_guide_id ASC, step_order ASC"
    );
    $stepsStatement->execute($ids);

    $stepsByGuide = [];
    foreach ($stepsStatement->fetchAll() as $step) {
        $stepsByGuide[(int) $step['living_guide_id']][] = $step;
    }

    $data = array_map(function (array $guide) use ($stepsByGuide): array {
        $guide = decodeJsonColumns($guide, ['tools_needed', 'japanese_phrases']);
        $guide['steps'] = $stepsByGuide[(int) $guide['id']] ?? [];
        return $guide;
    }, $guides);

    sendSuccess($data);
} catch (Throwable $error) {
    sendError('Failed to load living guides.', 500);
}
