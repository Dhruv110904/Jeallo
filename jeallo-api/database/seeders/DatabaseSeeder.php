<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskStatusHistory;
use App\Models\TaskTimeLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Permissions
        $permissions = [
            'create tasks', 'edit tasks', 'delete tasks', 'assign tasks',
            'view all tasks', 'view own tasks', 'update task status',
            'add comments', 'upload attachments', 'log time',
            'view reports', 'manage users', 'manage system',
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p]);
        }

        // Roles
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $superAdmin->syncPermissions($permissions);

        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->syncPermissions([
            'create tasks', 'edit tasks', 'delete tasks', 'assign tasks',
            'view all tasks', 'add comments', 'upload attachments', 'view reports',
        ]);

        $employee = Role::firstOrCreate(['name' => 'employee']);
        $employee->syncPermissions([
            'view own tasks', 'update task status', 'add comments',
            'upload attachments', 'log time',
        ]);

        // Super Admin
        $admin = User::firstOrCreate(['email' => 'admin@jeallo.app'], [
            'name' => 'Super Admin',
            'password' => Hash::make('password'),
            'department' => 'Management',
            'designation' => 'CTO',
            'is_active' => true,
        ]);
        $admin->assignRole('super_admin');

        // Managers
        $managerUsers = [];
        $managerData = [
            ['name' => 'Sarah Johnson', 'email' => 'sarah@jeallo.app', 'designation' => 'Project Manager', 'department' => 'Engineering'],
            ['name' => 'Michael Chen', 'email' => 'michael@jeallo.app', 'designation' => 'Product Manager', 'department' => 'Product'],
            ['name' => 'Priya Sharma', 'email' => 'priya@jeallo.app', 'designation' => 'Team Lead', 'department' => 'Design'],
        ];

        foreach ($managerData as $data) {
            $mgr = User::firstOrCreate(['email' => $data['email']], array_merge($data, [
                'password' => Hash::make('password'),
                'is_active' => true,
            ]));
            $mgr->assignRole('manager');
            $managerUsers[] = $mgr;
        }

        // Employees
        $employeeUsers = [];
        $employeeData = [
            ['name' => 'Ravi Kumar', 'email' => 'ravi@jeallo.app', 'designation' => 'Frontend Dev', 'department' => 'Engineering'],
            ['name' => 'Alice Wang', 'email' => 'alice@jeallo.app', 'designation' => 'Backend Dev', 'department' => 'Engineering'],
            ['name' => 'John Doe', 'email' => 'john@jeallo.app', 'designation' => 'UI Designer', 'department' => 'Design'],
            ['name' => 'Emma Garcia', 'email' => 'emma@jeallo.app', 'designation' => 'QA Engineer', 'department' => 'Engineering'],
            ['name' => 'David Kim', 'email' => 'david@jeallo.app', 'designation' => 'DevOps', 'department' => 'Infrastructure'],
            ['name' => 'Fatima Al-Hassan', 'email' => 'fatima@jeallo.app', 'designation' => 'Data Analyst', 'department' => 'Analytics'],
            ['name' => 'Lucas Oliveira', 'email' => 'lucas@jeallo.app', 'designation' => 'Mobile Dev', 'department' => 'Engineering'],
            ['name' => 'Zoe Williams', 'email' => 'zoe@jeallo.app', 'designation' => 'Scrum Master', 'department' => 'Management'],
            ['name' => 'Arjun Patel', 'email' => 'arjun@jeallo.app', 'designation' => 'Full Stack Dev', 'department' => 'Engineering'],
            ['name' => 'Nina Petrova', 'email' => 'nina@jeallo.app', 'designation' => 'UX Researcher', 'department' => 'Design'],
        ];

        foreach ($employeeData as $data) {
            $emp = User::firstOrCreate(['email' => $data['email']], array_merge($data, [
                'password' => Hash::make('password'),
                'is_active' => true,
            ]));
            $emp->assignRole('employee');
            $employeeUsers[] = $emp;
        }

        $allUsers = array_merge($managerUsers, $employeeUsers);
        $categories = ['Frontend', 'Backend', 'Design', 'DevOps', 'Research', 'Testing', 'Documentation', 'Mobile'];
        $statuses = ['todo', 'in_progress', 'in_review', 'done', 'cancelled'];
        $priorities = ['low', 'medium', 'high', 'critical'];

        $taskTitles = [
            'Implement user authentication', 'Design landing page mockups', 'Set up CI/CD pipeline',
            'Write unit tests for API', 'Optimize database queries', 'Create mobile responsive layout',
            'Integrate payment gateway', 'Set up monitoring and alerts', 'Conduct user research interviews',
            'Refactor legacy codebase', 'Build notification system', 'Deploy to staging environment',
            'Create API documentation', 'Fix login page bugs', 'Implement dark mode',
            'Set up error tracking', 'Performance audit', 'Accessibility review',
            'Database migration script', 'Onboarding flow redesign', 'Build admin dashboard',
            'Integrate analytics SDK', 'Security vulnerability assessment', 'Code review process',
            'Implement file upload', 'Search functionality', 'Email template design',
            'Load testing', 'Implement caching layer', 'Update dependencies',
            'Create design system', 'API rate limiting', 'Setup staging database',
            'Feature flag implementation', 'User profile settings', 'Notification preferences',
            'Export data feature', 'Calendar integration', 'Webhook implementation',
            'Audit log system', 'Role-based permissions', 'Multi-language support',
            'Image optimization', 'Video streaming setup', 'Push notifications',
            'OAuth2 integration', 'Two-factor authentication', 'Password reset flow',
            'Session management', 'CSV import feature', 'Advanced search filters',
            'Build reporting dashboard', 'Kanban board drag and drop', 'Time tracking widget',
            'Comment threading', 'Attachment preview', 'Task template system',
            'Batch task operations', 'Custom fields feature', 'Recurring tasks',
        ];

        // Create 60 tasks
        $tasks = [];
        $creatorUsers = array_merge([$admin], $managerUsers);

        foreach (array_slice($taskTitles, 0, 60) as $index => $title) {
            $creator = $creatorUsers[array_rand($creatorUsers)];
            $status = $statuses[array_rand($statuses)];
            $priority = $priorities[array_rand($priorities)];
            $category = $categories[array_rand($categories)];
            $daysOffset = rand(-15, 30);

            $task = Task::create([
                'title' => $title,
                'description' => 'Detailed description for: ' . $title . '. This task involves thorough analysis, design, implementation, and testing phases.',
                'status' => $status,
                'priority' => $priority,
                'category' => $category,
                'tags' => [$category, $priority, 'jeallo'],
                'due_date' => now()->addDays($daysOffset)->format('Y-m-d'),
                'estimated_hours' => rand(2, 40),
                'created_by' => $creator->id,
            ]);

            // Assign 2-5 random employees using shuffle
            $shuffled = $employeeUsers;
            shuffle($shuffled);
            $assignees = array_slice($shuffled, 0, rand(2, 5));
            $pivotData = [];
            foreach ($assignees as $emp) {
                $pivotData[$emp->id] = ['assigned_at' => now()->subDays(rand(0, 10))];
            }
            $task->assignees()->sync($pivotData);

            // Status history
            if ($status !== 'todo') {
                TaskStatusHistory::create([
                    'task_id' => $task->id,
                    'changed_by' => $creator->id,
                    'old_status' => 'todo',
                    'new_status' => $status,
                ]);
            }

            // Time log
            if (in_array($status, ['in_progress', 'done'])) {
                TaskTimeLog::create([
                    'task_id' => $task->id,
                    'user_id' => $assignees[0]->id,
                    'started_at' => now()->subDays(rand(1, 10))->subHours(rand(1, 5)),
                    'ended_at' => now()->subDays(rand(0, 1)),
                    'hours' => round(rand(1, 8) + rand(0, 9) / 10, 1),
                    'note' => 'Working on ' . strtolower($title),
                ]);
            }

            $tasks[] = $task;
        }

        // Create 100 comments spread across tasks
        $commentBodies = [
            'This looks good, let me review the PR.',
            'I\'ve started working on this, should be done by EOD.',
            'Can we discuss the approach before implementation?',
            'Blocked by dependency on the auth service.',
            'Updated the ticket with more details.',
            'This is a duplicate of another task.',
            'Need more context to proceed.',
            'Ready for review!',
            'Found a edge case we need to handle.',
            'Great work! Merging this.',
            'Let\'s schedule a quick sync on this.',
            'Added test coverage for the main scenarios.',
            'The staging deployment is ready for testing.',
            'Performance looks good after optimization.',
            'I\'ll take ownership of this task.',
        ];

        $commentCount = 0;
        foreach ($tasks as $task) {
            $numComments = rand(1, 4);
            for ($i = 0; $i < $numComments && $commentCount < 100; $i++) {
                $commenter = $allUsers[array_rand($allUsers)];
                TaskComment::create([
                    'task_id' => $task->id,
                    'user_id' => $commenter->id,
                    'body' => $commentBodies[array_rand($commentBodies)],
                    'parent_id' => null,
                ]);
                $commentCount++;
            }
        }

        $this->command->info('✅ Jeallo seeded successfully!');
        $this->command->info('   Super Admin: admin@jeallo.app / password');
        $this->command->info('   Managers: sarah@jeallo.app, michael@jeallo.app, priya@jeallo.app / password');
        $this->command->info('   Employees: ravi@jeallo.app, alice@jeallo.app, ... / password');
    }
}
