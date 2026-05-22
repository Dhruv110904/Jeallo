<?php
require __DIR__ . '/../jeallo-api/vendor/autoload.php';
$app = require_once __DIR__ . '/../jeallo-api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Task;

echo "--- task assignees ---\n";
foreach (Task::with('assignees')->get() as $t) {
    echo "ID: {$t->id}, Title: {$t->title}, Status: {$t->status}, Assignees: " . $t->assignees->pluck('email')->implode(', ') . "\n";
}
