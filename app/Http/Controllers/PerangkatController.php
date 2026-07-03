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
     * API endpoint JSON untuk konsumsi React GCS.
     */
    public function apiIndex()
    {
        $perangkat = Perangkat::latest()->get()->map(fn($p) => [
            'id'     => $p->id_drone,
            'merk'   => $p->ip_drone,
            'status' => $p->status ? 'Standby' : 'Maintenance',
        ]);
        return response()->json($perangkat);
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
            'profil'   => 'nullable|string',
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
            'profil'   => $request->input('profil', 'd16'),
        ];

        $post = Perangkat::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Perangkat baru ditambahkan: ' . $post->id_drone);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'id'     => $post->id_drone,
                    'merk'   => $post->ip_drone,
                    'status' => $post->status ? 'Standby' : 'Maintenance',
                    'profil' => $post->profil ?? 'd16',
                ]
            ]);
        }

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
    public function update(Request $request, $id)
    {
        if (is_numeric($id)) {
            $perangkat = Perangkat::findOrFail($id);
        } else {
            $perangkat = Perangkat::where('id_drone', $id)->firstOrFail();
        }

        $validated = $request->validate([
            'id_drone' => 'required|string|unique:perangkats,id_drone,' . $perangkat->id,
            'ip_drone' => 'required|string|unique:perangkats,ip_drone,' . $perangkat->id,
            'status' => 'required|boolean',
            'profil'   => 'nullable|string',
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
            'profil'   => $request->input('profil', 'd16'),
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

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'data' => [
                    'id'     => $perangkat->id_drone,
                    'merk'   => $perangkat->ip_drone,
                    'status' => $perangkat->status ? 'Standby' : 'Maintenance',
                    'profil' => $perangkat->profil ?? 'd16',
                ]
            ]);
        }

        return redirect()->route('perangkat.index')->with('success', 'Data perangkat berhasil diubah!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        if (is_numeric($id)) {
            $perangkat = Perangkat::findOrFail($id);
        } else {
            $perangkat = Perangkat::where('id_drone', $id)->firstOrFail();
        }

        $perangkat->delete();

        activity()
            ->performedOn($perangkat)
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Perangkat dihapus: ' . $perangkat->id_drone);

        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('perangkat.index')->with('success', 'Data perangkat berhasil dihapus!');
    }
}
