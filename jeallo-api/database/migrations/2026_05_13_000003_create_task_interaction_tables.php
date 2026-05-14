<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('target_task_id')->constrained('tasks')->onDelete('cascade');
            $table->enum('link_type', ['blocks', 'is_blocked_by', 'relates_to', 'duplicates', 'is_duplicated_by', 'clones']);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('body');
            $table->foreignId('parent_id')->nullable()->constrained('task_comments')->onDelete('cascade');
            $table->boolean('is_edited')->default(false);
            $table->timestamps();
        });

        Schema::create('task_time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->datetime('started_at');
            $table->datetime('ended_at')->nullable();
            $table->decimal('hours', 8, 2);
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('task_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->foreignId('changed_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('old_list_id')->nullable()->constrained('lists')->onDelete('set null');
            $table->foreignId('new_list_id')->nullable()->constrained('lists')->onDelete('set null');
            $table->string('old_status');
            $table->string('new_status');
            $table->timestamps();
        });

        Schema::create('task_custom_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->string('field_key');
            $table->text('field_value');
            $table->timestamps();
        });

        Schema::create('checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->integer('position')->default(0);
            $table->timestamps();
        });

        Schema::create('checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checklist_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->boolean('is_completed')->default(false);
            $table->integer('position')->default(0);
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->date('due_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_items');
        Schema::dropIfExists('checklists');
        Schema::dropIfExists('task_custom_field_values');
        Schema::dropIfExists('task_status_history');
        Schema::dropIfExists('task_time_logs');
        Schema::dropIfExists('task_comments');
        Schema::dropIfExists('task_links');
    }
};
