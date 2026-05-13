<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskOverdueNotification extends Notification implements ShouldQueue
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
            ->subject('[Jeallo] ⚠️ Overdue Task: ' . $this->task->title)
            ->line('This task is past its due date and still not completed.')
            ->line('Task: ' . $this->task->title)
            ->line('Was due: ' . $this->task->due_date->format('M d, Y'))
            ->action('Update Task', env('FRONTEND_URL') . '/tasks/' . $this->task->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'task_overdue',
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'due_date' => $this->task->due_date->format('Y-m-d'),
            'message' => 'Overdue: "' . $this->task->title . '" was due ' . $this->task->due_date->diffForHumans(),
        ];
    }
}
