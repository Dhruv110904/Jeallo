<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskTimeLog;
use App\Http\Resources\TimeLogResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TimeLogController extends Controller
{
    public function index(Task $task)
    {
        return TimeLogResource::collection($task->timeLogs()->with('user')->get());
    }

    public function store(Request $request, Task $task)
    {
        $validated = $request->validate([
            'started_at' => 'required|date',
            'ended_at' => 'nullable|date|after:started_at',
            'hours' => 'required|numeric|min:0.1',
            'description' => 'nullable|string',
        ]);

        $log = $task->timeLogs()->create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        // Update task's total logged hours
        $task->increment('logged_hours', $validated['hours']);

        return new TimeLogResource($log);
    }

    public function destroy(TaskTimeLog $timeLog)
    {
        $timeLog->task->decrement('logged_hours', $timeLog->hours);
        $timeLog->delete();
        return response()->noContent();
    }
}
