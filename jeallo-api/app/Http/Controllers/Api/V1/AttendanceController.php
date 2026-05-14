<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $attendances = Attendance::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->paginate(30);

        return response()->json($attendances);
    }

    public function status(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        return response()->json([
            'attendance' => $attendance,
            'is_checked_in' => $attendance && $attendance->check_in && !$attendance->check_out,
            'is_checked_out' => $attendance && $attendance->check_out,
        ]);
    }

    public function checkIn(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();

        $attendance = Attendance::firstOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            ['check_in' => $now->toTimeString(), 'status' => 'present']
        );

        if ($attendance->check_in && $attendance->created_at->diffInSeconds($now) > 1) {
             return response()->json(['message' => 'Already checked in for today.'], 422);
        }

        return response()->json([
            'message' => 'Checked in successfully.',
            'attendance' => $attendance
        ]);
    }

    public function checkOut(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (!$attendance || !$attendance->check_in) {
            return response()->json(['message' => 'You must check in first.'], 422);
        }

        if ($attendance->check_out) {
            return response()->json(['message' => 'Already checked out for today.'], 422);
        }

        $checkIn = Carbon::createFromFormat('H:i:s', $attendance->check_in);
        $workingHours = $checkIn->diffInMinutes($now) / 60;

        $attendance->update([
            'check_out' => $now->toTimeString(),
            'working_hours' => round($workingHours, 2)
        ]);

        return response()->json([
            'message' => 'Checked out successfully.',
            'attendance' => $attendance
        ]);
    }
}
