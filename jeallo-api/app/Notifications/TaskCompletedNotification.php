<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Notifications\Notification;

class TaskCompletedNotification extends Notification
{
    public function __construct(
        public Task $task,
        public ?User $completedBy = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $name = $this->completedBy ? $this->completedBy->name : 'someone';
        return [
            'type' => 'task_completed',
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'completed_by_name' => $name,
            'message' => 'Task "' . $this->task->title . '" was marked as Completed by ' . $name,
        ];
    }
}
