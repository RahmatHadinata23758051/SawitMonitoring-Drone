<?php

namespace App\Http\Controllers;

use App\Models\Cuaca;
use App\Models\Kebun;
use App\Models\Lahan;
use App\Models\Perangkat;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $countLahan = Lahan::count();
        $countKebun = Kebun::count();
        $countPerangkat = Perangkat::count();
        $countUser = User::count();
        $countPohon = Kebun::sum('jumlah_pohon');
        $countPohonMatang = Kebun::sum('jumlah_pohon_matang');
        $countPohonBelumMatang = Kebun::sum('jumlah_pohon_belum_matang');
        $lahan = Lahan::with('kebun')->get();
        $cuaca = Cuaca::first();
        $kebun = Kebun::query()
            ->withSum('panen as target', 'target_panen')
            ->withSum('panen as hasil', 'hasil_panen')
            ->get(['id', 'nama', 'jumlah_pohon_matang', 'jumlah_pohon_belum_matang']);

        return view('dashboard', compact('countLahan', 'countKebun', 'countPerangkat', 'countUser', 'countPohon', 'countPohonMatang', 'countPohonBelumMatang', 'lahan', 'cuaca', 'kebun'));
    }
}
