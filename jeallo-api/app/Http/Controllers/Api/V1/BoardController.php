<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Project;
use App\Http\Resources\BoardResource;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index(Project $project)
    {
        return BoardResource::collection($project->boards);
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:kanban,scrum',
            'background_color' => 'nullable|string',
            'background_type' => 'nullable|in:color,gradient,image',
        ]);

        $board = $project->boards()->create($validated);

        return new BoardResource($board);
    }

    public function show(Board $board)
    {
        return new BoardResource($board->load(['lists.tasks', 'sprints']));
    }

    public function update(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'background_color' => 'nullable|string',
            'background_type' => 'nullable|in:color,gradient,image',
        ]);

        $board->update($validated);

        return new BoardResource($board);
    }

    public function destroy(Board $board)
    {
        $board->delete();
        return response()->noContent();
    }
}
