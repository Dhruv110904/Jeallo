<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Checklist extends Model
{
    protected $fillable = ['task_id', 'title', 'position'];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ChecklistItem::class)->orderBy('position');
    }

    public function getCompletionPercentageAttribute(): float
    {
        $total = $this->items()->count();
        if ($total === 0) return 0;
        
        $completed = $this->items()->where('is_completed', true)->count();
        return round(($completed / $total) * 100, 2);
    }
}
