<?php

namespace App\Http\Controllers;

use App\Models\Perangkat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GCSController extends Controller
{
    private function getDroneServerUrl()
    {
        return env('DRONE_SERVER_URL', 'http://127.0.0.1:3001');
    }

    public function index()
    {
        $drone = Perangkat::latest()->get();
        return view('pages.gcs.index', compact('drone'));
    }

    public function control(Request $request)
    {
        $command = $request->input('command', 'unknown');
        $baseUrl = $this->getDroneServerUrl();

        try {
            $response = Http::timeout(3)->post("{$baseUrl}/command", [
                'command' => $command,
            ]);

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
        $baseUrl = $this->getDroneServerUrl();

        if (!$sequence || !is_array($sequence)) {
            return response()->json(['error' => 'Invalid sequence payload.'], 400);
        }

        try {
            $response = Http::timeout(5)->post("{$baseUrl}/execute-sequence", [
                'sequence' => $sequence,
            ]);

            return response()->json($response->json(), $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Drone server tidak dapat dijangkau: ' . $e->getMessage(),
            ], 503);
        }
    }

    public function setProfile(Request $request)
    {
        $profile = $request->input('profile', 'd16');
        $host = $request->input('host');
        $port = $request->input('port');
        $baseUrl = $this->getDroneServerUrl();

        try {
            $response = Http::timeout(3)->post("{$baseUrl}/profile", [
                'profile' => $profile,
                'host' => $host,
                'port' => $port,
            ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'offline',
                'message' => 'Drone server tidak dapat dijangkau: ' . $e->getMessage(),
            ], 503);
        }
    }

    public function getProfile()
    {
        $baseUrl = $this->getDroneServerUrl();
        try {
            $response = Http::timeout(3)->get("{$baseUrl}/profile");
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'offline',
                'message' => 'Drone server tidak dapat dijangkau: ' . $e->getMessage(),
            ], 503);
        }
    }

    public function setCameraConfig(Request $request)
    {
        $protocol = $request->input('protocol');
        $port = $request->input('port');
        $baudRate = $request->input('baudRate');
        $resolution = $request->input('resolution');
        $baseUrl = $this->getDroneServerUrl();

        try {
            $response = Http::timeout(3)->post("{$baseUrl}/camera/config", [
                'protocol' => $protocol,
                'port' => $port,
                'baudRate' => $baudRate,
                'resolution' => $resolution,
            ]);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'offline',
                'message' => 'Drone server tidak dapat dijangkau: ' . $e->getMessage(),
            ], 503);
        }
    }

    public function getCameraConfig()
    {
        $baseUrl = $this->getDroneServerUrl();
        try {
            $response = Http::timeout(3)->get("{$baseUrl}/camera/config");
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'offline',
                'message' => 'Drone server tidak dapat dijangkau: ' . $e->getMessage(),
            ], 503);
        }
    }
}
