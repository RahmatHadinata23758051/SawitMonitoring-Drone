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
        $rules = DeadReckoning::with('drone_dataset')->orderBy('sort_order')->get();
        $aksi  = DroneDataset::orderBy('label')->get(['id', 'label']);
        return view('pages.rule-engine.dead-reckoning.index', compact('rules', 'aksi'));
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
     * Ambil sequence rules terurut untuk Dead-Reckoning execution (API).
     */
    public function getSequence()
    {
        $rules = DeadReckoning::with('drone_dataset')
            ->orderBy('sort_order', 'asc')
            ->get()
            ->map(function ($rule) {
                return [
                    'id'           => $rule->id,
                    'aksi'         => $rule->drone_dataset->label,
                    'durasi'       => (float) $rule->durasi,
                    'satuan_waktu' => $rule->satuan_waktu,
                ];
            });

        return response()->json([
            'total'    => $rules->count(),
            'sequence' => $rules,
        ]);
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
            'durasi'           => $validated['durasi'],
            'satuan_waktu'     => $validated['satuan_waktu'],
            'sort_order'       => (DeadReckoning::max('sort_order') ?? 0) + 1,
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
     * AJAX Store — tambah rule tanpa reload halaman (modal quick-add).
     */
    public function storeAjax(Request $request)
    {
        $validated = $request->validate([
            'aksi'         => 'required|integer|exists:drone_datasets,id',
            'durasi'       => 'required|numeric|min:0.1',
            'satuan_waktu' => 'required|in:menit,detik,milidetik',
        ]);

        $rule = DeadReckoning::create([
            'drone_dataset_id' => $validated['aksi'],
            'durasi'           => $validated['durasi'],
            'satuan_waktu'     => $validated['satuan_waktu'],
            'sort_order'       => (DeadReckoning::max('sort_order') ?? 0) + 1,
        ]);

        $rule->load('drone_dataset');

        activity()
            ->performedOn($rule)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Rule ditambahkan (AJAX): ' . $rule->drone_dataset->label . ' selama ' . $rule->durasi . ' ' . $rule->satuan_waktu);

        return response()->json([
            'ok'        => true,
            'id'        => $rule->id,
            'label'     => $rule->drone_dataset->label,
            'durasi'    => $rule->durasi,
            'satuan'    => $rule->satuan_waktu,
            'sort_order'=> $rule->sort_order,
            'edit_url'  => route('dead-reckoning.edit', $rule->id),
            'delete_url'=> route('dead-reckoning.destroyAjax', $rule->id),
        ]);
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
        $label = $deadReckoning->drone_dataset->label;
        $deadReckoning->delete();

        // Re-sequence sort_order agar tetap rapi
        DeadReckoning::orderBy('sort_order')->each(function ($r, $i) {
            $r->timestamps = false;
            $r->update(['sort_order' => $i + 1]);
        });

        activity()
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Rule dihapus: ' . $label);

        return redirect()->route('dead-reckoning.index')->with('success', 'Rule berhasil dihapus!');
    }

    /**
     * AJAX Delete — hapus tanpa reload halaman.
     */
    public function destroyAjax(DeadReckoning $deadReckoning)
    {
        $label = $deadReckoning->drone_dataset->label;
        $deadReckoning->delete();

        DeadReckoning::orderBy('sort_order')->each(function ($r, $i) {
            $r->timestamps = false;
            $r->update(['sort_order' => $i + 1]);
        });

        activity()
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Rule dihapus (AJAX): ' . $label);

        return response()->json(['ok' => true, 'message' => 'Rule dihapus']);
    }

    /**
     * Simpan urutan baru dari drag-and-drop.
     */
    public function reorder(Request $request)
    {
        $ids = $request->input('ids', []);
        foreach ($ids as $order => $id) {
            DeadReckoning::where('id', $id)->update(['sort_order' => $order + 1]);
        }
        return response()->json(['ok' => true]);
    }
}
