<?php
// Bootstrap Laravel
require __DIR__ . '/../jeallo-api/vendor/autoload.php';
$app = require_once __DIR__ . '/../jeallo-api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Board;
use App\Http\Resources\TaskListResource;

$board = Board::first();
if (!$board) {
    echo "No board found!\n";
    exit(1);
}

echo "Testing index response for Board ID {$board->id}:\n";
$lists = $board->lists()->with(['tasks', 'tasks.assignees', 'tasks.labels'])->get();
$resource = TaskListResource::collection($lists);
echo json_encode($resource->toArray(request()), JSON_PRETTY_PRINT) . "\n";
