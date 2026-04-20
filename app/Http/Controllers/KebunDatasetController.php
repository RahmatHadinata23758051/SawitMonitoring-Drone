<?php

namespace App\Http\Controllers;

use App\Models\Kebun;
use App\Models\KebunDataset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KebunDatasetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $dataset = KebunDataset::with('kebun')->latest()->get();
        return view('pages.kebun-dataset.index', compact('dataset'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $kebuns = Kebun::get(['id', 'nama']);
        return view('pages.kebun-dataset.create', compact('kebuns'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kebun' => 'required|exists:kebuns,id',
            'jumlah_pohon' => 'required|integer',
            'tinggi_pohon' => 'required|numeric',
            'interval_sejalur' => 'required|numeric',
            'interval_menyamping' => 'required|numeric',
        ], [
            'kebun.required' => 'Kebun wajib diisi.',
            'kebun.exists' => 'Kebun yang dipilih tidak valid.',
            'jumlah_pohon.required' => 'Jumlah pohon wajib diisi.',
            'jumlah_pohon.integer' => 'Jumlah pohon tidak valid.',
            'tinggi_pohon.required' => 'Tinggi pohon wajib diisi.',
            'tinggi_pohon.numeric' => 'Tinggi pohon tidak valid.',
            'interval_sejalur.required' => 'Interval pohon sejalur wajib diisi.',
            'interval_sejalur.numeric' => 'Interval pohon sejalur tidak valid.',
            'interval_menyamping.required' => 'Interval pohon menyamping wajib diisi.',
            'interval_menyamping.numeric' => 'Interval pohon menyamping tidak valid.',
        ]);

        $data = [
            'kebun_id' => $validated['kebun'],
            'jumlah_pohon' => $validated['jumlah_pohon'],
            'tinggi_pohon' => $validated['tinggi_pohon'],
            'interval_pohon_sejalur' => $validated['interval_sejalur'],
            'interval_pohon_menyamping' => $validated['interval_menyamping'],
        ];

        $post = KebunDataset::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Dataset kebun baru ditambahkan: ');

        return redirect()->route('kebun-dataset.index')->with('success', 'Dataset kebun berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(KebunDataset $kebunDataset)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(KebunDataset $kebunDataset)
    {
        $kebuns = Kebun::get(['id', 'nama']);
        return view('pages.kebun-dataset.edit', compact('kebunDataset', 'kebuns'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KebunDataset $kebunDataset)
    {
        $validated = $request->validate([
            'kebun' => 'required|exists:kebuns,id',
            'jumlah_pohon' => 'required|integer',
            'tinggi_pohon' => 'required|numeric',
            'interval_sejalur' => 'required|numeric',
            'interval_menyamping' => 'required|numeric',
        ], [
            'kebun.required' => 'Kebun wajib diisi.',
            'kebun.exists' => 'Kebun yang dipilih tidak valid.',
            'jumlah_pohon.required' => 'Jumlah pohon wajib diisi.',
            'jumlah_pohon.integer' => 'Jumlah pohon tidak valid.',
            'tinggi_pohon.required' => 'Tinggi pohon wajib diisi.',
            'tinggi_pohon.numeric' => 'Tinggi pohon tidak valid.',
            'interval_sejalur.required' => 'Interval pohon sejalur wajib diisi.',
            'interval_sejalur.numeric' => 'Interval pohon sejalur tidak valid.',
            'interval_menyamping.required' => 'Interval pohon menyamping wajib diisi.',
            'interval_menyamping.numeric' => 'Interval pohon menyamping tidak valid.',
        ]);

        $data = [
            'kebun_id' => $validated['kebun'],
            'jumlah_pohon' => $validated['jumlah_pohon'],
            'tinggi_pohon' => $validated['tinggi_pohon'],
            'interval_pohon_sejalur' => $validated['interval_sejalur'],
            'interval_pohon_menyamping' => $validated['interval_menyamping'],
        ];

        $original = $kebunDataset->getOriginal();
        $kebunDataset->update($data);

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
            ->performedOn($kebunDataset)
            ->event('update')
            ->withProperties(['changes' => $changes])
            ->causedBy(Auth::user())
            ->log('Dataset kebun dengan ID ' . $kebunDataset->id . ' berhasil diupdate');

        return redirect()->route('kebun-dataset.index')->with('success', 'Dataset kebun berhasil diubah!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KebunDataset $kebunDataset)
    {
        $kebunDataset->delete();

        activity()
            ->performedOn($kebunDataset)
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Dataset kebun dihapus: ' . $kebunDataset->kode);

        return redirect()->route('kebun-dataset.index')->with('success', 'Dataset kebun berhasil dihapus!');
    }
}
