<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCommentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Task $task,
        public TaskComment $comment,
        public User $commenter,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('[Jeallo] New Comment on: ' . $this->task->title)
            ->line($this->commenter->name . ' commented on "' . $this->task->title . '"')
            ->line('"' . substr($this->comment->body, 0, 150) . '"')
            ->action('View Task', env('FRONTEND_URL') . '/tasks/' . $this->task->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'task_comment',
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'commenter_name' => $this->commenter->name,
            'message' => $this->commenter->name . ' commented on: ' . $this->task->title,
        ];
    }
}
