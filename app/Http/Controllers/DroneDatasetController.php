<?php

namespace App\Http\Controllers;

use App\Models\DroneDataset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DroneDatasetController extends Controller
{
    private const DECIMAL_FIELDS = [
        'lat',
        'lon',
        'alt',
        'ax',
        'ay',
        'az',
        'gx',
        'gy',
        'gz',
        'vx',
        'vy',
        'vz',
        'dist_front',
        'dist_left',
        'dist_right',
        'dist_back',
    ];

    public function index()
    {
        $dataset = DroneDataset::latest()->get();
        return view('pages.drone-dataset.index', compact('dataset'));
    }

    public function create()
    {
        return view('pages.drone-dataset.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        $data = $this->preparePayload($validated);

        $post = DroneDataset::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Dataset drone baru ditambahkan: ' . $post->label);

        return redirect()->route('drone-dataset.index')->with('success', 'Dataset drone berhasil dibuat!');
    }

    public function edit(DroneDataset $droneDataset)
    {
        return view('pages.drone-dataset.edit', compact('droneDataset'));
    }

    public function update(Request $request, DroneDataset $droneDataset)
    {
        $validated = $request->validate($this->rules($droneDataset));
        $data = $this->preparePayload($validated);

        $original = $droneDataset->getOriginal();
        $droneDataset->update($data);

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
            ->performedOn($droneDataset)
            ->event('update')
            ->withProperties(['changes' => $changes])
            ->causedBy(Auth::user())
            ->log('Dataset dengan ID ' . $droneDataset->id . ' berhasil diupdate');

        return redirect()->route('drone-dataset.index')->with('success', 'Dataset berhasil diubah!');
    }

    public function destroy(DroneDataset $droneDataset)
    {
        $droneDataset->delete();

        activity()
            ->performedOn($droneDataset)
            ->event('delete')
            ->causedBy(Auth::user())
            ->log('Dataset dihapus: ' . $droneDataset->kode . ' - ' . $droneDataset->label);

        return redirect()->route('drone-dataset.index')->with('success', 'Dataset berhasil dihapus!');
    }

    private function rules(?DroneDataset $droneDataset = null): array
    {
        $rules = [
            'kode' => ['required', 'string', Rule::unique('drone_datasets', 'kode')->ignore($droneDataset?->id)],
            'label' => ['required', 'string'],
            'obstacle_status' => ['required', 'string'],
        ];

        foreach (self::DECIMAL_FIELDS as $field) {
            $rules[$field] = ['required', 'regex:/^-?\d+([.,]\d+)?$/'];
        }

        return $rules;
    }

    private function preparePayload(array $validated): array
    {
        $data = [
            'kode' => trim((string) $validated['kode']),
            'label' => trim((string) $validated['label']),
            'obstacle_status' => trim((string) $validated['obstacle_status']),
        ];

        foreach (self::DECIMAL_FIELDS as $field) {
            $data[$field] = (float) str_replace(',', '.', trim((string) $validated[$field]));
        }

        return $data;
    }
}
