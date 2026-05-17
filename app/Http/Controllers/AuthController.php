<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // 新規登録
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        Auth::login($user);

        return response()->json([
            'message' => '登録完了',
            'user'    => $user,
        ], 201);
    }

    // ログイン
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json([
                'message' => 'メールアドレスまたはパスワードが正しくありません',
            ], 401);
        }

        return response()->json([
            'message' => 'ログイン成功',
            'user'    => Auth::user(),
        ]);
    }

    // ログアウト
    public function logout(Request $request): JsonResponse
    {
        Auth::logout();

        $request->session()->invalidate();

        return response()->json([
            'message' => 'ログアウト完了',
        ]);
    }
}