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
        $query = Attendance::orderBy('date', 'desc');

        if (!in_array($user->role, ['admin', 'super_admin'])) {
            $query->where('user_id', $user->id);
        } else {
            $query->with('user');
        }

        $attendances = $query->paginate(30);

        return response()->json($attendances);
    }

    public function export(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="attendance-report-' . now()->format('Y-m-d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF");
            fputcsv($file, ['Employee Name', 'Email', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status']);

            $attendances = Attendance::with('user')->orderBy('date', 'desc')->get();

            foreach ($attendances as $row) {
                fputcsv($file, [
                    $row->user ? $row->user->name : 'N/A',
                    $row->user ? $row->user->email : 'N/A',
                    $row->date ? $row->date->format('Y-m-d') : 'N/A',
                    $row->check_in ?? '--:--',
                    $row->check_out ?? '--:--',
                    $row->working_hours ?? '0.00',
                    ucfirst($row->status)
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
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
