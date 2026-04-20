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
        $response = Http::post('http://127.0.0.1:3001/command', [
            'command' => $request->command
        ]);

        return $response->json();
    }
}
