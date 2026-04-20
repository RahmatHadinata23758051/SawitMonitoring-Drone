<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use Illuminate\Http\Request;

class MissionController extends Controller
{
    public function index()
    {
        $data = Mission::latest()->get();
        return response()->json($data);
    }

    public function show($id)
    {
        return response()->json(Mission::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'mission_name' => 'required|string|max:255',
            'drone_id' => 'nullable|exists:drones,id',
            'waypoints' => 'required|array|min:1',
            'path_data' => 'required|array|min:2',
        ], [
            'mission_name.required' => 'Misi wajib diisi.',
            'drone_id.exists' => 'Drone yang dipilih tidak valid.',
            'waypoints.required' => 'Waypoints wajib diisi.',
            'waypoints.array' => 'Waypoints tidak valid.',
            'path_data.required' => 'Path data wajib diisi.',
            'path_data.array' => 'Path data tidak valid.',
        ]);

        $post = Mission::create([
            'mission_name' => $validated['mission_name'],
            'drone_id' => $validated['drone_id'] ?? null,
            'nav_algorithm' => 'dead_reckoning',
            'scan_mode' => 'traditional',
            'waypoints' => $validated['waypoints'],
            'path_data' => $validated['path_data'],
            'status' => 'Saved'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Mission berhasil disimpan',
            'data' => $post
        ]);
    }
}
