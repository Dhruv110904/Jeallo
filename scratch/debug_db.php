<?php
// Bootstrap Laravel
require __DIR__ . '/../jeallo-api/vendor/autoload.php';
$app = require_once __DIR__ . '/../jeallo-api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;

echo "--- workspaces ---\n";
foreach (Workspace::all() as $w) {
    echo "ID: {$w->id}, Name: {$w->name}\n";
}

echo "\n--- users ---\n";
foreach (User::all() as $u) {
    echo "ID: {$u->id}, Name: {$u->name}, Role: {$u->role}, Email: {$u->email}, EmployeeID: {$u->employee_id}\n";
}

echo "\n--- projects ---\n";
foreach (Project::all() as $p) {
    echo "ID: {$p->id}, Name: {$p->name}, Workspace ID: {$p->workspace_id}, Status: {$p->status}\n";
}

echo "\n--- project_user ---\n";
$pivot = DB::table('project_user')->get();
foreach ($pivot as $p) {
    echo "Project ID: {$p->project_id}, User ID: {$p->user_id}, Role: {$p->role}\n";
}

echo "\n--- workspace_user ---\n";
$wPivot = DB::table('workspace_user')->get();
foreach ($wPivot as $w) {
    echo "Workspace ID: {$w->workspace_id}, User ID: {$w->user_id}, Role: {$w->role}\n";
}

echo "\n--- simulating employee query ---\n";
$workspace = Workspace::find(1);
foreach ([2, 3, 4] as $userId) {
    $user = User::find($userId);
    $projects = $workspace->projects()
        ->whereHas('users', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })
        ->get();
    echo "User ID: {$userId} ({$user->name}), Projects found: " . $projects->count() . "\n";
    foreach ($projects as $p) {
        echo "  - Project ID: {$p->id}, Name: {$p->name}\n";
    }
}

