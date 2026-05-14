<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Board extends Model
{
    protected $fillable = [
        'project_id', 'name', 'description', 'type', 
        'background_color', 'background_type', 'is_default'
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function lists(): HasMany
    {
        return $this->hasMany(TaskList::class, 'board_id')->orderBy('position');
    }

    public function sprints(): HasMany
    {
        return $this->hasMany(Sprint::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
