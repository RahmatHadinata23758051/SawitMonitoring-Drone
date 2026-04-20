<?php

namespace App\Http\Controllers;

use App\Models\FlightLog;
use App\Models\Mission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * FlightLogController — BL-09
 * Menangani persistensi log penerbangan dari React GCS ke database.
 */
class FlightLogController extends Controller
{
    /**
     * GET /api/flight-logs
     * Ambil semua log penerbangan (terbaru di atas) → JSON untuk GCS React
     */
    public function index()
    {
        $logs = FlightLog::with(['mission', 'perangkat'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn ($log) => [
                'id'           => 'LOG-' . $log->id,
                'date'         => $log->created_at->format('d/m/Y H:i:s'),
                'name'         => $log->mission_name,
                'nav'          => $log->nav_algorithm ?? 'hybrid',
                'scan'         => $log->scan_mode ?? 'traditional',
                'flightTime'   => $log->flight_time_seconds,
                'samples'      => $log->samples_count,
                'matang'       => $log->matang,
                'belumMatang'  => $log->belum_matang,
                'batteryUsed'  => (float) $log->battery_used,
                'accuracy'     => (float) $log->accuracy,
            ]);

        return response()->json($logs);
    }

    /**
     * POST /api/flight-logs
     * Dipanggil dari React GCS saat drone LANDING (newAlt <= 0)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'mission_name'        => 'required|string|max:255',
            'mission_id'          => 'nullable|integer|exists:missions,id',
            'nav_algorithm'       => 'nullable|string|in:dead_reckoning,live_reckoning,hybrid',
            'scan_mode'           => 'nullable|string|in:traditional,qlv',
            'flight_time_seconds' => 'required|integer|min:0',
            'battery_used'        => 'required|numeric|min:0',
            'samples_count'       => 'required|integer|min:0',
            'matang'              => 'required|integer|min:0',
            'belum_matang'        => 'required|integer|min:0',
            'accuracy'            => 'required|numeric|min:0|max:100',
            'config_data'         => 'nullable|array',
        ]);

        // Generate kode log unik: LOG-YYYYMMDD-HHMM-RAND
        $logCode = 'LOG-' . date('Ymd-Hi') . '-' . strtoupper(substr(uniqid(), -4));

        $log = FlightLog::create([
            'log_code'            => $logCode,
            'mission_id'          => $validated['mission_id'] ?? null,
            'mission_name'        => $validated['mission_name'],
            'nav_algorithm'       => $validated['nav_algorithm'] ?? 'hybrid',
            'scan_mode'           => $validated['scan_mode'] ?? 'traditional',
            'flight_time_seconds' => $validated['flight_time_seconds'],
            'battery_used'        => $validated['battery_used'],
            'samples_count'       => $validated['samples_count'],
            'matang'              => $validated['matang'],
            'belum_matang'        => $validated['belum_matang'],
            'accuracy'            => $validated['accuracy'],
            'config_data'         => $validated['config_data'] ?? null,
            'status'              => 'completed',
        ]);

        // Activity log
        try {
            activity()
                ->performedOn($log)
                ->event('create')
                ->causedBy(Auth::user())
                ->log("Log penerbangan tercatat otomatis: {$log->mission_name} [{$log->log_code}] — {$log->samples_count} sampel, akurasi {$log->accuracy}%");
        } catch (\Exception $e) {
            Log::warning('Activity log gagal untuk FlightLog #' . $log->id . ': ' . $e->getMessage());
        }

        return response()->json([
            'status'  => true,
            'message' => 'Log penerbangan berhasil disimpan',
            'data'    => [
                'id'       => 'LOG-' . $log->id,
                'log_code' => $log->log_code,
                'date'     => $log->created_at->format('d/m/Y H:i:s'),
            ],
        ], 201);
    }

    /**
     * GET /laporan/log-penerbangan (Blade view — BL-09 final)
     * Tampilkan flight_logs dari DB (bukan missions)
     */
    public function logPenerbangan()
    {
        $flightLogs = FlightLog::with(['mission', 'perangkat'])
            ->latest()
            ->paginate(20);

        // Aggregate stats
        $totalSamples   = FlightLog::sum('samples_count');
        $totalMatang    = FlightLog::sum('matang');
        $totalBelum     = FlightLog::sum('belum_matang');
        $avgAccuracy    = FlightLog::avg('accuracy');
        $countQlv       = FlightLog::where('scan_mode', 'qlv')->count();
        $countTrad      = FlightLog::where('scan_mode', 'traditional')->count();
        $countCompleted = FlightLog::where('status', 'completed')->count();

        return view('pages.laporan.log-penerbangan', compact(
            'flightLogs',
            'totalSamples', 'totalMatang', 'totalBelum', 'avgAccuracy',
            'countQlv', 'countTrad', 'countCompleted',
        ));
    }
}
