<?php
// Bootstrap Laravel
require __DIR__ . '/../jeallo-api/vendor/autoload.php';
$app = require_once __DIR__ . '/../jeallo-api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Task;
use App\Models\TaskList;
use App\Http\Controllers\Api\V1\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Let's log in user 1 (Dhruv Jain)
Auth::loginUsingId(1);

// Find a task
$task = Task::find(2); // "work", currently in list 4 (TO DO)
$targetList = TaskList::find(6); // "IN PROGRESS"

echo "Moving Task ID {$task->id} ('{$task->title}') from List ID {$task->list_id} to List ID {$targetList->id}\n";

$request = Request::create('/v1/tasks/' . $task->id . '/move', 'PATCH', [
    'list_id' => $targetList->id,
    'position' => 1
]);

$controller = app(TaskController::class);
try {
    $response = $controller->move($request, $task);
    echo "Success! Response: " . json_encode($response) . "\n";
    
    // Refresh task and check database
    $task->refresh();
    echo "Updated Task in DB - List ID: {$task->list_id}, Status: {$task->status}, Position: {$task->position}\n";
    
    // Move it back to TO DO (list 4) to leave database clean
    $requestBack = Request::create('/v1/tasks/' . $task->id . '/move', 'PATCH', [
        'list_id' => 4,
        'position' => 0
    ]);
    $controller->move($requestBack, $task);
    echo "Successfully clean moved back to original!\n";
} catch (\Exception $e) {
    echo "Error moving task: " . $e->getMessage() . "\n";
}
