<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskList extends Model
{
    protected $table = 'lists';
    
    protected $fillable = [
        'board_id', 'name', 'color', 'position', 'is_done_list', 'wip_limit'
    ];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'list_id')->orderBy('position');
    }

    public function getActiveTasks()
    {
        return $this->tasks()->where('is_archived', false)->get();
    }
}
