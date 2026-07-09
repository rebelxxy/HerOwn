<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

requireMethod(['GET']);

try {
    $pdo = getDatabaseConnection();

    $guidesStatement = $pdo->query(
        'SELECT * FROM safety_guides WHERE is_published = 1 ORDER BY display_order ASC, id ASC'
    );
    $guides = $guidesStatement->fetchAll();

    if ($guides === []) {
        sendSuccess([]);
    }

    $ids = array_column($guides, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stepsStatement = $pdo->prepare(
        "SELECT * FROM safety_steps WHERE safety_guide_id IN ($placeholders) ORDER BY safety_guide_id ASC, step_order ASC"
    );
    $stepsStatement->execute($ids);

    $stepsByGuide = [];
    foreach ($stepsStatement->fetchAll() as $step) {
        $stepsByGuide[(int) $step['safety_guide_id']][] = $step;
    }

    $data = array_map(function (array $guide) use ($stepsByGuide): array {
        $guide = decodeJsonColumns($guide, ['emergency_actions']);
        $guide['steps'] = $stepsByGuide[(int) $guide['id']] ?? [];
        return $guide;
    }, $guides);

    sendSuccess($data);
} catch (Throwable $error) {
    sendError('Failed to load safety guides.', 500);
}
