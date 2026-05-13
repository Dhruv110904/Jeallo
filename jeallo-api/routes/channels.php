<?php

use App\Models\Task;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('tasks.{taskId}', function ($user, $taskId) {
    $task = Task::with('assignees')->find($taskId);
    return $task && ($task->created_by === $user->id || $task->assignees->contains($user->id));
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
