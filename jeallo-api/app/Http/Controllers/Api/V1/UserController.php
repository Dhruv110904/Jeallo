<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('roles')
            ->when($request->filled('role'), fn($q) => $q->role($request->role))
            ->when($request->filled('search'), fn($q) => $q->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%'))
            ->when($request->filled('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->paginate($request->get('per_page', 15));

        return UserResource::collection($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super_admin,manager,employee',
            'department' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric',
            'joining_date' => 'nullable|date',
            'address' => 'nullable|string',
            'emergency_contacts' => 'nullable|array',
        ]);

        // Generate unique 5-digit employee ID
        do {
            $employee_id = str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
        } while (User::where('employee_id', $employee_id)->exists());

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'employee_id' => $employee_id,
            'password' => Hash::make($validated['password']),
            'department' => $validated['department'] ?? null,
            'designation' => $validated['designation'] ?? null,
            'role' => $validated['role'],
            'salary' => $validated['salary'] ?? null,
            'joining_date' => $validated['joining_date'] ?? null,
            'address' => $validated['address'] ?? null,
            'emergency_contacts' => $validated['emergency_contacts'] ?? null,
        ]);

        $user->assignRole($validated['role']);

        return response()->json([
            'message' => 'Employee created successfully.',
            'user' => new UserResource($user->load('roles')),
            'employee_id' => $employee_id,
        ], 201);
    }

    public function show(User $user)
    {
        return new UserResource($user->load('roles', 'permissions'));
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role' => 'sometimes|in:super_admin,manager,employee',
            'department' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'salary' => 'nullable|numeric',
            'joining_date' => 'nullable|date',
            'address' => 'nullable|string',
            'emergency_contacts' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
            $user->role = $validated['role'];
            $user->save();
            unset($validated['role']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Employee updated successfully.',
            'user' => new UserResource($user->fresh()->load('roles')),
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot delete yourself.'], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Employee deleted successfully.',
        ]);
    }

    public function invite(Request $request)
    {
        // Alias to store for now; can be extended with email invitations
        return $this->store($request);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => $path]);
        }

        return response()->json([
            'message' => 'Avatar updated successfully.',
            'user' => new UserResource($user->fresh()->load('roles')),
        ]);
    }
}
