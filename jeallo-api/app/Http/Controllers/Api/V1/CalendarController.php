<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Meeting;
use App\Models\Holiday;
use App\Models\Leave;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CalendarController extends Controller
{
    public function events(Request $request)
    {
        $user = $request->user();
        $start = $request->start ? Carbon::parse($request->start) : Carbon::now()->startOfMonth();
        $end = $request->end ? Carbon::parse($request->end) : Carbon::now()->endOfMonth();

        $events = collect();

        // 1. Task Deadlines
        $taskQuery = Task::whereNotNull('due_date')
            ->whereDate('due_date', '>=', $start)
            ->whereDate('due_date', '<=', $end);

        if ($user->role === 'employee') {
            $taskQuery->whereHas('assignees', fn($q) => $q->where('users.id', $user->id));
        }

        $taskQuery->get()->each(function ($task) use ($events) {
            $events->push([
                'id' => 'task-' . $task->id,
                'title' => '📌 ' . $task->title,
                'start' => $task->due_date->format('Y-m-d'),
                'type' => 'deadline',
                'color' => '#ef4444', // Red for deadlines
                'allDay' => true,
                'extendedProps' => ['priority' => $task->priority, 'status' => $task->status]
            ]);
        });

        // 2. Meetings
        $meetingQuery = Meeting::where('workspace_id', $request->header('X-Workspace-Id'))
            ->whereBetween('start_time', [$start, $end]);

        if ($user->role === 'employee') {
            $meetingQuery->whereHas('participants', fn($q) => $q->where('users.id', $user->id));
        }

        $meetingQuery->get()->each(function ($meeting) use ($events) {
            $events->push([
                'id' => 'meeting-' . $meeting->id,
                'title' => '📹 ' . $meeting->title,
                'start' => $meeting->start_time->toIso8601String(),
                'end' => $meeting->end_time->toIso8601String(),
                'type' => 'meeting',
                'color' => '#1B3A6B', // Jeallo Navy
                'extendedProps' => ['link' => $meeting->meeting_link, 'location' => $meeting->type]
            ]);
        });

        // 3. Holidays
        Holiday::where('workspace_id', $request->header('X-Workspace-Id'))
            ->whereBetween('date', [$start, $end])
            ->get()->each(function ($holiday) use ($events) {
                $events->push([
                    'id' => 'holiday-' . $holiday->id,
                    'title' => '🎉 ' . $holiday->name,
                    'start' => $holiday->date->format('Y-m-d'),
                    'type' => 'holiday',
                    'color' => '#f97316', // Jeallo Orange
                    'allDay' => true,
                ]);
            });

        // 4. Leave Dates
        $leaveQuery = Leave::where('status', 'approved')
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('start_date', [$start, $end])
                  ->orWhereBetween('end_date', [$start, $end]);
            });

        if ($user->role === 'employee') {
            $leaveQuery->where('user_id', $user->id);
        }

        $leaveQuery->get()->each(function ($leave) use ($events) {
            $events->push([
                'id' => 'leave-' . $leave->id,
                'title' => '🌴 Leave: ' . $leave->user->name,
                'start' => $leave->start_date->format('Y-m-d'),
                'end' => $leave->end_date->addDay()->format('Y-m-d'), // Add 1 day for inclusive end in FullCalendar
                'type' => 'leave',
                'color' => '#6b7280', // Grey
                'allDay' => true,
            ]);
        });

        return response()->json($events);
    }
}
