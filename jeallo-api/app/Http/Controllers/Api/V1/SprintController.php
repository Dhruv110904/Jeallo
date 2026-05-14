<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Sprint;
use App\Models\Board;
use App\Http\Resources\SprintResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SprintController extends Controller
{
    public function index(Board $board)
    {
        return SprintResource::collection($board->sprints);
    }

    public function store(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $sprint = $board->sprints()->create($validated);

        return new SprintResource($sprint);
    }

    public function show(Sprint $sprint)
    {
        return new SprintResource($sprint->load('tasks'));
    }

    public function start(Sprint $sprint)
    {
        $sprint->update([
            'status' => 'active',
            'start_date' => now(),
        ]);

        return new SprintResource($sprint);
    }

    public function complete(Request $request, Sprint $sprint)
    {
        $validated = $request->validate([
            'move_to_sprint_id' => 'nullable|exists:sprints,id',
        ]);

        DB::transaction(function () use ($sprint, $validated) {
            $sprint->update(['status' => 'completed']);

            $incompleteTasks = $sprint->tasks()->where('status', '!=', 'done')->get();

            foreach ($incompleteTasks as $task) {
                $task->update([
                    'sprint_id' => $validated['move_to_sprint_id'] ?? null,
                ]);
            }
        });

        return new SprintResource($sprint);
    }

    public function addTasks(Request $request, Sprint $sprint)
    {
        $request->validate([
            'task_ids' => 'required|array',
            'task_ids.*' => 'exists:tasks,id',
        ]);

        \App\Models\Task::whereIn('id', $request->task_ids)
            ->update(['sprint_id' => $sprint->id]);

        return response()->json(['message' => 'Tasks added to sprint']);
    }

    public function removeTask(Sprint $sprint, \App\Models\Task $task)
    {
        $task->update(['sprint_id' => null]);
        return response()->json(['message' => 'Task moved to backlog']);
    }
}
