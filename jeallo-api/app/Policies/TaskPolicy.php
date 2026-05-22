<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->hasRole(['manager', 'super_admin'])) {
            return true;
        }
        return $task->assignees->contains($user->id) || $task->created_by === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['manager', 'super_admin', 'employee']) || in_array($user->role, ['manager', 'super_admin', 'employee']);
    }

    public function update(User $user, Task $task): bool
    {
        if ($user->hasRole(['manager', 'super_admin']) || in_array($user->role, ['manager', 'super_admin'])) {
            return true;
        }
        return $task->assignees->contains($user->id) || $task->created_by === $user->id;
    }

    public function delete(User $user, Task $task): bool
    {
        if ($user->hasRole(['manager', 'super_admin']) || in_array($user->role, ['manager', 'super_admin'])) {
            return true;
        }
        return $task->created_by === $user->id;
    }

    public function restore(User $user, Task $task): bool
    {
        return $user->hasRole('super_admin');
    }

    public function forceDelete(User $user, Task $task): bool
    {
        return $user->hasRole('super_admin');
    }
}
