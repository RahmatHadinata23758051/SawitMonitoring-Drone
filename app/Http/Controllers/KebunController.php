<?php

namespace App\Http\Controllers;

use App\Models\Kebun;
use App\Models\Lahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KebunController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kebun = Kebun::with('lahan')->latest()->paginate(10);
        return view('pages.kebun.index', compact('kebun'));
    }

    /**
     * API endpoint JSON untuk konsumsi React GCS.
     */
    public function apiIndex()
    {
        $kebun = Kebun::latest()->get()->map(fn($k) => [
            'id'            => 'BLK-' . $k->id,
            'namaBlok'      => $k->nama,
            'luasKebun'     => (float) $k->luas,
            'totalPohon'    => (int) ($k->jumlah_pohon ?? 140),
            'tinggiPohon'   => 8.5,
            'jumlahSampel'  => (int) ceil(($k->jumlah_pohon ?? 140) * 0.10),
            'status'        => 'Tersimpan',
        ]);
        return response()->json($kebun);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $lahan = Lahan::with('kebun')->get();
        return view('pages.kebun.create', compact('lahan'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'polygon' => 'required|json',
            'nama' => 'required|string',
            'luas' => 'required|decimal:0,2',
            'koordinat' => 'required',
            'warna' => 'required',
            'lahan' => 'required|integer|exists:lahans,id',
            'jumlah_pohon' => 'nullable|integer|min:0',
            'jumlah_pohon_matang' => 'nullable|integer|min:0|lte:jumlah_pohon',
            'jumlah_pohon_belum_matang' => 'nullable|integer|min:0|lte:jumlah_pohon',
        ], [
            'polygon.required' => 'Polygon wajib diisi.',
            'polygon.json' => 'Polygon harus berupa JSON.',
            'nama.required' => 'Nama lahan harus diisi.',
            'nama.string' => 'Nama lahan harus berupa string.',
            'luas.required' => 'Luas lahan wajib diisi.',
            'luas.decimal' => 'Luas lahan harus berupa desimal',
            'koordinat.required' => 'Koordinat wajib diisi.',
            'warna.required' => 'Warna wajib diisi.',
            'lahan.required' => 'Lahan wajib diisi.',
            'lahan.integer' => 'Lahan tidak valid.',
            'jumlah_pohon.integer' => 'Jumlah pohon tidak valid.',
            'jumlah_pohon.min' => 'Jumlah pohon harus lebih dari atau sama dengan 0.',
            'jumlah_pohon_matang.integer' => 'Jumlah pohon matang tidak valid.',
            'jumlah_pohon_matang.min' => 'Jumlah pohon matang harus lebih dari atau sama dengan 0.',
            'jumlah_pohon_matang.lte' => 'Jumlah pohon matang harus kurang dari atau sama dengan jumlah pohon.',
            'jumlah_pohon_belum_matang.integer' => 'Jumlah pohon belum matang tidak valid.',
            'jumlah_pohon_belum_matang.min' => 'Jumlah pohon belum matang harus lebih dari atau sama dengan 0.',
            'jumlah_pohon_belum_matang.lte' => 'Jumlah pohon belum matang harus kurang dari atau sama dengan jumlah pohon.',
        ]);

        $total = $validated['jumlah_pohon'];

        if ($total !== null) {
            $matang = $validated['jumlah_pohon_matang'] ?? 0;
            $belum = $validated['jumlah_pohon_belum_matang'] ?? 0;

            if (($matang + $belum) > $total) {
                return back()->withErrors([
                    'jumlah_pohon' => 'Total pohon matang dan belum matang melebihi jumlah pohon.'
                ])->withInput();
            }
        }

        [$lat, $lng] = explode(',', $validated['koordinat']);

        $data = [
            'nama' => $validated['nama'],
            'polygon' => $validated['polygon'],
            'luas' => $validated['luas'],
            'latitude' => trim($lat),
            'longitude' => trim($lng),
            'warna' => $validated['warna'],
            'lahan_id' => $validated['lahan'],
            'jumlah_pohon' => $validated['jumlah_pohon'],
            'jumlah_pohon_matang' => $validated['jumlah_pohon_matang'],
            'jumlah_pohon_belum_matang' => $validated['jumlah_pohon_belum_matang'],
        ];

        $post = Kebun::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Kebun baru ditambahkan: ' . $validated['nama']);

        return redirect()->route('kebun.index')->with('success', 'Data kebun berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Kebun $kebun)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Kebun $kebun)
    {
        $lahan = Lahan::with('kebun')->get();
        return view('pages.kebun.edit', compact('lahan', 'kebun'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Kebun $kebun)
    {
        $validated = $request->validate([
            'polygon' => 'required|json',
            'nama' => 'required|string',
            'luas' => 'required|decimal:0,2',
            'koordinat' => 'required',
            'warna' => 'required',
            'lahan' => 'required|integer|exists:lahans,id',
            'jumlah_pohon' => 'nullable|integer|min:0',
            'jumlah_pohon_matang' => 'nullable|integer|min:0|lte:jumlah_pohon',
            'jumlah_pohon_belum_matang' => 'nullable|integer|min:0|lte:jumlah_pohon',
        ], [
            'polygon.required' => 'Polygon wajib diisi.',
            'polygon.json' => 'Polygon harus berupa JSON.',
            'nama.required' => 'Nama lahan harus diisi.',
            'nama.string' => 'Nama lahan harus berupa string.',
            'luas.required' => 'Luas lahan wajib diisi.',
            'luas.decimal' => 'Luas lahan harus berupa desimal',
            'koordinat.required' => 'Koordinat wajib diisi.',
            'warna.required' => 'Warna wajib diisi.',
            'lahan.required' => 'Lahan wajib diisi.',
            'lahan.integer' => 'Lahan tidak valid.',
            'jumlah_pohon.integer' => 'Jumlah pohon tidak valid.',
            'jumlah_pohon.min' => 'Jumlah pohon harus lebih dari atau sama dengan 0.',
            'jumlah_pohon_matang.integer' => 'Jumlah pohon matang tidak valid.',
            'jumlah_pohon_matang.min' => 'Jumlah pohon matang harus lebih dari atau sama dengan 0.',
            'jumlah_pohon_matang.lte' => 'Jumlah pohon matang harus kurang dari atau sama dengan jumlah pohon.',
            'jumlah_pohon_belum_matang.integer' => 'Jumlah pohon belum matang tidak valid.',
            'jumlah_pohon_belum_matang.min' => 'Jumlah pohon belum matang harus lebih dari atau sama dengan 0.',
            'jumlah_pohon_belum_matang.lte' => 'Jumlah pohon belum matang harus kurang dari atau sama dengan jumlah pohon.',
        ]);

        $total = $validated['jumlah_pohon'];

        if ($total !== null) {
            $matang = $validated['jumlah_pohon_matang'] ?? 0;
            $belum = $validated['jumlah_pohon_belum_matang'] ?? 0;

            if (($matang + $belum) > $total) {
                return back()->withErrors([
                    'jumlah_pohon' => 'Total pohon matang dan belum matang melebihi jumlah pohon.'
                ])->withInput();
            }
        }

        [$lat, $lng] = explode(',', $validated['koordinat']);

        $data = [
            'nama' => $validated['nama'],
            'polygon' => $validated['polygon'],
            'luas' => $validated['luas'],
            'latitude' => trim($lat),
            'longitude' => trim($lng),
            'warna' => $validated['warna'],
            'lahan_id' => $validated['lahan'],
            'jumlah_pohon' => $validated['jumlah_pohon'],
            'jumlah_pohon_matang' => $validated['jumlah_pohon_matang'],
            'jumlah_pohon_belum_matang' => $validated['jumlah_pohon_belum_matang'],
        ];

        $original = $kebun->getOriginal();
        $kebun->update($data);

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
            ->performedOn($kebun)
            ->event('update')
            ->withProperties(['changes' => $changes])
            ->causedBy(Auth::user())
            ->log('Kebun dengan ID ' . $kebun->id . ' berhasil diupdate');

        return redirect()->route('kebun.index')->with('success', 'Data kebun berhasil diubah!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kebun $kebun)
    {
        $kebun->delete();

        activity()
            ->performedOn($kebun)
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Kebun dihapus: ' . $kebun->nama);

        return redirect()->route('kebun.index')->with('success', 'Data kebun berhasil dihapus!');
    }
}
