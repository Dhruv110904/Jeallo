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
        $query = Leave::query();
        
        if ($user->role === 'admin' || $user->role === 'super_admin') {
            $query->with(['user', 'approver']);
        } else {
            $query->where('user_id', $user->id)->with('approver');
        }

        $leaves = $query->orderBy('created_at', 'desc')
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

        if ($user->role === 'admin' || $user->role === 'super_admin') {
            return response()->json([
                'leave_balance' => 0,
                'total_applied' => Leave::count(),
                'approved' => Leave::where('status', 'approved')->count(),
                'pending' => Leave::where('status', 'pending')->count(),
                'rejected' => Leave::where('status', 'rejected')->count(),
            ]);
        }

        return response()->json([
            'leave_balance' => $user->leave_balance,
            'total_applied' => Leave::where('user_id', $user->id)->count(),
            'approved' => Leave::where('user_id', $user->id)->where('status', 'approved')->count(),
            'pending' => Leave::where('user_id', $user->id)->where('status', 'pending')->count(),
            'rejected' => Leave::where('user_id', $user->id)->where('status', 'rejected')->count(),
        ]);
    }

    public function update(Request $request, Leave $leave)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_remark' => 'nullable|string|max:255',
        ]);

        if ($leave->status !== 'pending') {
            return response()->json(['message' => 'This leave request has already been processed.'], 422);
        }

        $employee = $leave->user;

        if ($request->status === 'approved') {
            if ($leave->type !== 'unpaid') {
                if ($employee->leave_balance < $leave->days) {
                    return response()->json(['message' => 'Employee has insufficient leave balance.'], 422);
                }
                $employee->decrement('leave_balance', $leave->days);
            }
        }

        $leave->update([
            'status' => $request->status,
            'approved_by' => $user->id,
            'admin_remark' => $request->admin_remark,
        ]);

        return response()->json([
            'message' => 'Leave request ' . $request->status . ' successfully.',
            'leave' => $leave->load(['user', 'approver'])
        ]);
    }
}
