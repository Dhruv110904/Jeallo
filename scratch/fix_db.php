<?php
// Bootstrap Laravel
require __DIR__ . '/../jeallo-api/vendor/autoload.php';
$app = require_once __DIR__ . '/../jeallo-api/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;

echo "--- Fixing workspace_user associations ---\n";

$workspace = Workspace::find(1);
if (!$workspace) {
    echo "Workspace ID 1 not found!\n";
    exit(1);
}

$users = User::all();
foreach ($users as $user) {
    $exists = DB::table('workspace_user')
        ->where('workspace_id', $workspace->id)
        ->where('user_id', $user->id)
        ->exists();

    if (!$exists) {
        DB::table('workspace_user')->insert([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => $user->role === 'super_admin' ? 'owner' : 'member',
            'joined_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "Associated User ID {$user->id} ({$user->name}) with Workspace ID {$workspace->id}\n";
    } else {
        echo "User ID {$user->id} ({$user->name}) already in Workspace ID {$workspace->id}\n";
    }
}

echo "Done!\n";
