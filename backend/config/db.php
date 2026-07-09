<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function sendJson(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sendSuccess($data, int $statusCode = 200): void
{
    sendJson([
        'success' => true,
        'data' => $data,
    ], $statusCode);
}

function sendError(string $message, int $statusCode = 500): void
{
    sendJson([
        'success' => false,
        'message' => $message,
    ], $statusCode);
}

set_exception_handler(function (Throwable $error): void {
    sendError($error->getMessage() ?: 'Server error.', 500);
});

set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

function getDatabaseConnection(): PDO
{
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = getenv('DB_PORT') ?: '3306';
    $database = getenv('DB_NAME') ?: 'her_own';
    $username = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASS') ?: '';

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $host,
        $port,
        $database
    );

    try {
        return new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $error) {
        sendError('Database connection failed. Check DB_HOST, DB_NAME, DB_USER, and DB_PASS.', 500);
    }
}

function requireMethod(array $methods): void
{
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', $methods, true)) {
        sendError('Method not allowed.', 405);
    }
}

function readJsonBody(): array
{
    $rawBody = file_get_contents('php://input');
    if ($rawBody === false || trim($rawBody) === '') {
        return [];
    }

    $data = json_decode($rawBody, true);
    if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON body.', 400);
    }

    return $data;
}

function intParam(string $key, bool $required = false): ?int
{
    $value = $_GET[$key] ?? null;
    if ($value === null || $value === '') {
        if ($required) {
            sendError(sprintf('Missing required parameter: %s.', $key), 400);
        }
        return null;
    }

    if (!filter_var($value, FILTER_VALIDATE_INT)) {
        sendError(sprintf('Invalid integer parameter: %s.', $key), 400);
    }

    return (int) $value;
}

function requiredIntFromBody(array $body, string $key): int
{
    if (!array_key_exists($key, $body) || $body[$key] === '') {
        sendError(sprintf('Missing required field: %s.', $key), 400);
    }

    if (!filter_var($body[$key], FILTER_VALIDATE_INT)) {
        sendError(sprintf('Invalid integer field: %s.', $key), 400);
    }

    return (int) $body[$key];
}

function decodeJsonColumns(array $row, array $columns): array
{
    foreach ($columns as $column) {
        if (!array_key_exists($column, $row) || $row[$column] === null || $row[$column] === '') {
            continue;
        }

        $decoded = json_decode((string) $row[$column], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $row[$column] = $decoded;
        }
    }

    return $row;
}
