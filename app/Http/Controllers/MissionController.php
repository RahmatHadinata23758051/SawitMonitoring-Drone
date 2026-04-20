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
            'mission_name'  => 'required|string|max:255',
            'drone_id'      => 'nullable|string',
            'nav_algorithm' => 'nullable|string',
            'scan_mode'     => 'nullable|string',
            'waypoints'     => 'required|array|min:1',
            'path_data'     => 'nullable|array',
            'config_data'   => 'nullable|array',
        ]);

        $post = Mission::create([
            'mission_name'  => $validated['mission_name'],
            'drone_id'      => $validated['drone_id'] ?? null,
            'nav_algorithm' => $validated['nav_algorithm'] ?? 'dead_reckoning',
            'scan_mode'     => $validated['scan_mode'] ?? 'traditional',
            'waypoints'     => $validated['waypoints'],
            'path_data'     => $validated['path_data'] ?? [],
            'status'        => 'Saved'
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Mission berhasil disimpan',
            'data'    => $post
        ]);
    }
}
