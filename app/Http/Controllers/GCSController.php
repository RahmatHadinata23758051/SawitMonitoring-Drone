<?php

namespace App\Http\Controllers;

use App\Models\Perangkat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GCSController extends Controller
{
    public function index()
    {
        $drone = Perangkat::latest()->get();
        return view('pages.gcs.index', compact('drone'));
    }

    public function control(Request $request)
    {
        $command = $request->input('command', 'unknown');

        try {
            $response = Http::timeout(3)->post('http://127.0.0.1:3001/command', [
                'command' => $command,
            ]);

            // Pass-through Node response (termasuk 400 unknown_command)
            return response()->json($response->json(), $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'offline',
                'message' => 'Drone server tidak dapat dijangkau: ' . $e->getMessage(),
                'command' => $command,
            ], 503);
        }
    }

    /**
     * Proxy POST /drone/execute-sequence → Node /execute-sequence
     */
    public function executeSequence(Request $request)
    {
        $sequence = $request->input('sequence');

        if (!$sequence || !is_array($sequence)) {
            return response()->json(['error' => 'Invalid sequence payload.'], 400);
        }

        try {
            $response = Http::timeout(5)->post('http://127.0.0.1:3001/execute-sequence', [
                'sequence' => $sequence,
            ]);

            return response()->json($response->json(), $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Drone server tidak dapat dijangkau: ' . $e->getMessage(),
            ], 503);
        }
    }
}
