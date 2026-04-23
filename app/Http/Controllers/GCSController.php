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

            if ($response->successful()) {
                return response()->json($response->json() ?? [
                    'status'  => 'ok',
                    'command' => $command,
                    'source'  => 'drone-server',
                ]);
            }

            return response()->json([
                'status'  => 'error',
                'message' => 'Drone server responded with status ' . $response->status(),
                'command' => $command,
            ], 502);

        } catch (\Exception $e) {
            // Drone server tidak running / tidak bisa dijangkau
            return response()->json([
                'status'  => 'offline',
                'message' => 'Drone server tidak dapat dijangkau: ' . $e->getMessage(),
                'command' => $command,
            ], 200); // 200 agar React tidak throw, hanya log saja
        }
    }
}
