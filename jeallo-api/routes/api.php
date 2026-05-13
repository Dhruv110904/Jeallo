<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CalendarController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\TimeLogController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public auth routes
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('profile', [AuthController::class, 'updateProfile']);

        // Tasks
        Route::apiResource('tasks', TaskController::class);
        Route::post('tasks/{task}/assign', [TaskController::class, 'assign']);
        Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus']);
        Route::get('tasks/{task}/activity', [TaskController::class, 'activity']);
        Route::post('tasks/{task}/attachments', [TaskController::class, 'uploadAttachment']);
        Route::get('tasks/{task}/subtasks', [TaskController::class, 'subtasks']);

        // Comments
        Route::get('tasks/{task}/comments', [CommentController::class, 'index']);
        Route::post('tasks/{task}/comments', [CommentController::class, 'store']);
        Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

        // Time Logs
        Route::post('tasks/{task}/time-logs', [TimeLogController::class, 'store']);
        Route::get('tasks/{task}/time-logs', [TimeLogController::class, 'index']);

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::patch('notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'readAll']);

        // Calendar
        Route::get('calendar/events', [CalendarController::class, 'events']);

        // Manager / Super Admin only routes
        Route::middleware('role:manager|super_admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::post('users/invite', [UserController::class, 'invite']);
            Route::get('reports/overview', [ReportController::class, 'overview']);
            Route::get('reports/employee/{user}', [ReportController::class, 'employeeReport']);
            Route::get('reports/export', [ReportController::class, 'export']);
        });
    });
});
