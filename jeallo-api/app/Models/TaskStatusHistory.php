<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskStatusHistory extends Model
{
    protected $table = 'task_status_history';

    protected $fillable = [
        'task_id', 'changed_by', 'old_list_id', 'new_list_id', 
        'old_status', 'new_status'
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public function oldList(): BelongsTo
    {
        return $this->belongsTo(TaskList::class, 'old_list_id');
    }

    public function newList(): BelongsTo
    {
        return $this->belongsTo(TaskList::class, 'new_list_id');
    }
}
