<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Task;
use App\Models\TaskComment;
use App\Notifications\TaskCommentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    public function index(Task $task)
    {
        Gate::authorize('view', $task);

        $comments = $task->comments()
            ->with(['user', 'replies.user'])
            ->whereNull('parent_id')
            ->latest()
            ->get();

        return CommentResource::collection($comments);
    }

    public function store(Request $request, Task $task)
    {
        Gate::authorize('view', $task);

        $request->validate([
            'body' => 'required|string',
            'parent_id' => 'nullable|exists:task_comments,id',
        ]);

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->body,
            'parent_id' => $request->parent_id,
        ]);

        // Notify task creator and assignees (excluding commenter)
        $notifiables = collect([$task->creator])
            ->merge($task->assignees)
            ->unique('id')
            ->reject(fn($u) => $u->id === $request->user()->id);

        foreach ($notifiables as $notifiable) {
            $notifiable->notify(new TaskCommentNotification($task, $comment, $request->user()));
        }

        return new CommentResource($comment->load('user', 'replies.user'));
    }

    public function destroy(TaskComment $comment)
    {
        if ($comment->user_id !== request()->user()->id && ! request()->user()->hasRole('manager|super_admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted.']);
    }
}
