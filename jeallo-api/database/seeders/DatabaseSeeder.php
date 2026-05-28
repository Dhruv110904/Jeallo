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
            'name' => 'Dhruv Jain',
            'email' => 'admin@jeallo.com',
            'employee_id' => '98342',
            'role' => 'super_admin',
            'password' => Hash::make('Dj@629409'),
            'designation' => 'Super Admin',
            'is_active' => true,
        ]);
        $admin->assignRole($adminRole);

    }
}
