<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class LogAktivitasController extends Controller
{
    public function index()
    {
        $logs = Activity::latest()->paginate(10);

        return view('pages.log-aktivitas.index', compact('logs'));
    }
}
