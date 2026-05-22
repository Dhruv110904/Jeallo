<?php

namespace App\Exports;

use App\Models\Task;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TasksExport implements FromCollection, WithHeadings, WithMapping
{
    protected $projectId;

    public function __construct($projectId)
    {
        $this->projectId = $projectId;
    }

    public function collection()
    {
        return Task::with(['creator', 'assignees'])
            ->where('project_id', $this->projectId)
            ->withTrashed(false)
            ->get();
    }

    public function headings(): array
    {
        return ['ID', 'Title', 'Status', 'Priority', 'Category', 'Due Date', 'Created By', 'Assignees', 'Created At'];
    }

    public function map($task): array
    {
        return [
            $task->id,
            $task->title,
            $task->status,
            $task->priority,
            $task->category,
            $task->due_date?->format('Y-m-d'),
            $task->creator?->name,
            $task->assignees->pluck('name')->join(', '),
            $task->created_at->format('Y-m-d H:i'),
        ];
    }
}
