<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'department' => $this->department,
            'designation' => $this->designation,
            'role' => $this->role,
            'salary' => $this->salary,
            'joining_date' => $this->joining_date?->format('Y-m-d'),
            'address' => $this->address,
            'emergency_contacts' => $this->emergency_contacts,
            'is_active' => $this->is_active,
            'roles' => $this->whenLoaded('roles', fn() => $this->roles->pluck('name')),
            'permissions' => $this->whenLoaded('permissions', fn() => $this->getAllPermissions()->pluck('name')),
            'created_at' => $this->created_at,
        ];
    }
}
