<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'string', 'in:Manager,Employee'], // For now, only allow these roles for public signup
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'is_active' => true,
            ]);

            $role = Role::where('name', $request->role)->first();
            if ($role) {
                $user->assignRole($role);
            }

            $token = $user->createToken('api')->plainTextToken;

            // Generate OTP for email verification
            $otp = rand(100000, 999999);
            Cache::put('otp_' . $user->email, $otp, now()->addMinutes(10));

            return response()->json([
                'user' => new UserResource($user->load('roles')),
                'token' => $token,
                'message' => 'Registration successful. Please verify your email with the OTP sent.',
                'otp_debug' => $otp, // FOR DEV ONLY
            ], 201);
        });
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|numeric',
        ]);

        $cachedOtp = Cache::get('otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->markEmailAsVerified();
        Cache::forget('otp_' . $request->email);

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => new UserResource($user->load('roles')),
        ]);
    }
}
