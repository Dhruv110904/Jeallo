<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskStatusChangedNotification extends Notification
{

    public function __construct(
        public Task $task,
        public string $oldStatus,
        public string $newStatus,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('[Jeallo] Task Status Updated: ' . $this->task->title)
            ->line('Task "' . $this->task->title . '" status changed.')
            ->line('From: ' . strtoupper($this->oldStatus) . ' → ' . strtoupper($this->newStatus))
            ->action('View Task', env('FRONTEND_URL') . '/tasks/' . $this->task->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'task_status_changed',
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'message' => 'Task "' . $this->task->title . '" moved to ' . $this->newStatus,
        ];
    }
}
