<?php
 
namespace App\Http\Controllers\Api\V1;
 
use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Meeting;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\Workspace;
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

    public function storeMeeting(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'meeting_link' => 'nullable|url',
            'type' => 'nullable|in:zoom,google_meet,offline,other',
        ]);

        $workspaceId = $request->header('X-Workspace-Id');
        if (!$workspaceId) {
            return response()->json(['message' => 'Workspace ID is required.'], 400);
        }

        $meeting = Meeting::create([
            'workspace_id' => $workspaceId,
            'title' => $request->title,
            'description' => $request->description,
            'start_time' => Carbon::parse($request->start_time),
            'end_time' => Carbon::parse($request->end_time),
            'meeting_link' => $request->meeting_link,
            'type' => $request->type ?? 'other',
            'created_by' => $user->id,
        ]);

        // Sync all workspace members as participants
        $workspace = Workspace::find($workspaceId);
        if ($workspace) {
            $userIds = $workspace->users()->pluck('users.id')->toArray();
            $meeting->participants()->sync($userIds);
        }

        return response()->json([
            'message' => 'Meeting created successfully.',
            'meeting' => $meeting
        ], 201);
    }

    public function destroyMeeting(Request $request, Meeting $meeting)
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $meeting->delete();

        return response()->json(['message' => 'Meeting deleted successfully.']);
    }

    public function storeHoliday(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'type' => 'nullable|in:public,company,other',
        ]);

        $workspaceId = $request->header('X-Workspace-Id');
        if (!$workspaceId) {
            return response()->json(['message' => 'Workspace ID is required.'], 400);
        }

        // Check if unique for date
        $exists = Holiday::where('workspace_id', $workspaceId)
            ->whereDate('date', Carbon::parse($request->date))
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'A holiday already exists on this date.'], 422);
        }

        $holiday = Holiday::create([
            'workspace_id' => $workspaceId,
            'name' => $request->name,
            'date' => Carbon::parse($request->date),
            'type' => $request->type ?? 'public',
        ]);

        return response()->json([
            'message' => 'Holiday created successfully.',
            'holiday' => $holiday
        ], 201);
    }

    public function destroyHoliday(Request $request, Holiday $holiday)
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $holiday->delete();

        return response()->json(['message' => 'Holiday deleted successfully.']);
    }
}
