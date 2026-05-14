<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $leaves = Leave::where('user_id', $user->id)
            ->with('approver')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($leaves);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:casual,sick,annual,unpaid,other',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|min:10',
        ]);

        $user = $request->user();
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $days = $startDate->diffInDays($endDate) + 1;

        if ($request->type !== 'unpaid' && $user->leave_balance < $days) {
            return response()->json(['message' => 'Insufficient leave balance.'], 422);
        }

        $leave = Leave::create([
            'user_id' => $user->id,
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'days' => $days,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Leave application submitted successfully.',
            'leave' => $leave
        ]);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'leave_balance' => $user->leave_balance,
            'total_applied' => Leave::where('user_id', $user->id)->count(),
            'approved' => Leave::where('user_id', $user->id)->where('status', 'approved')->count(),
            'pending' => Leave::where('user_id', $user->id)->where('status', 'pending')->count(),
        ]);
    }
}
