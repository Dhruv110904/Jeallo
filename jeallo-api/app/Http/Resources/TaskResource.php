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
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'category' => $this->category,
            'tags' => $this->tags ?? [],
            'due_date' => $this->due_date?->format('Y-m-d'),
            'estimated_hours' => $this->estimated_hours,
            'parent_task_id' => $this->parent_task_id,
            'created_by' => $this->created_by,
            'creator' => new UserResource($this->whenLoaded('creator')),
            'assignees' => UserResource::collection($this->whenLoaded('assignees')),
            'comments_count' => $this->whenCounted('comments'),
            'time_logs_count' => $this->whenCounted('timeLogs'),
            'attachments' => $this->whenLoaded('media', fn() =>
                $this->getMedia('attachments')->map(fn($m) => [
                    'id' => $m->id,
                    'name' => $m->file_name,
                    'url' => $m->getFullUrl(),
                    'size' => $m->size,
                    'mime' => $m->mime_type,
                ])
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
