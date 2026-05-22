<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\WorkspaceController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\BoardController;
use App\Http\Controllers\Api\V1\TaskListController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\SprintController;
use App\Http\Controllers\Api\V1\EpicController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\ChecklistController;
use App\Http\Controllers\Api\V1\TimeLogController;
use App\Http\Controllers\Api\V1\LabelController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\AIController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\LeaveController;
use App\Http\Controllers\Api\V1\CalendarController;
use App\Http\Controllers\Api\V1\RegisterController;
use App\Http\Controllers\Api\V1\ProjectMemberController;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Workspaces
        Route::apiResource('workspaces', WorkspaceController::class);
        Route::post('workspaces/{workspace}/invite', [WorkspaceController::class, 'invite']);
        Route::get('workspaces/{workspace}/labels', [LabelController::class, 'index']);
        Route::post('workspaces/{workspace}/labels', [LabelController::class, 'store']);

        // Projects
        Route::get('workspaces/{workspace}/projects', [ProjectController::class, 'index']);
        Route::post('workspaces/{workspace}/projects', [ProjectController::class, 'store']);
        Route::apiResource('projects', ProjectController::class)->except(['index', 'store']);
        Route::get('projects/{project}/members', [ProjectMemberController::class, 'index']);
        Route::post('projects/{project}/members', [ProjectMemberController::class, 'store']);
        Route::delete('projects/{project}/members/{user}', [ProjectMemberController::class, 'destroy']);

        // Boards
        Route::get('projects/{project}/boards', [BoardController::class, 'index']);
        Route::post('projects/{project}/boards', [BoardController::class, 'store']);
        Route::apiResource('boards', BoardController::class)->except(['index', 'store']);
        Route::patch('boards/{board}/lists/reorder', [TaskListController::class, 'reorder']);

        // Lists (Kanban columns)
        Route::get('boards/{board}/lists', [TaskListController::class, 'index']);
        Route::post('boards/{board}/lists', [TaskListController::class, 'store']);
        Route::apiResource('lists', TaskListController::class)->except(['index', 'store']);

        // Sprints
        Route::get('boards/{board}/sprints', [SprintController::class, 'index']);
        Route::post('boards/{board}/sprints', [SprintController::class, 'store']);
        Route::apiResource('sprints', SprintController::class)->except(['index', 'store']);
        Route::post('sprints/{sprint}/start', [SprintController::class, 'start']);
        Route::post('sprints/{sprint}/complete', [SprintController::class, 'complete']);

        // Epics
        Route::get('projects/{project}/epics', [EpicController::class, 'index']);
        Route::post('projects/{project}/epics', [EpicController::class, 'store']);
        Route::apiResource('epics', EpicController::class)->except(['index', 'store']);

        // Tasks
        Route::get('boards/{board}/tasks', [TaskController::class, 'index']);
        Route::get('projects/{project}/tasks', [TaskController::class, 'projectTasks']);
        Route::post('projects/{project}/tasks', [TaskController::class, 'store']);
        Route::apiResource('tasks', TaskController::class)->except(['store']);
        Route::patch('tasks/{task}/move', [TaskController::class, 'move']);
        Route::post('tasks/{task}/duplicate', [TaskController::class, 'duplicate']);
        Route::post('tasks/bulk-update', [TaskController::class, 'bulkUpdate']);

        // Task Interactions
        Route::get('tasks/{task}/comments', [CommentController::class, 'index']);
        Route::post('tasks/{task}/comments', [CommentController::class, 'store']);
        Route::apiResource('comments', CommentController::class)->only(['update', 'destroy']);

        Route::get('tasks/{task}/checklists', [ChecklistController::class, 'index']);
        Route::post('tasks/{task}/checklists', [ChecklistController::class, 'store']);
        Route::apiResource('checklists', ChecklistController::class)->only(['update', 'destroy']);
        Route::post('checklists/{checklist}/items', [ChecklistController::class, 'addItem']);
        Route::apiResource('checklist-items', ChecklistController::class)->only(['update', 'destroy'])->parameters(['checklist-items' => 'item']);

        Route::get('tasks/{task}/time-logs', [TimeLogController::class, 'index']);
        Route::post('tasks/{task}/time-logs', [TimeLogController::class, 'store']);
        Route::apiResource('time-logs', TimeLogController::class)->only(['destroy']);

        // AI
        Route::post('ai/generate-description', [AIController::class, 'generateDescription']);
        Route::post('ai/suggest-subtasks', [AIController::class, 'suggestSubtasks']);

        // Reports
        Route::get('projects/{project}/reports/overview', [ReportController::class, 'overview']);
        Route::get('projects/{project}/reports/velocity', [ReportController::class, 'velocity']);
        Route::get('projects/{project}/reports/export', [ReportController::class, 'export']);
        Route::get('sprints/{sprint}/reports/burndown', [ReportController::class, 'burndown']);
        Route::get('workspaces/{workspace}/reports/workload', [ReportController::class, 'workload']);

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'readAll']);

        // Calendar
        Route::get('calendar/events', [CalendarController::class, 'events']);
        Route::post('calendar/events', [CalendarController::class, 'storeMeeting']);
        Route::delete('calendar/events/{meeting}', [CalendarController::class, 'destroyMeeting']);
        Route::post('calendar/holidays', [CalendarController::class, 'storeHoliday']);
        Route::delete('calendar/holidays/{holiday}', [CalendarController::class, 'destroyHoliday']);

        // Attendance
        Route::get('attendance', [AttendanceController::class, 'index']);
        Route::get('attendance/export', [AttendanceController::class, 'export']);
        Route::get('attendance/status', [AttendanceController::class, 'status']);
        Route::post('attendance/check-in', [AttendanceController::class, 'checkIn']);
        Route::post('attendance/check-out', [AttendanceController::class, 'checkOut']);

        // Leaves
        Route::get('leaves', [LeaveController::class, 'index']);
        Route::post('leaves', [LeaveController::class, 'store']);
        Route::get('leaves/stats', [LeaveController::class, 'stats']);
        Route::patch('leaves/{leave}', [LeaveController::class, 'update']);

        // Profile & Security
        Route::put('me/password', [AuthController::class, 'changePassword']);
        Route::post('me/avatar', [UserController::class, 'updateAvatar']);

        // Users & Team Management
        Route::apiResource('users', UserController::class);
    });
});
