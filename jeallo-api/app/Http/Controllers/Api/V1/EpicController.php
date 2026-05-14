<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Epic;
use App\Models\Project;
use App\Http\Resources\EpicResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EpicController extends Controller
{
    public function index(Project $project)
    {
        return EpicResource::collection($project->epics);
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,done',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        $epic = $project->epics()->create([
            ...$validated,
            'owner_id' => Auth::id(),
        ]);

        return new EpicResource($epic);
    }

    public function show(Epic $epic)
    {
        return new EpicResource($epic->load('tasks'));
    }

    public function update(Request $request, Epic $epic)
    {
        $epic->update($request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
            'status' => 'sometimes|in:todo,in_progress,done',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]));

        return new EpicResource($epic);
    }

    public function destroy(Epic $epic)
    {
        $epic->delete();
        return response()->noContent();
    }
}
