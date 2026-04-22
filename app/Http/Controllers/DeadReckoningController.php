<?php

namespace App\Http\Controllers;

use App\Models\DeadReckoning;
use App\Models\DroneDataset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DeadReckoningController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rules = DeadReckoning::with('drone_dataset')->latest()->get();
        return view('pages.rule-engine.dead-reckoning.index', compact('rules'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $aksi = DroneDataset::get(['id', 'label']);
        return view('pages.rule-engine.dead-reckoning.create', compact('aksi'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'aksi' => 'required|integer',
            'durasi' => 'required|numeric',
            'satuan_waktu' => 'required|in:menit,detik,milidetik',
        ], [
            'aksi.required' => 'Aksi drone wajib diisi.',
            'aksi.integer' => 'Aksi drone tidak valid.',
            'durasi.required' => 'Durasi wajib diisi.',
            'durasi.numeric' => 'Durasi tidak valid.',
            'satuan_waktu.required' => 'Satuan waktu wajib diisi',
            'satuan_waktu.in' => 'Satuan waktu tidak valid.',
        ]);

        $data = [
            'drone_dataset_id' => $validated['aksi'],
            'durasi' => $validated['durasi'],
            'satuan_waktu' => $validated['satuan_waktu'],
        ];

        $post = DeadReckoning::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Rule berhasil ditambahkan: ' . $post->drone_dataset->label . ' selama ' . $post->durasi . ' ' . $post->satuan_waktu);

        return redirect()->route('dead-reckoning.index')->with('success', 'Rule berhasil dibuat!');
    }

    /**
     * Display the specified resource.
     */
    public function show(DeadReckoning $deadReckoning)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DeadReckoning $deadReckoning)
    {
        $aksi = DroneDataset::get(['id', 'label']);
        return view('pages.rule-engine.dead-reckoning.edit', compact('deadReckoning', 'aksi'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DeadReckoning $deadReckoning)
    {
        $validated = $request->validate([
            'aksi' => 'required|integer',
            'durasi' => 'required|numeric',
            'satuan_waktu' => 'required|in:menit,detik,milidetik',
        ], [
            'aksi.required' => 'Aksi drone wajib diisi.',
            'aksi.integer' => 'Aksi drone tidak valid.',
            'durasi.required' => 'Durasi wajib diisi.',
            'durasi.numeric' => 'Durasi tidak valid.',
            'satuan_waktu.required' => 'Satuan waktu wajib diisi',
            'satuan_waktu.in' => 'Satuan waktu tidak valid.',
        ]);

        $data = [
            'drone_dataset_id' => $validated['aksi'],
            'durasi' => $validated['durasi'],
            'satuan_waktu' => $validated['satuan_waktu'],
        ];

        $original = $deadReckoning->getOriginal();
        $deadReckoning->update($data);

        $changes = [];
        foreach ($data as $key => $value) {
            if (array_key_exists($key, $original) && $original[$key] != $value) {
                $changes[$key] = [
                    'old' => $original[$key],
                    'new' => $value,
                ];
            }
        }

        activity()
            ->performedOn($deadReckoning)
            ->event('update')
            ->withProperties(['changes' => $changes])
            ->causedBy(Auth::user())
            ->log('Rule dengan ID ' . $deadReckoning->id . ' berhasil diupdate');

        return redirect()->route('dead-reckoning.index')->with('success', 'Rule berhasil diubah!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DeadReckoning $deadReckoning)
    {
        $deadReckoning->delete();

        activity()
            ->performedOn($deadReckoning)
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Rule dihapus: ' . $deadReckoning->drone_dataset->label);

        return redirect()->route('dead-reckoning.index')->with('success', 'Rule berhasil dihapus!');
    }
}
