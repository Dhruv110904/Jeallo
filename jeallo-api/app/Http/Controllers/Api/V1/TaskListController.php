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
        $lists = $board->lists()
            ->with(['tasks' => function ($q) {
                $q->orderBy('position');
            }, 'tasks.creator', 'tasks.assignees', 'tasks.labels', 'tasks.epic'])
            ->get();

        return TaskListResource::collection($lists);
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

        if (!isset($validated['is_done_list'])) {
            $nameLower = strtolower(trim($validated['name']));
            if (in_array($nameLower, ['done', 'complete', 'completed', 'comlete', 'finished'])) {
                $validated['is_done_list'] = true;
            }
        }

        $list = $board->lists()->create([
            ...$validated,
            'position' => $validated['position'] ?? $board->lists()->count(),
        ]);

        return new TaskListResource($list);
    }

    public function update(Request $request, TaskList $list)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'color' => 'nullable|string',
            'position' => 'sometimes|integer',
            'is_done_list' => 'sometimes|boolean',
            'wip_limit' => 'nullable|integer',
        ]);

        if (isset($validated['name']) && !isset($validated['is_done_list'])) {
            $nameLower = strtolower(trim($validated['name']));
            if (in_array($nameLower, ['done', 'complete', 'completed', 'comlete', 'finished'])) {
                $validated['is_done_list'] = true;
            } else {
                $validated['is_done_list'] = false;
            }
        }

        $list->update($validated);

        if (isset($validated['name'])) {
            $list->tasks()->update(['status' => $validated['name']]);
        }

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
