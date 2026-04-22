<?php

namespace App\Http\Controllers;

use App\Models\Cuaca;
use App\Models\FlightLog;
use App\Models\Kebun;
use App\Models\Lahan;
use App\Models\Mission;
use App\Models\Perangkat;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $countLahan    = Lahan::count();
        $countKebun    = Kebun::count();
        $countPerangkat = Perangkat::count();
        $countUser     = User::count();
        $countPohon    = Kebun::sum('jumlah_pohon');
        $lahan = Lahan::with('kebun')->get();
        $cuaca = Cuaca::first();

        $flightSummary = FlightLog::query()
            ->selectRaw('COALESCE(SUM(samples_count), 0) as total_sampel')
            ->selectRaw('COALESCE(SUM(matang), 0) as total_matang')
            ->selectRaw('COALESCE(SUM(belum_matang), 0) as total_belum')
            ->selectRaw('COALESCE(AVG(accuracy), 0) as avg_accuracy')
            ->first();

        // Flight & Mission Stats (BL-06)
        $countMissions   = Mission::count();
        $countFlightLogs = FlightLog::count();
        $totalSampel     = (int) ($flightSummary->total_sampel ?? 0);
        $totalMatang     = (int) ($flightSummary->total_matang ?? 0);
        $totalBelum      = (int) ($flightSummary->total_belum ?? 0);
        $avgAccuracy     = (float) ($flightSummary->avg_accuracy ?? 0);
        $countPohonMatang      = $totalMatang;
        $countPohonBelumMatang = $totalBelum;
        $recentFlights   = FlightLog::latest()->limit(5)->get();

        return view('dashboard', compact(
            'countLahan', 'countKebun', 'countPerangkat', 'countUser',
            'countPohon', 'countPohonMatang', 'countPohonBelumMatang',
            'lahan', 'cuaca',
            'countMissions', 'countFlightLogs', 'totalSampel', 'totalMatang', 'totalBelum',
            'avgAccuracy', 'recentFlights'
        ));
    }
}
