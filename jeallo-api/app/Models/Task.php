<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Task extends Model implements HasMedia
{
    use SoftDeletes, HasFactory, LogsActivity, InteractsWithMedia;

    protected $fillable = [
        'project_id', 'board_id', 'list_id', 'sprint_id', 'epic_id', 
        'parent_task_id', 'title', 'description', 'type', 'status', 
        'priority', 'story_points', 'estimated_hours', 'logged_hours', 
        'due_date', 'start_date', 'position', 'cover_color', 
        'cover_image', 'is_archived', 'created_by', 'reporter_id'
    ];

    protected $casts = [
        'due_date' => 'date',
        'start_date' => 'date',
        'is_archived' => 'boolean',
        'logged_hours' => 'decimal:2',
        'estimated_hours' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'status', 'priority', 'list_id', 'sprint_id', 'assignees'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function list(): BelongsTo
    {
        return $this->belongsTo(TaskList::class, 'list_id');
    }

    public function sprint(): BelongsTo
    {
        return $this->belongsTo(Sprint::class);
    }

    public function epic(): BelongsTo
    {
        return $this->belongsTo(Epic::class);
    }

    public function parentTask(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_user')
            ->withPivot('assigned_at');
    }

    public function watchers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_watchers');
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class, 'task_labels');
    }

    public function outgoingLinks(): HasMany
    {
        return $this->hasMany(TaskLink::class, 'source_task_id');
    }

    public function incomingLinks(): HasMany
    {
        return $this->hasMany(TaskLink::class, 'target_task_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    public function timeLogs(): HasMany
    {
        return $this->hasMany(TaskTimeLog::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(TaskStatusHistory::class);
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(Checklist::class);
    }

    public function customFieldValues(): HasMany
    {
        return $this->hasMany(TaskCustomFieldValue::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments');
    }

    // Scopes
    public function scopeForBoard($query, $boardId)
    {
        return $query->where('board_id', $boardId);
    }

    public function scopeForSprint($query, $sprintId)
    {
        return $query->where('sprint_id', $sprintId);
    }

    public function scopeBacklog($query)
    {
        return $query->whereNull('sprint_id')->where('is_archived', false);
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->whereNotIn(\Illuminate\Support\Facades\DB::raw('LOWER(status)'), ['done', 'complete', 'completed', 'comlete', 'finished']);
    }

    public function getProgressAttribute(): float
    {
        $items = ChecklistItem::whereIn('checklist_id', $this->checklists()->pluck('id'))->get();
        if ($items->isEmpty()) return 0;
        
        $completed = $items->where('is_completed', true)->count();
        return round(($completed / $items->count()) * 100, 2);
    }
}
