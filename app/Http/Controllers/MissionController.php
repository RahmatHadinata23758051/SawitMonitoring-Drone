<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MissionController extends Controller
{
    // GET /missions → JSON untuk React GCS
    public function index()
    {
        $data = Mission::with('perangkat')->latest()->get();
        return response()->json($data);
    }

    public function show($id)
    {
        return response()->json(Mission::with('perangkat')->findOrFail($id));
    }

    // GET /laporan/log-penerbangan → Blade view
    public function logPenerbangan()
    {
        $missions = Mission::with('perangkat')
            ->latest()
            ->paginate(20);
        return view('pages.laporan.log-penerbangan', compact('missions'));
    }

    // POST /missions → dari React GCS
    public function store(Request $request)
    {
        $validated = $request->validate([
            'mission_name'   => 'required|string|max:255',
            'drone_id'       => 'nullable|string',
            'nav_algorithm'  => 'nullable|string',
            'scan_mode'      => 'nullable|string',
            'waypoints'      => 'required|array|min:1',
            'path_data'      => 'nullable|array',
            'config_data'    => 'nullable|array',
            'status'         => 'nullable|string|in:Saved,Completed,Failed',
            'samples_count'  => 'nullable|integer',
            'flight_time'    => 'nullable|integer',
        ]);

        $post = Mission::create([
            'mission_name'  => $validated['mission_name'],
            'perangkat_id'  => null,
            'nav_algorithm' => $validated['nav_algorithm'] ?? 'dead_reckoning',
            'scan_mode'     => $validated['scan_mode'] ?? 'traditional',
            'waypoints'     => $validated['waypoints'],
            'path_data'     => $validated['path_data'] ?? [],
            'config_data'   => $validated['config_data'] ?? null,
            'status'        => $validated['status'] ?? 'Saved',
        ]);

        try {
            activity()
                ->performedOn($post)
                ->event('create')
                ->causedBy(Auth::user())
                ->log('Misi GCS disimpan: ' . $post->mission_name . ' [' . strtoupper($post->scan_mode) . ']');
        } catch (\Exception $e) {
            \Log::warning('Activity log gagal untuk misi #' . $post->id . ': ' . $e->getMessage());
        }

        return response()->json([
            'status'  => true,
            'message' => 'Mission berhasil disimpan',
            'data'    => $post
        ]);
    }
}
