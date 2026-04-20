<?php

namespace App\Http\Controllers;

use App\Models\Kebun;
use App\Models\Panen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PanenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $panen = Panen::with('kebun')->latest()->paginate(10);
        return view('pages.panen.index', compact('panen'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $kebun = Kebun::select('id', 'nama')->get();
        return view('pages.panen.create', compact('kebun'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal_panen' => 'required|date',
            'kebun' => 'required|integer|exists:kebuns,id',
            'target_panen' => 'required|decimal:0,2',
            'hasil_panen' => 'required|decimal:0,2',
        ], [
            'tanggal_panen.required' => 'Tanggal panen wajib diisi.',
            'tanggal_panen.date' => 'Tanggal panen harus berupa tanggal yang valid.',
            'kebun.required' => 'Kebun wajib diisi.',
            'kebun.integer' => 'Kebun tidak valid.',
            'kebun.exists' => 'Kebun tidak ditemukan.',
            'target_panen.required' => 'Target panen wajib diisi.',
            'target_panen.decimal' => 'Target panen tidak valid.',
            'hasil_panen.required' => 'Hasil panen wajib diisi.',
            'hasil_panen.decimal' => 'Hasil panen tidak valid.',
        ]);

        $data = [
            'tanggal_panen' => $validated['tanggal_panen'],
            'kebun_id' => $validated['kebun'],
            'target_panen' => $validated['target_panen'],
            'hasil_panen' => $validated['hasil_panen'],
        ];

        $post = Panen::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Panen baru ditambahkan: ' . $post->tanggal_panen . ' - ' . $post->kebun->nama);

        return redirect()->route('panen.index')->with('success', 'Data panen berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Panen $panen)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Panen $panen)
    {
        $kebun = Kebun::select('id', 'nama')->get();
        return view('pages.panen.edit', compact('panen', 'kebun'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Panen $panen)
    {
        $validated = $request->validate([
            'tanggal_panen' => 'required|date',
            'kebun' => 'required|integer|exists:kebuns,id',
            'target_panen' => 'required|decimal:0,2',
            'hasil_panen' => 'required|decimal:0,2',
        ], [
            'tanggal_panen.required' => 'Tanggal panen wajib diisi.',
            'tanggal_panen.date' => 'Tanggal panen harus berupa tanggal yang valid.',
            'kebun.required' => 'Kebun wajib diisi.',
            'kebun.integer' => 'Kebun tidak valid.',
            'kebun.exists' => 'Kebun tidak ditemukan.',
            'target_panen.required' => 'Target panen wajib diisi.',
            'target_panen.decimal' => 'Target panen tidak valid.',
            'hasil_panen.required' => 'Hasil panen wajib diisi.',
            'hasil_panen.decimal' => 'Hasil panen tidak valid.',
        ]);

        $data = [
            'tanggal_panen' => $validated['tanggal_panen'],
            'kebun_id' => $validated['kebun'],
            'target_panen' => $validated['target_panen'],
            'hasil_panen' => $validated['hasil_panen'],
        ];

        $original = $panen->getOriginal();
        $panen->update($data);

        $changes = [];

        foreach ($data as $key => $value) {
            if (array_key_exists($key, $original) &&  $original[$key] !== $value) {
                $changes[$key] = [
                    'old' => $original[$key],
                    'new' => $value,
                ];
            }
        }

        activity()
            ->performedOn($panen)
            ->event('update')
            ->withProperties(['changes' => $changes])
            ->causedBy(Auth::user())
            ->log('Panen dengan ID ' . $panen->id . ' berhasil diupdate');

        return redirect()->route('panen.index')->with('success', 'Data panen berhasil diubah!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Panen $panen)
    {
        $panen->delete();

        activity()
            ->performedOn($panen)
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Panen dihapus: ' . $panen->tanggal_panen . ' - ' . $panen->kebun->nama);

        return redirect()->route('panen.index')->with('success', 'Data panen berhasil dihapus!');
    }
}
