<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function events(Request $request)
    {
        $user = $request->user();

        $query = Task::whereNotNull('due_date');

        if ($user->hasRole('employee')) {
            $query->whereHas('assignees', fn($q) => $q->where('users.id', $user->id));
        }

        if ($request->filled('start')) {
            $query->whereDate('due_date', '>=', $request->start);
        }
        if ($request->filled('end')) {
            $query->whereDate('due_date', '<=', $request->end);
        }

        return response()->json(
            $query->get()->map(fn($task) => [
                'id' => $task->id,
                'title' => $task->title,
                'start' => $task->due_date->format('Y-m-d'),
                'color' => match($task->priority) {
                    'critical' => '#ef4444',
                    'high' => '#f97316',
                    'medium' => '#eab308',
                    'low' => '#22c55e',
                    default => '#6b7280',
                },
                'extendedProps' => [
                    'status' => $task->status,
                    'priority' => $task->priority,
                ],
            ])
        );
    }
}
