<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    public function generateDescription(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'type' => 'required|string',
        ]);

        $apiKey = config('services.anthropic.key');
        if (!$apiKey) {
            return response()->json(['message' => 'AI Service not configured'], 500);
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-sonnet-20240229',
                'max_tokens' => 1024,
                'messages' => [
                    [
                        'role' => 'user', 
                        'content' => "Generate a clear, professional task description for a task management system. Task title: {$request->title}. Task type: {$request->type}. Write 2-3 sentences describing what needs to be done, acceptance criteria, and any important notes. Be concise and professional. Return only the description text."
                    ]
                ],
            ]);

            if ($response->failed()) {
                Log::error('AI API Error', ['response' => $response->json()]);
                return response()->json(['message' => 'Failed to generate description'], 502);
            }

            $description = $response->json()['content'][0]['text'] ?? '';

            return response()->json(['description' => trim($description)]);
        } catch (\Exception $e) {
            Log::error('AI Exception', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'An error occurred'], 500);
        }
    }

    public function suggestSubtasks(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $apiKey = config('services.anthropic.key');
        if (!$apiKey) {
            return response()->json(['message' => 'AI Service not configured'], 500);
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-3-sonnet-20240229',
                'max_tokens' => 1024,
                'messages' => [
                    [
                        'role' => 'user', 
                        'content' => "Given this task: {$request->title} — {$request->description}. Suggest 3-6 specific subtasks needed to complete it. Return ONLY a JSON array of strings, each string being a subtask title. Example: [\"Research requirements\", \"Create wireframes\", \"Implement feature\"]"
                    ]
                ],
            ]);

            $text = $response->json()['content'][0]['text'] ?? '[]';
            // Extract JSON if AI wrapped it in markdown
            if (preg_match('/\[.*\]/s', $text, $matches)) {
                $text = $matches[0];
            }

            return response()->json(['subtasks' => json_decode($text, true)]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred'], 500);
        }
    }
}
