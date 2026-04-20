<?php

namespace App\Http\Controllers;

use App\Models\Perangkat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PerangkatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $perangkat = Perangkat::latest()->paginate(10);
        return view('pages.perangkat.index', compact('perangkat'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('pages.perangkat.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_drone' => 'required|string|unique:perangkats,id_drone',
            'ip_drone' => 'required|string|unique:perangkats,ip_drone',
            'status' => 'required|boolean',
        ], [
            'id_drone.required' => 'ID drone wajib diisi.',
            'id_drone.string' => 'ID drone harus berupa string.',
            'id_drone.unique' => 'ID drone sudah terdaftar.',
            'ip_drone.required' => 'IP drone wajib diisi.',
            'ip_drone.string' => 'IP drone harus berupa string.',
            'ip_drone.unique' => 'IP drone sudah terdaftar.',
            'status.required' => 'Status wajib diisi.',
            'status.boolean' => 'Status harus berupa boolean.',
        ]);

        $data = [
            'id_drone' => $validated['id_drone'],
            'ip_drone' => $validated['ip_drone'],
            'status' => $validated['status'],
        ];

        $post = Perangkat::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Perangkat baru ditambahkan: ' . $post->id_drone);

        return redirect()->route('perangkat.index')->with('success', 'Data perangkat berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Perangkat $perangkat)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Perangkat $perangkat)
    {
        return view('pages.perangkat.edit', compact('perangkat'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Perangkat $perangkat)
    {
        $validated = $request->validate([
            'id_drone' => 'required|string|unique:perangkats,id_drone,' . $perangkat->id,
            'ip_drone' => 'required|string|unique:perangkats,ip_drone,' . $perangkat->id,
            'status' => 'required|boolean',
        ], [
            'id_drone.required' => 'ID drone wajib diisi.',
            'id_drone.string' => 'ID drone harus berupa string.',
            'id_drone.unique' => 'ID drone sudah terdaftar.',
            'ip_drone.required' => 'IP drone wajib diisi.',
            'ip_drone.string' => 'IP drone harus berupa string.',
            'ip_drone.unique' => 'IP drone sudah terdaftar.',
            'status.required' => 'Status wajib diisi.',
            'status.boolean' => 'Status harus berupa boolean.',
        ]);

        $data = [
            'id_drone' => $validated['id_drone'],
            'ip_drone' => $validated['ip_drone'],
            'status' => $validated['status'],
        ];

        $original = $perangkat->getOriginal();
        $perangkat->update($data);

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
            ->performedOn($perangkat)
            ->event('update')
            ->withProperties(['changes' => $changes])
            ->causedBy(Auth::user())
            ->log('Perangkat dengan ID ' . $perangkat->id . ' berhasil diupdate');

        return redirect()->route('perangkat.index')->with('success', 'Data perangkat berhasil diubah!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Perangkat $perangkat)
    {
        $perangkat->delete();

        activity()
            ->performedOn($perangkat)
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Perangkat dihapus: ' . $perangkat->id_drone);

        return redirect()->route('perangkat.index')->with('success', 'Data perangkat berhasil dihapus!');
    }
}
