<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'board_id' => $this->board_id,
            'list_id' => $this->list_id,
            'sprint_id' => $this->sprint_id,
            'epic_id' => $this->epic_id,
            'parent_task_id' => $this->parent_task_id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'status' => $this->status,
            'priority' => $this->priority,
            'story_points' => $this->story_points,
            'estimated_hours' => $this->estimated_hours,
            'logged_hours' => $this->logged_hours,
            'due_date' => $this->due_date?->toDateString(),
            'start_date' => $this->start_date?->toDateString(),
            'position' => $this->position,
            'cover_color' => $this->cover_color,
            'cover_image' => $this->cover_image,
            'is_archived' => $this->is_archived,
            'creator' => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'avatar' => $this->creator->avatar,
            ],
            'reporter' => $this->reporter ? [
                'id' => $this->reporter->id,
                'name' => $this->reporter->name,
                'avatar' => $this->reporter->avatar,
            ] : null,
            'assignees' => $this->assignees->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
            ]),
            'labels' => $this->labels->map(fn($label) => [
                'id' => $label->id,
                'name' => $label->name,
                'color' => $label->color,
            ]),
            'epic' => $this->epic ? [
                'id' => $this->epic->id,
                'name' => $this->epic->name,
                'color' => $this->epic->color,
            ] : null,
            'checklist_stats' => [
                'total' => $this->checklists->sum(fn($c) => $c->items->count()),
                'completed' => $this->checklists->sum(fn($c) => $c->items->where('is_completed', true)->count()),
                'percentage' => $this->progress,
            ],
            'attachments_count' => $this->getMedia('attachments')->count(),
            'comments_count' => $this->comments_count ?? $this->comments()->count(),
            'subtasks_count' => $this->subtasks()->count(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
