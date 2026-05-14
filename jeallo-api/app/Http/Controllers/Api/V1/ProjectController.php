<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Workspace;
use App\Http\Resources\ProjectResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index(Workspace $workspace)
    {
        $user = Auth::user();
        
        if ($user->role === 'employee') {
            $projects = $workspace->projects()
                ->whereHas('users', function ($query) use ($user) {
                    $query->where('users.id', $user->id);
                })
                ->get();
            return ProjectResource::collection($projects);
        }

        return ProjectResource::collection($workspace->projects);
    }

    public function store(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date|after_or_equal:today',
            'color' => 'nullable|string',
            'icon' => 'nullable|string',
            'type' => 'required|in:scrum,kanban',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:users,id',
        ]);

        $project = $workspace->projects()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'deadline' => $validated['deadline'] ?? null,
            'color' => $validated['color'] ?? '#1B3A6B',
            'icon' => $validated['icon'] ?? null,
            'type' => $validated['type'],
            'slug' => Str::upper(Str::limit(Str::slug($validated['name']), 4, '')),
            'owner_id' => Auth::id(),
            'status' => 'active',
        ]);

        // Attach creator as manager
        $project->users()->attach(Auth::id(), ['role' => 'manager']);

        // Attach team members as members
        if (!empty($validated['team_members'])) {
            $project->users()->attach($validated['team_members'], ['role' => 'member']);
        }

        return new ProjectResource($project);
    }

    public function show(Project $project)
    {
        return new ProjectResource($project->load(['boards', 'epics', 'users']));
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'color' => 'nullable|string',
            'icon' => 'nullable|string',
            'status' => 'sometimes|in:active,archived,deleted',
            'settings' => 'nullable|array',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:users,id',
        ]);

        $project->update($validated);

        if (isset($validated['team_members'])) {
            // Sync members (keeping the manager/owner)
            $managerIds = $project->users()->wherePivot('role', 'manager')->pluck('users.id')->toArray();
            $project->users()->syncWithPivotValues(
                array_merge($managerIds, $validated['team_members']),
                ['role' => 'member']
            );
            // Re-fix manager roles because sync might overwrite them if not careful
            foreach ($managerIds as $id) {
                $project->users()->updateExistingPivot($id, ['role' => 'manager']);
            }
        }

        return new ProjectResource($project);
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return response()->noContent();
    }
}
