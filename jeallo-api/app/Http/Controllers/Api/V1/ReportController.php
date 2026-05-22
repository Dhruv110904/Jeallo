<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function overview(Project $project)
    {
        $stats = [
            'total_tasks' => $project->tasks()->count(),
            'completed' => $project->tasks()->whereIn(DB::raw('LOWER(status)'), ['done', 'complete', 'completed', 'comlete', 'finished'])->count(),
            'in_progress' => $project->tasks()->whereIn(DB::raw('LOWER(status)'), ['in_progress', 'in progress', 'in_review', 'in review', 'doing', 'testing'])->count(),
            'overdue' => $project->tasks()->where('due_date', '<', now())->whereNotIn(DB::raw('LOWER(status)'), ['done', 'complete', 'completed', 'comlete', 'finished'])->count(),
        ];

        $byStatus = $project->tasks()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $byPriority = $project->tasks()
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->get();

        return response()->json([
            'stats' => $stats,
            'by_status' => $byStatus,
            'by_priority' => $byPriority,
        ]);
    }

    public function velocity(Project $project)
    {
        // Jira-style velocity: story points committed vs completed per sprint
        $velocity = $project->boards()->with(['sprints' => function($q) {
            $q->where('status', 'completed')->latest()->take(5);
        }, 'sprints.tasks'])->get()->pluck('sprints')->flatten();

        $data = $velocity->map(function($sprint) {
            return [
                'name' => $sprint->name,
                'committed' => $sprint->tasks->sum('story_points'),
                'completed' => $sprint->tasks->filter(function($t) {
                    return in_array(strtolower(trim($t->status)), ['done', 'complete', 'completed', 'comlete', 'finished']);
                })->sum('story_points'),
            ];
        });

        return response()->json($data);
    }

    public function burndown(Sprint $sprint)
    {
        // Simple burndown calculation
        $totalPoints = $sprint->tasks->sum('story_points');
        $startDate = $sprint->start_date;
        $endDate = $sprint->end_date ?? now();
        
        // This is a placeholder for real historical logic which would require status_history
        return response()->json([
            'total_points' => $totalPoints,
            'data' => [
                ['day' => 0, 'ideal' => $totalPoints, 'actual' => $totalPoints],
                ['day' => 1, 'ideal' => $totalPoints * 0.8, 'actual' => $totalPoints * 0.9],
                // ... real logic would iterate through dates
            ]
        ]);
    }

    public function workload(Workspace $workspace)
    {
        $members = $workspace->users()->get();
        
        $data = $members->map(function($user) {
            $tasks = \App\Models\Task::whereHas('assignees', fn($q) => $q->where('users.id', $user->id))->get();
            return [
                'name' => $user->name,
                'avatar' => $user->avatar,
                'task_count' => $tasks->count(),
                'story_points' => $tasks->sum('story_points'),
                'overdue' => $tasks->where('due_date', '<', now())->filter(function($t) {
                    return !in_array(strtolower(trim($t->status)), ['done', 'complete', 'completed', 'comlete', 'finished']);
                })->count(),
            ];
        });

        return response()->json($data);
    }

    public function export(Project $project)
    {
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\TasksExport($project->id), 
            'project-report-' . now()->format('Y-m-d') . '.xlsx'
        );
    }
}
