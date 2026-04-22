<?php

namespace App\Http\Controllers;

use App\Models\FlightLog;
use App\Models\LaporanPrediksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LaporanController extends Controller
{
    public function index()
    {
        $laporan = LaporanPrediksi::latest()->get();
        $flightLogs = FlightLog::with('mission')->latest()->limit(5)->get();
        $flightLogSummary = FlightLog::query()
            ->selectRaw('COALESCE(SUM(samples_count), 0) as total_sampel')
            ->selectRaw('COALESCE(SUM(matang), 0) as total_matang')
            ->selectRaw('COALESCE(SUM(belum_matang), 0) as total_belum')
            ->selectRaw('COALESCE(AVG(accuracy), 0) as avg_accuracy')
            ->first();

        return view('pages.laporan.index', compact('laporan', 'flightLogs', 'flightLogSummary'));
    }

    public function sendSample(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan'
            ], 422);
        }

        $file = $request->file('file');

        // Kirim ke FastAPI sebagai multipart
        $response = Http::attach(
            'file',
            file_get_contents($file->getRealPath()),
            $file->getClientOriginalName()
        )->post('http://127.0.0.1:8001/predict');

        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal terhubung dengan model AI',
                'response' => $response->body(),
            ], 500);
        }

        $aiResult = $response->json();

        $status = $aiResult['prediction'] ?? null;
        $confidence = $aiResult['confidence'] ?? null;
        $captured_at = $aiResult['captured_at'] ?? now();

        if (!$status || is_null($confidence)) {
            return response()->json([
                'success' => false,
                'message' => 'Format response AI tidak valid'
            ], 500);
        }

        $analisa = $status === 'Matang'
            ? 'Pohon sawit terdeteksi matang.'
            : 'Pohon sawit terdeteksi belum matang.';

        $prediction = LaporanPrediksi::create([
            'status'        => $status,
            'confidence'    => $confidence,
            'analisa'       => $analisa,
            'raw_response'  => $aiResult,
            'attachment'    => null,
            'captured_at'   => $captured_at,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id'         => $prediction->id,
                'sampel_ke'  => $prediction->sampel_ke,
                'status'     => $prediction->status,
                'confidence' => $prediction->confidence,
            ]
        ]);
    }
}
