<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use App\Models\TaskList;
use App\Http\Resources\TaskResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query()->with(['creator', 'assignees', 'labels', 'epic', 'list']);

        if ($request->has('board_id')) {
            $query->where('board_id', $request->board_id);
        }

        if ($request->has('sprint_id')) {
            $query->where('sprint_id', $request->sprint_id);
        }

        if ($request->has('epic_id')) {
            $query->where('epic_id', $request->epic_id);
        }

        if ($request->has('workspace_id')) {
            $query->whereHas('project', function ($q) use ($request) {
                $q->where('workspace_id', $request->workspace_id);
            });
        }

        $user = Auth::user();
        if ($user && $user->role === 'employee') {
            $query->where(function ($q) use ($user) {
                $q->whereHas('assignees', function ($sq) use ($user) {
                    $sq->where('users.id', $user->id);
                })->orWhere('created_by', $user->id);
            });
        } elseif ($request->has('assignee_id')) {
            $query->whereHas('assignees', function ($q) use ($request) {
                $q->where('users.id', $request->assignee_id);
            });
        }

        return TaskResource::collection($query->orderBy('position')->get());
    }

    public function projectTasks(Project $project)
    {
        $tasks = $project->tasks()
            ->with(['creator', 'assignees', 'labels', 'epic', 'list'])
            ->orderBy('position')
            ->get();
            
        return TaskResource::collection($tasks);
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'list_id' => 'required|exists:lists,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'epic_id' => 'nullable|exists:epics,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|in:task,bug,story,epic_task,improvement',
            'priority' => 'nullable|in:lowest,low,medium,high,highest,critical',
            'story_points' => 'nullable|integer',
            'due_date' => 'nullable|date',
        ]);

        $list = TaskList::findOrFail($validated['list_id']);

        $task = $project->tasks()->create([
            ...$validated,
            'status' => $list->name,
            'created_by' => Auth::id(),
            'position' => Task::where('list_id', $validated['list_id'])->count(),
        ]);

        if ($request->has('assignee_ids')) {
            $task->assignees()->attach($request->assignee_ids);
        }

        return new TaskResource($task);
    }

    public function show(Task $task)
    {
        return new TaskResource($task->load(['creator', 'reporter', 'assignees', 'labels', 'epic', 'list', 'comments.user', 'checklists.items', 'timeLogs', 'statusHistory', 'outgoingLinks.targetTask']));
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string',
            'priority' => 'sometimes|in:lowest,low,medium,high,highest,critical',
            'story_points' => 'nullable|integer',
            'due_date' => 'nullable|date',
            'epic_id' => 'nullable|exists:epics,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'is_archived' => 'sometimes|boolean',
        ]);

        $task->update($validated);

        if ($request->has('assignee_ids')) {
            $task->assignees()->sync($request->assignee_ids);
        }

        return new TaskResource($task);
    }

    public function move(Request $request, Task $task)
    {
        $validated = $request->validate([
            'list_id' => 'required|exists:lists,id',
            'position' => 'required|integer',
            'sprint_id' => 'nullable|exists:sprints,id',
            'board_id' => 'nullable|exists:boards,id',
        ]);

        DB::transaction(function () use ($task, $validated) {
            $newList = TaskList::findOrFail($validated['list_id']);
            $oldListId = $task->list_id;
            $oldPosition = $task->position;
            $newPosition = $validated['position'];
            
            // WIP Limit check
            if ($newList->wip_limit && $newList->id !== $oldListId) {
                $currentCount = $newList->tasks()->where('is_archived', false)->count();
                if ($currentCount >= $newList->wip_limit) {
                    throw new \Exception("WIP limit reached for this column", 422);
                }
            }

            // Record status history if list changed
            if ($oldListId !== $newList->id) {
                $task->statusHistory()->create([
                    'changed_by' => Auth::id(),
                    'old_list_id' => $oldListId,
                    'new_list_id' => $newList->id,
                    'old_status' => $task->status,
                    'new_status' => $newList->name,
                ]);
                $task->status = $newList->name;
            }

            if ($oldListId === $newList->id) {
                // Moving within the same list
                if ($oldPosition < $newPosition) {
                    Task::where('list_id', $newList->id)
                        ->where('position', '>', $oldPosition)
                        ->where('position', '<=', $newPosition)
                        ->decrement('position');
                } elseif ($oldPosition > $newPosition) {
                    Task::where('list_id', $newList->id)
                        ->where('position', '>=', $newPosition)
                        ->where('position', '<', $oldPosition)
                        ->increment('position');
                }
            } else {
                // Moving to a different list
                // 1. Decrement positions in the old list to close the gap
                Task::where('list_id', $oldListId)
                    ->where('position', '>', $oldPosition)
                    ->decrement('position');

                // 2. Increment positions in the new list to make room
                Task::where('list_id', $newList->id)
                    ->where('position', '>=', $newPosition)
                    ->increment('position');
            }

            $task->list_id = $newList->id;
            $task->position = $newPosition;
            $task->sprint_id = $validated['sprint_id'] ?? $task->sprint_id;
            $task->board_id = $validated['board_id'] ?? $task->board_id;
            $task->save();
        });

        return new TaskResource($task);
    }

    public function duplicate(Task $task)
    {
        $new = $task->replicate();
        $new->title = $task->title . ' (copy)';
        $new->position = Task::where('list_id', $task->list_id)->count();
        $new->save();

        // Copy relationships
        $new->assignees()->attach($task->assignees->pluck('id'));
        $new->labels()->attach($task->labels->pluck('id'));
        
        foreach ($task->checklists as $checklist) {
            $cl = $new->checklists()->create(['title' => $checklist->title, 'position' => $checklist->position]);
            foreach ($checklist->items as $item) {
                $cl->items()->create($item->only(['title', 'is_completed', 'position', 'assigned_to', 'due_date']));
            }
        }

        return new TaskResource($new);
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tasks,id',
            'status' => 'sometimes|string',
            'priority' => 'sometimes|string',
            'assignee_id' => 'nullable|exists:users,id',
        ]);

        $tasks = Task::whereIn('id', $validated['ids'])->get();

        foreach ($tasks as $task) {
            if (isset($validated['status'])) $task->status = $validated['status'];
            if (isset($validated['priority'])) $task->priority = $validated['priority'];
            $task->save();
            
            if (isset($validated['assignee_id'])) {
                $task->assignees()->sync([$validated['assignee_id']]);
            }
        }

        return response()->json(['message' => 'Tasks updated successfully']);
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }
}
