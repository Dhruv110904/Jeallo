<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Task;
use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class MetricsController extends Controller
{
    /**
     * Expose key application statistics in Prometheus exposition format.
     */
    public function index()
    {
        try {
            $userCount = User::count();
            $taskCount = Task::count();
            $projectCount = Project::count();
            $workspaceCount = Workspace::count();

            // Task by priority
            $tasksByPriority = Task::select('priority', DB::raw('count(*) as total'))
                ->groupBy('priority')
                ->get();

            // Task by status
            $tasksByStatus = Task::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->get();

            $metrics = [];

            $metrics[] = "# HELP jeallo_up 1 if the service is up and running.";
            $metrics[] = "# TYPE jeallo_up gauge";
            $metrics[] = "jeallo_up 1";

            $metrics[] = "# HELP jeallo_users_total Total number of registered users.";
            $metrics[] = "# TYPE jeallo_users_total gauge";
            $metrics[] = "jeallo_users_total " . $userCount;

            $metrics[] = "# HELP jeallo_tasks_total Total number of tasks.";
            $metrics[] = "# TYPE jeallo_tasks_total gauge";
            $metrics[] = "jeallo_tasks_total " . $taskCount;

            $metrics[] = "# HELP jeallo_projects_total Total number of projects.";
            $metrics[] = "# TYPE jeallo_projects_total gauge";
            $metrics[] = "jeallo_projects_total " . $projectCount;

            $metrics[] = "# HELP jeallo_workspaces_total Total number of workspaces.";
            $metrics[] = "# TYPE jeallo_workspaces_total gauge";
            $metrics[] = "jeallo_workspaces_total " . $workspaceCount;

            $metrics[] = "# HELP jeallo_tasks_by_priority Total tasks grouped by priority.";
            $metrics[] = "# TYPE jeallo_tasks_by_priority gauge";
            foreach ($tasksByPriority as $p) {
                $priority = $p->priority ?: 'unassigned';
                $metrics[] = 'jeallo_tasks_by_priority{priority="' . $priority . '"} ' . $p->total;
            }

            $metrics[] = "# HELP jeallo_tasks_by_status Total tasks grouped by status.";
            $metrics[] = "# TYPE jeallo_tasks_by_status gauge";
            foreach ($tasksByStatus as $s) {
                $status = $s->status ?: 'unassigned';
                $metrics[] = 'jeallo_tasks_by_status{status="' . $status . '"} ' . $s->total;
            }

            $output = implode("\n", $metrics) . "\n";

            return response($output, 200)
                ->header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');

        } catch (\Exception $e) {
            return response("Error generating metrics: " . $e->getMessage(), 500)
                ->header('Content-Type', 'text/plain');
        }
    }
}
