<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TasksExport;

class ReportController extends Controller
{
    public function overview(Request $request)
    {
        $total = Task::count();
        $completed = Task::where('status', 'done')->count();
        $inProgress = Task::where('status', 'in_progress')->count();
        $overdue = Task::whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->whereNotIn('status', ['done', 'cancelled'])
            ->count();

        $completionRate = $total > 0 ? round(($completed / $total) * 100, 1) : 0;

        // Per-employee stats
        $employeeStats = User::whereHas('roles', fn($q) => $q->where('name', 'employee'))
            ->with(['assignedTasks' => fn($q) => $q->select('tasks.id', 'status', 'due_date')])
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'total' => $user->assignedTasks->count(),
                'completed' => $user->assignedTasks->where('status', 'done')->count(),
                'overdue' => $user->assignedTasks->filter(fn($t) =>
                    $t->due_date && $t->due_date < now() && ! in_array($t->status, ['done', 'cancelled'])
                )->count(),
                'completion_rate' => $user->assignedTasks->count() > 0
                    ? round(($user->assignedTasks->where('status', 'done')->count() / $user->assignedTasks->count()) * 100, 1)
                    : 0,
            ]);

        $tasksByStatus = Task::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $tasksByPriority = Task::selectRaw('priority, COUNT(*) as count')
            ->groupBy('priority')
            ->get()
            ->pluck('count', 'priority');

        return response()->json([
            'total' => $total,
            'completed' => $completed,
            'in_progress' => $inProgress,
            'overdue' => $overdue,
            'completion_rate' => $completionRate,
            'tasks_by_status' => $tasksByStatus,
            'tasks_by_priority' => $tasksByPriority,
            'employee_stats' => $employeeStats,
        ]);
    }

    public function employeeReport(Request $request, User $user)
    {
        $tasks = $user->assignedTasks()->with('creator')->get();

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
            'total' => $tasks->count(),
            'completed' => $tasks->where('status', 'done')->count(),
            'in_progress' => $tasks->where('status', 'in_progress')->count(),
            'tasks' => $tasks->map(fn($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'status' => $t->status,
                'priority' => $t->priority,
                'due_date' => $t->due_date?->format('Y-m-d'),
            ]),
        ]);
    }

    public function export(Request $request)
    {
        return Excel::download(new TasksExport(), 'jeallo-tasks-' . now()->format('Y-m-d') . '.xlsx');
    }
}
