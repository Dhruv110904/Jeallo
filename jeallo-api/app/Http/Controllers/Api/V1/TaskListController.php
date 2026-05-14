<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TaskList;
use App\Models\Board;
use App\Http\Resources\TaskListResource;
use Illuminate\Http\Request;

class TaskListController extends Controller
{
    public function index(Board $board)
    {
        return TaskListResource::collection($board->lists);
    }

    public function store(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string',
            'position' => 'nullable|integer',
            'is_done_list' => 'nullable|boolean',
            'wip_limit' => 'nullable|integer',
        ]);

        $list = $board->lists()->create([
            ...$validated,
            'position' => $validated['position'] ?? $board->lists()->count(),
        ]);

        return new TaskListResource($list);
    }

    public function update(Request $request, TaskList $list)
    {
        $list->update($request->validate([
            'name' => 'sometimes|string|max:255',
            'color' => 'nullable|string',
            'position' => 'sometimes|integer',
            'is_done_list' => 'sometimes|boolean',
            'wip_limit' => 'nullable|integer',
        ]));

        return new TaskListResource($list);
    }

    public function reorder(Request $request, Board $board)
    {
        $request->validate([
            'list_ids' => 'required|array',
            'list_ids.*' => 'exists:lists,id',
        ]);

        foreach ($request->list_ids as $index => $id) {
            TaskList::where('id', $id)->update(['position' => $index]);
        }

        return response()->json(['message' => 'Lists reordered']);
    }

    public function destroy(TaskList $list)
    {
        $list->delete();
        return response()->noContent();
    }
}
