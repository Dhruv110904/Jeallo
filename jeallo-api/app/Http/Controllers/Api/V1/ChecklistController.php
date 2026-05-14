<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Checklist;
use App\Models\ChecklistItem;
use App\Models\Task;
use App\Http\Resources\ChecklistResource;
use App\Http\Resources\ChecklistItemResource;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    public function index(Task $task)
    {
        return ChecklistResource::collection($task->checklists);
    }

    public function store(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'position' => 'nullable|integer',
        ]);

        $checklist = $task->checklists()->create([
            ...$validated,
            'position' => $validated['position'] ?? $task->checklists()->count(),
        ]);

        return new ChecklistResource($checklist);
    }

    public function update(Request $request, Checklist $checklist)
    {
        $checklist->update($request->validate(['title' => 'required|string|max:255']));
        return new ChecklistResource($checklist);
    }

    public function destroy(Checklist $checklist)
    {
        $checklist->delete();
        return response()->noContent();
    }

    // Items
    public function addItem(Request $request, Checklist $checklist)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'position' => 'nullable|integer',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $item = $checklist->items()->create([
            ...$validated,
            'position' => $validated['position'] ?? $checklist->items()->count(),
        ]);

        return new ChecklistItemResource($item);
    }

    public function updateItem(Request $request, ChecklistItem $item)
    {
        $item->update($request->validate([
            'title' => 'sometimes|string|max:255',
            'is_completed' => 'sometimes|boolean',
            'position' => 'sometimes|integer',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]));

        return new ChecklistItemResource($item);
    }

    public function destroyItem(ChecklistItem $item)
    {
        $item->delete();
        return response()->noContent();
    }
}
