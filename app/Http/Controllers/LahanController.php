<?php

namespace App\Http\Controllers;

use App\Models\Lahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LahanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $lahan = Lahan::withCount('kebun')->latest()->paginate(10);
        return view('pages.lahan.index', compact('lahan'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $lahan = Lahan::with('kebun')->get();
        return view('pages.lahan.create', compact('lahan'));
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
            'alamat' => 'nullable|string|max:500',
        ], [
            'polygon.required' => 'Polygon wajib diisi.',
            'polygon.json' => 'Polygon harus berupa JSON.',
            'nama.required' => 'Nama lahan harus diisi.',
            'nama.string' => 'Nama lahan harus berupa string.',
            'luas.required' => 'Luas lahan wajib diisi.',
            'luas.decimal' => 'Luas lahan harus berupa desimal',
            'koordinat.required' => 'Koordinat wajib diisi.',
            'warna.required' => 'Warna wajib diisi.',
            'alamat.string' => 'Alamat harus berupa teks.',
            'alamat.max' => 'Alamat maksimal 500 karakter.'
        ]);

        [$lat, $lng] = explode(',', $validated['koordinat']);

        $data = [
            'nama' => $validated['nama'],
            'polygon' => $validated['polygon'],
            'luas' => $validated['luas'],
            'latitude' => trim($lat),
            'longitude' => trim($lng),
            'warna' => $validated['warna'],
            'alamat' => $validated['alamat'] ?? null,
        ];

        $post = Lahan::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Lahan baru ditambahkan: ' . $validated['nama']);

        return redirect()->route('lahan.index')->with('success', 'Data lahan berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Lahan $lahan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lahan $lahan)
    {
        $lahanAll = Lahan::with('kebun')->get();
        return view('pages.lahan.edit', compact('lahan', 'lahanAll'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lahan $lahan)
    {
        $validated = $request->validate([
            'polygon' => 'required|json',
            'nama' => 'required|string',
            'luas' => 'required|decimal:0,2',
            'koordinat' => 'required',
            'warna' => 'required',
            'alamat' => 'nullable|string|max:500',
        ], [
            'polygon.required' => 'Polygon wajib diisi.',
            'polygon.json' => 'Polygon harus berupa JSON.',
            'nama.required' => 'Nama lahan harus diisi.',
            'nama.string' => 'Nama lahan harus berupa string.',
            'luas.required' => 'Luas lahan wajib diisi.',
            'luas.decimal' => 'Luas lahan harus berupa desimal',
            'koordinat.required' => 'Koordinat wajib diisi.',
            'warna.required' => 'Warna wajib diisi.',
            'alamat.string' => 'Alamat harus berupa teks.',
            'alamat.max' => 'Alamat maksimal 500 karakter.'
        ]);

        [$lat, $lng] = explode(',', $validated['koordinat']);

        $data = [
            'nama' => $validated['nama'],
            'polygon' => $validated['polygon'],
            'luas' => $validated['luas'],
            'latitude' => trim($lat),
            'longitude' => trim($lng),
            'warna' => $validated['warna'],
            'alamat' => $validated['alamat'] ?? null,
        ];

        $original = $lahan->getOriginal();
        $lahan->update($data);

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
            ->performedOn($lahan)
            ->event('update')
            ->withProperties(['changes' => $changes])
            ->causedBy(Auth::user())
            ->log('Lahan dengan ID ' . $lahan->id . ' berhasil diupdate');

        return redirect()->route('lahan.index')->with('success', 'Data lahan berhasil diubah!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lahan $lahan)
    {
        $lahan->delete();

        activity()
            ->performedOn($lahan)
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Lahan dihapus: ' . $lahan->nama);

        return redirect()->route('lahan.index')->with('success', 'Data lahan berhasil dihapus!');
    }
}
