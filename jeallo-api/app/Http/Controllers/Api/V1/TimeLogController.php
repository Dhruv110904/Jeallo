<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskTimeLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TimeLogController extends Controller
{
    public function index(Task $task)
    {
        Gate::authorize('view', $task);

        $logs = $task->timeLogs()->with('user')->latest()->get();

        return response()->json($logs->map(fn($l) => [
            'id' => $l->id,
            'user' => ['id' => $l->user->id, 'name' => $l->user->name],
            'started_at' => $l->started_at,
            'ended_at' => $l->ended_at,
            'hours' => $l->hours,
            'note' => $l->note,
        ]));
    }

    public function store(Request $request, Task $task)
    {
        Gate::authorize('view', $task);

        $request->validate([
            'started_at' => 'required|date',
            'ended_at' => 'nullable|date|after:started_at',
            'hours' => 'nullable|numeric|min:0.1',
            'note' => 'nullable|string|max:500',
        ]);

        $log = $task->timeLogs()->create([
            'user_id' => $request->user()->id,
            'started_at' => $request->started_at,
            'ended_at' => $request->ended_at,
            'hours' => $request->hours,
            'note' => $request->note,
        ]);

        return response()->json($log->load('user'), 201);
    }
}
