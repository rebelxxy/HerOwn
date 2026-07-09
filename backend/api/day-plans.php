<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

function fetchDayPlans(PDO $pdo, int $userId): array
{
    $plansStatement = $pdo->prepare(
        'SELECT * FROM day_plans WHERE user_id = :user_id AND is_saved = 1 ORDER BY created_at DESC'
    );
    $plansStatement->execute(['user_id' => $userId]);
    $plans = $plansStatement->fetchAll();

    if ($plans === []) {
        return [];
    }

    $planIds = array_column($plans, 'id');
    $placeholders = implode(',', array_fill(0, count($planIds), '?'));
    $stopsStatement = $pdo->prepare(
        "SELECT
            dps.*,
            p.name AS place_name,
            p.safe_score,
            p.solo_friendly_score,
            p.women_friendly_score,
            p.image_url
        FROM day_plan_stops dps
        LEFT JOIN places p ON p.id = dps.place_id
        WHERE dps.day_plan_id IN ($placeholders)
        ORDER BY dps.day_plan_id ASC, dps.stop_order ASC"
    );
    $stopsStatement->execute($planIds);

    $stopsByPlan = [];
    foreach ($stopsStatement->fetchAll() as $stop) {
        $stopsByPlan[(int) $stop['day_plan_id']][] = $stop;
    }

    return array_map(function (array $plan) use ($stopsByPlan): array {
        $plan['stops'] = $stopsByPlan[(int) $plan['id']] ?? [];
        return $plan;
    }, $plans);
}

try {
    $pdo = getDatabaseConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $userId = intParam('user_id', true);
        sendSuccess(fetchDayPlans($pdo, $userId));
    }

    if ($method === 'POST') {
        $body = readJsonBody();
        $userId = requiredIntFromBody($body, 'user_id');
        $title = trim((string) ($body['title'] ?? ''));
        if ($title === '') {
            sendError('Missing required field: title.', 400);
        }

        $stops = $body['stops'] ?? [];
        if (!is_array($stops)) {
            sendError('Invalid field: stops must be an array.', 400);
        }

        $budgetYen = null;
        if (isset($body['budget_yen']) && $body['budget_yen'] !== '') {
            if (!filter_var($body['budget_yen'], FILTER_VALIDATE_INT)) {
                sendError('Invalid integer field: budget_yen.', 400);
            }
            $budgetYen = (int) $body['budget_yen'];
        }

        $normalizedStops = [];
        foreach (array_values($stops) as $index => $stop) {
            if (!is_array($stop)) {
                sendError('Invalid stop entry.', 400);
            }

            $stopTitle = trim((string) ($stop['title'] ?? $stop['place_name'] ?? ''));
            if ($stopTitle === '') {
                sendError('Each stop requires a title.', 400);
            }

            $normalizedStops[] = [
                'place_id' => isset($stop['place_id']) && $stop['place_id'] !== '' ? (int) $stop['place_id'] : null,
                'stop_order' => isset($stop['stop_order']) ? (int) $stop['stop_order'] : $index + 1,
                'start_time' => $stop['start_time'] ?? null,
                'title' => $stopTitle,
                'category' => $stop['category'] ?? null,
                'area' => $stop['area'] ?? null,
                'note' => $stop['note'] ?? null,
            ];
        }

        $pdo->beginTransaction();

        $planStatement = $pdo->prepare(
            'INSERT INTO day_plans (user_id, title, mood, duration, budget_yen, area, plan_date, notes)
             VALUES (:user_id, :title, :mood, :duration, :budget_yen, :area, :plan_date, :notes)'
        );
        $planStatement->execute([
            'user_id' => $userId,
            'title' => $title,
            'mood' => $body['mood'] ?? null,
            'duration' => $body['duration'] ?? null,
            'budget_yen' => $budgetYen,
            'area' => $body['area'] ?? null,
            'plan_date' => $body['plan_date'] ?? null,
            'notes' => $body['notes'] ?? null,
        ]);

        $planId = (int) $pdo->lastInsertId();

        $stopStatement = $pdo->prepare(
            'INSERT INTO day_plan_stops (day_plan_id, place_id, stop_order, start_time, title, category, area, note)
             VALUES (:day_plan_id, :place_id, :stop_order, :start_time, :title, :category, :area, :note)'
        );

        foreach ($normalizedStops as $stop) {
            $stopStatement->execute([
                'day_plan_id' => $planId,
                'place_id' => $stop['place_id'],
                'stop_order' => $stop['stop_order'],
                'start_time' => $stop['start_time'] ?? null,
                'title' => $stop['title'],
                'category' => $stop['category'] ?? null,
                'area' => $stop['area'] ?? null,
                'note' => $stop['note'] ?? null,
            ]);
        }

        $pdo->commit();

        sendSuccess([
            'id' => $planId,
            'plans' => fetchDayPlans($pdo, $userId),
        ], 201);
    }

    sendError('Method not allowed.', 405);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendError('Failed to handle day plans.', 500);
}
