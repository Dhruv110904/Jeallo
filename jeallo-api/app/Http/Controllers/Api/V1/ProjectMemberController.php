<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class ProjectMemberController extends Controller
{
    public function index(Project $project)
    {
        return UserResource::collection($project->users);
    }

    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'nullable|string'
        ]);

        if (!$project->users()->where('users.id', $validated['user_id'])->exists()) {
            $project->users()->attach($validated['user_id'], ['role' => $validated['role'] ?? 'member']);
        }

        return response()->json(['message' => 'Member added successfully']);
    }

    public function destroy(Project $project, User $user)
    {
        $project->users()->detach($user->id);
        return response()->json(['message' => 'Member removed successfully']);
    }
}
