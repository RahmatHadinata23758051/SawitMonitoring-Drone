<?php

namespace App\Http\Controllers;

use App\Models\SawitDataset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SawitDatasetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $dataset = SawitDataset::latest()->get();
        return view('pages.sawit-dataset.index', compact('dataset'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('pages.sawit-dataset.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|unique:sawit_datasets,kode',
            'nama' => 'required|string',
            'warna' => 'required|string',
        ], [
            'kode.required' => 'Kode wajib diisi.',
            'kode.unique' => 'Kode sudah terdaftar.',
            'nama.required' => 'Nama wajib diisi.',
            'warna.required' => 'Warna wajib diisi.',
        ]);

        $data = [
            'kode' => $validated['kode'],
            'nama_class' => strtolower($validated['nama']),
            'warna_buah' => $validated['warna'],
        ];

        $post = SawitDataset::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Dataset sawit baru ditambahkan: ' . $post->nama_class);

        return redirect()->route('sawit-dataset.index')->with('success', 'Dataset sawit berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(SawitDataset $sawitDataset)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SawitDataset $sawitDataset)
    {
        return view('pages.sawit-dataset.edit', compact('sawitDataset'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SawitDataset $sawitDataset)
    {
        $validated = $request->validate([
            'kode' => 'required|unique:sawit_datasets,kode,' . $sawitDataset->id,
            'nama' => 'required|string',
            'warna' => 'required|string',
        ], [
            'kode.required' => 'Kode wajib diisi.',
            'kode.unique' => 'Kode sudah terdaftar.',
            'nama.required' => 'Nama wajib diisi.',
            'warna.required' => 'Warna wajib diisi.',
        ]);

        $data = [
            'kode' => $validated['kode'],
            'nama_class' => strtolower($validated['nama']),
            'warna_buah' => $validated['warna'],
        ];

        $original = $sawitDataset->getOriginal();
        $sawitDataset->update($data);

        $changes = [];
        foreach ($data as $key => $value) {
            if (array_key_exists($key, $original) && $original[$key] !== $value) {
                $changes[$key] = [
                    'old' => $original[$key],
                    'new' => $value,
                ];
            }
        }

        activity()
            ->performedOn($sawitDataset)
            ->event('update')
            ->withProperties(['changes' => $changes])
            ->causedBy(Auth::user())
            ->log('Dataset sawit dengan ID ' . $sawitDataset->id . ' berhasil diupdate');

        return redirect()->route('sawit-dataset.index')->with('success', 'Dataset sawit berhasil diubah!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SawitDataset $sawitDataset)
    {
        $sawitDataset->delete();

        activity()
            ->performedOn($sawitDataset)
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Dataset sawit dihapus: ' . $sawitDataset->kode);

        return redirect()->route('sawit-dataset.index')->with('success', 'Dataset sawit berhasil dihapus!');
    }
}
