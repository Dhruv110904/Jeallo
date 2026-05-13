<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskDeadlineReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Task $task) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('[Jeallo] Deadline Reminder: ' . $this->task->title)
            ->line('This task is due in 24 hours!')
            ->line('Task: ' . $this->task->title)
            ->line('Due: ' . $this->task->due_date->format('M d, Y'))
            ->action('View Task', env('FRONTEND_URL') . '/tasks/' . $this->task->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'deadline_reminder',
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'due_date' => $this->task->due_date->format('Y-m-d'),
            'message' => 'Deadline reminder: "' . $this->task->title . '" is due tomorrow!',
        ];
    }
}
