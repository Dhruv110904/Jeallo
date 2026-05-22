<?php
// Bootstrap Laravel
require __DIR__ . '/../jeallo-api/vendor/autoload.php';
$app = require_once __DIR__ . '/../jeallo-api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Task;

echo "--- tasks ---\n";
foreach (Task::all() as $t) {
    echo "ID: {$t->id}, Title: {$t->title}, List ID: {$t->list_id}, Project ID: {$t->project_id}, Status: {$t->status}\n";
}
