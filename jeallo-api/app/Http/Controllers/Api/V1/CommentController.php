<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use App\Http\Resources\CommentResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index(Task $task)
    {
        return CommentResource::collection($task->comments()->with('user')->get());
    }

    public function store(Request $request, Task $task)
    {
        $validated = $request->validate([
            'body' => 'required|string',
            'parent_id' => 'nullable|exists:task_comments,id',
        ]);

        $comment = $task->comments()->create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return new CommentResource($comment);
    }

    public function update(Request $request, TaskComment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->update([
            'body' => $request->validate(['body' => 'required|string'])['body'],
            'is_edited' => true,
        ]);

        return new CommentResource($comment);
    }

    public function destroy(TaskComment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();
        return response()->noContent();
    }
}
