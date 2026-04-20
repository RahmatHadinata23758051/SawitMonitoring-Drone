<?php

namespace App\Http\Controllers;

use App\Models\DroneDataset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DroneDatasetController extends Controller
{
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
        $validated = $request->validate([
            'kode_kondisi' => 'required|string|unique:drone_datasets,kode_kondisi',
            'nama_kondisi' => 'required|string',
            'accel_x' => 'required|regex:/^-?\d+([.,]\d+)?$/',
            'accel_y' => 'required|regex:/^-?\d+([.,]\d+)?$/',
            'accel_z' => 'required|regex:/^-?\d+([.,]\d+)?$/',
            'gyro_x' => 'required|regex:/^-?\d+([.,]\d+)?$/',
            'gyro_y' => 'required|regex:/^-?\d+([.,]\d+)?$/',
            'gyro_z' => 'required|regex:/^-?\d+([.,]\d+)?$/',
        ]);

        $fields = ['accel_x', 'accel_y', 'accel_z', 'gyro_x', 'gyro_y', 'gyro_z'];

        $data = [
            'kode_kondisi' => $validated['kode_kondisi'],
            'nama_kondisi' => $validated['nama_kondisi'],
        ];

        foreach ($fields as $field) {
            $data[$field] = (float) str_replace(',', '.', trim($validated[$field]));
        }

        $post = DroneDataset::create($data);

        activity()
            ->performedOn($post)
            ->event('create')
            ->causedBy(Auth::user())
            ->log('Dataset drone baru ditambahkan: ' . $post->nama_kondisi);

        return redirect()->route('drone-dataset.index')->with('success', 'Dataset drone berhasil dibuat!');
    }

    public function edit(DroneDataset $droneDataset)
    {
        return view('pages.drone-dataset.edit', compact('droneDataset'));
    }

    public function update(Request $request, DroneDataset $droneDataset)
    {
        $validated = $request->validate([
            'kode_kondisi' => 'required|string|unique:drone_datasets,kode_kondisi',
            'nama_kondisi' => 'required|string',
            'accel_x' => 'required|regex:/^-?\d+([.,]\d+)?$/',
            'accel_y' => 'required|regex:/^-?\d+([.,]\d+)?$/',
            'accel_z' => 'required|regex:/^-?\d+([.,]\d+)?$/',
            'gyro_x' => 'required|regex:/^-?\d+([.,]\d+)?$/',
            'gyro_y' => 'required|regex:/^-?\d+([.,]\d+)?$/',
            'gyro_z' => 'required|regex:/^-?\d+([.,]\d+)?$/',
        ]);

        $fields = ['accel_x', 'accel_y', 'accel_z', 'gyro_x', 'gyro_y', 'gyro_z'];

        $data = [
            'kode_kondisi' => $validated['kode_kondisi'],
            'nama_kondisi' => $validated['nama_kondisi'],
        ];

        foreach ($fields as $field) {
            $data[$field] = (float) str_replace(',', '.', trim($validated[$field]));
        }

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
            ->log('Dataset dihapus: ' . $droneDataset->kode_kondisi . ' - ' . $droneDataset->nama_kondisi);

        return redirect()->route('drone-dataset.index')->with('success', 'Dataset berhasil dihapus!');
    }
}
