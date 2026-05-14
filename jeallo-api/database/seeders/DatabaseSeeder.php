<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use App\Models\Project;
use App\Models\Board;
use App\Models\TaskList;
use App\Models\Task;
use App\Models\Attendance;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Create Roles
        $adminRole = Role::create(['name' => 'super_admin']);
        $managerRole = Role::create(['name' => 'manager']);
        $employeeRole = Role::create(['name' => 'employee']);

        // 1. Create Initial Admin
        $admin = User::create([
            'name' => 'jeallo admin',
            'email' => 'admin@jeallo.com',
            'employee_id' => '98342',
            'role' => 'super_admin',
            'password' => Hash::make('Dj@629409'),
            'designation' => 'Super Admin',
            'is_active' => true,
        ]);
        $admin->assignRole($adminRole);

        // 2. Create Mohan (Employee)
        $mohan = User::create([
            'name' => 'Mohan',
            'email' => 'mohan@jeallo.com',
            'employee_id' => '26075',
            'role' => 'employee',
            'password' => Hash::make('Jeallo@123'),
            'designation' => 'Junior Developer',
            'department' => 'Engineering',
            'joining_date' => '2026-05-01',
            'is_active' => true,
        ]);
        $mohan->assignRole($employeeRole);

        // 3. Seed Attendance for Mohan from May 1st to yesterday
        $startDate = Carbon::create(2026, 5, 1);
        $yesterday = Carbon::yesterday();

        while ($startDate->lte($yesterday)) {
            if (!$startDate->isWeekend()) {
                Attendance::create([
                    'user_id' => $mohan->id,
                    'date' => $startDate->toDateString(),
                    'check_in' => '09:00:00',
                    'check_out' => '18:15:00',
                    'working_hours' => 9.25,
                    'status' => 'present',
                ]);
            }
            $startDate->addDay();
        }

        // 4. Create a default workspace and project
        $workspace = Workspace::create([
            'name' => 'Main Workspace',
            'slug' => 'main-workspace',
            'description' => 'The primary workspace for Jeallo operations.',
            'owner_id' => $admin->id,
        ]);

        $workspace->users()->attach($admin->id, ['role' => 'owner', 'joined_at' => now()]);
        $workspace->users()->attach($mohan->id, ['role' => 'member', 'joined_at' => now()]);

        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name' => 'Jeallo Implementation',
            'slug' => 'jeallo-implementation',
            'description' => 'Tracking the development and implementation of the Jeallo platform.',
            'status' => 'active',
            'owner_id' => $admin->id,
        ]);

        $board = Board::create([
            'project_id' => $project->id,
            'name' => 'Development Board',
            'type' => 'kanban',
        ]);

        $todoList = TaskList::create(['board_id' => $board->id, 'name' => 'To Do', 'position' => 0]);
        $inProgressList = TaskList::create(['board_id' => $board->id, 'name' => 'In Progress', 'position' => 1]);
        $doneList = TaskList::create(['board_id' => $board->id, 'name' => 'Done', 'position' => 2]);

        $task = Task::create([
            'project_id' => $project->id,
            'board_id' => $board->id,
            'list_id' => $inProgressList->id,
            'title' => 'Update Profile UI',
            'description' => 'Enhance the profile page with new fields.',
            'status' => 'in_progress',
            'priority' => 'high',
            'created_by' => $admin->id,
        ]);
        
        $task->assignees()->attach($mohan->id);
    }
}
