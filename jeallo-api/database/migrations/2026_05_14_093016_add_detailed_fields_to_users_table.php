<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->decimal('salary', 15, 2)->nullable()->after('designation');
            $table->date('joining_date')->nullable()->after('salary');
            $table->text('address')->nullable()->after('joining_date');
            $table->json('emergency_contacts')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'salary', 'joining_date', 'address', 'emergency_contacts']);
        });
    }
};
