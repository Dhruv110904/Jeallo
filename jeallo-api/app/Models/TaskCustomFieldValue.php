<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskCustomFieldValue extends Model
{
    protected $fillable = ['task_id', 'field_key', 'field_value'];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
