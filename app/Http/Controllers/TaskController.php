<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    // タスク一覧取得
    public function index(): JsonResponse
    {
        $tasks = Auth::user()->tasks;
        return response()->json($tasks);
    }

    // タスク詳細取得
    public function show(Task $task): JsonResponse
    {
      if ($task->user_id !== Auth::id()) {
          abort(404);
      }
      return response()->json($task);
    }

    // タスク作成
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $task = Auth::user()->tasks()->create($validated);

        return response()->json($task, 201);
    }

    // タスク更新
    public function update(Request $request, Task $task): JsonResponse
    {
       if ($task->user_id !== Auth::id()) {
          abort(404);
      }       
        $validated = $request->validate([
            'is_completed' => 'required|boolean',
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    // タスク削除
    public function destroy(Task $task): JsonResponse
    {
      if ($task->user_id !== Auth::id()) {
          abort(404);
      }        
        $task->delete();

        return response()->json(null, 204);
    }
}