<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use App\Http\Resources\WorkspaceResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class WorkspaceController extends Controller
{
    public function index()
    {
        return WorkspaceResource::collection(Auth::user()->workspaces);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
        ]);

        $workspace = Workspace::create([
            ...$validated,
            'slug' => Str::slug($validated['name']) . '-' . Str::random(5),
            'owner_id' => Auth::id(),
        ]);

        $workspace->users()->attach(Auth::id(), [
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        return new WorkspaceResource($workspace);
    }

    public function show(Workspace $workspace)
    {
        return new WorkspaceResource($workspace->load(['projects', 'users']));
    }

    public function update(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        $workspace->update($validated);

        return new WorkspaceResource($workspace);
    }

    public function destroy(Workspace $workspace)
    {
        if ($workspace->owner_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $workspace->delete();
        return response()->noContent();
    }

    public function invite(Request $request, Workspace $workspace)
    {
        // Simple placeholder for now, would typically send an email
        $request->validate(['email' => 'required|email']);
        return response()->json(['message' => 'Invitation sent to ' . $request->email]);
    }
}
