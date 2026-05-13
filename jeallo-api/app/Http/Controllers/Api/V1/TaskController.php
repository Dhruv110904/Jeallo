<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\TaskAssigned;
use App\Events\TaskStatusChanged;
use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\TaskStatusHistory;
use App\Notifications\TaskAssignedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Task::with(['creator', 'assignees'])
            ->withCount(['comments', 'timeLogs']);

        // Employees only see assigned tasks
        if ($user->hasRole('employee')) {
            $query->whereHas('assignees', fn($q) => $q->where('users.id', $user->id));
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('assigned_to')) {
            $query->whereHas('assignees', fn($q) => $q->where('users.id', $request->assigned_to));
        }
        if ($request->filled('due_date')) {
            $query->whereDate('due_date', $request->due_date);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $tasks = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return TaskResource::collection($tasks);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Task::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:todo,in_progress,in_review,done,cancelled',
            'priority' => 'in:low,medium,high,critical',
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'parent_task_id' => 'nullable|exists:tasks,id',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:users,id',
        ]);

        $assigneeIds = $validated['assignee_ids'] ?? [];
        unset($validated['assignee_ids']);

        $task = Task::create(array_merge($validated, ['created_by' => $request->user()->id]));

        if ($assigneeIds) {
            $pivotData = array_fill_keys($assigneeIds, ['assigned_at' => now()]);
            $task->assignees()->sync($pivotData);
            event(new TaskAssigned($task));
        }

        return new TaskResource($task->load('creator', 'assignees'));
    }

    public function show(Task $task)
    {
        Gate::authorize('view', $task);
        return new TaskResource($task->load('creator', 'assignees', 'media'));
    }

    public function update(Request $request, Task $task)
    {
        Gate::authorize('update', $task);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:todo,in_progress,in_review,done,cancelled',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
            'due_date' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'parent_task_id' => 'nullable|exists:tasks,id',
        ]);

        $task->update($validated);

        return new TaskResource($task->fresh()->load('creator', 'assignees'));
    }

    public function destroy(Task $task)
    {
        Gate::authorize('delete', $task);
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully.']);
    }

    public function assign(Request $request, Task $task)
    {
        Gate::authorize('update', $task);

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $pivotData = array_fill_keys($request->user_ids, ['assigned_at' => now()]);
        $task->assignees()->sync($pivotData);

        event(new TaskAssigned($task));

        return new TaskResource($task->fresh()->load('creator', 'assignees'));
    }

    public function updateStatus(Request $request, Task $task)
    {
        Gate::authorize('view', $task);

        $request->validate([
            'status' => 'required|in:todo,in_progress,in_review,done,cancelled',
        ]);

        $oldStatus = $task->status;
        $task->update(['status' => $request->status]);

        TaskStatusHistory::create([
            'task_id' => $task->id,
            'changed_by' => $request->user()->id,
            'old_status' => $oldStatus,
            'new_status' => $request->status,
        ]);

        event(new TaskStatusChanged($task, $oldStatus, $request->status));

        return new TaskResource($task->fresh()->load('creator', 'assignees'));
    }

    public function activity(Task $task)
    {
        Gate::authorize('view', $task);
        return response()->json($task->activities()->with('causer')->latest()->get());
    }

    public function uploadAttachment(Request $request, Task $task)
    {
        Gate::authorize('view', $task);

        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $media = $task->addMediaFromRequest('file')
            ->toMediaCollection('attachments');

        return response()->json([
            'id' => $media->id,
            'name' => $media->file_name,
            'url' => $media->getFullUrl(),
            'size' => $media->size,
            'mime' => $media->mime_type,
        ], 201);
    }

    public function subtasks(Task $task)
    {
        Gate::authorize('view', $task);
        return TaskResource::collection($task->subtasks()->with('creator', 'assignees')->get());
    }
}
