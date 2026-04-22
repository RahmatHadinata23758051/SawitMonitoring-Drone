<?php

namespace App\Http\Controllers;

use App\Models\Kebun;
use App\Models\Lahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KebunController extends Controller
{
    private function decodePolygonCoordinates(string $geoJson): ?array
    {
        $decoded = json_decode($geoJson, true);

        if (!is_array($decoded)) {
            return null;
        }

        $geometry = $decoded['geometry'] ?? null;
        if (!is_array($geometry) || ($geometry['type'] ?? null) !== 'Polygon') {
            return null;
        }

        $coordinates = $geometry['coordinates'][0] ?? null;
        if (!is_array($coordinates) || count($coordinates) < 4) {
            return null;
        }

        return $coordinates;
    }

    private function isPointOnSegment(array $point, array $start, array $end): bool
    {
        $epsilon = 1.0E-10;
        [$px, $py] = $point;
        [$x1, $y1] = $start;
        [$x2, $y2] = $end;

        $cross = (($px - $x1) * ($y2 - $y1)) - (($py - $y1) * ($x2 - $x1));
        if (abs($cross) > $epsilon) {
            return false;
        }

        $dot = (($px - $x1) * ($x2 - $x1)) + (($py - $y1) * ($y2 - $y1));
        if ($dot < 0) {
            return false;
        }

        $squaredLength = (($x2 - $x1) ** 2) + (($y2 - $y1) ** 2);
        if ($dot > $squaredLength) {
            return false;
        }

        return true;
    }

    private function pointInPolygon(array $point, array $polygon): bool
    {
        $inside = false;
        $count = count($polygon);

        for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
            $start = $polygon[$j];
            $end = $polygon[$i];

            if ($this->isPointOnSegment($point, $start, $end)) {
                return true;
            }

            [$xi, $yi] = $end;
            [$xj, $yj] = $start;

            $intersects = (($yi > $point[1]) !== ($yj > $point[1]))
                && ($point[0] < (($xj - $xi) * ($point[1] - $yi) / (($yj - $yi) ?: 1.0E-10)) + $xi);

            if ($intersects) {
                $inside = !$inside;
            }
        }

        return $inside;
    }

    private function polygonWithinLahan(string $candidateGeoJson, Lahan $lahan): bool
    {
        $candidate = $this->decodePolygonCoordinates($candidateGeoJson);
        $parent = $this->decodePolygonCoordinates((string) $lahan->polygon);

        if ($candidate === null || $parent === null) {
            return false;
        }

        foreach ($candidate as $point) {
            if (!is_array($point) || count($point) < 2) {
                return false;
            }

            if (!$this->pointInPolygon([(float) $point[0], (float) $point[1]], $parent)) {
                return false;
            }
        }

        return true;
    }

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
            'alamat' => 'nullable|string|max:500',
            'lahan' => 'required|integer|exists:lahans,id',
            'jumlah_pohon' => 'nullable|integer|min:0',
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
            'alamat.max' => 'Alamat maksimal 500 karakter.',
            'lahan.required' => 'Lahan wajib diisi.',
            'lahan.integer' => 'Lahan tidak valid.',
            'jumlah_pohon.integer' => 'Jumlah pohon tidak valid.',
            'jumlah_pohon.min' => 'Jumlah pohon harus lebih dari atau sama dengan 0.',
        ]);

        $selectedLahan = Lahan::findOrFail($validated['lahan']);
        if (!$this->polygonWithinLahan($validated['polygon'], $selectedLahan)) {
            return back()->withErrors([
                'polygon' => 'Polygon kebun harus berada di dalam batas lahan yang dipilih.'
            ])->withInput();
        }

        [$lat, $lng] = explode(',', $validated['koordinat']);

        $data = [
            'nama' => $validated['nama'],
            'polygon' => $validated['polygon'],
            'luas' => $validated['luas'],
            'latitude' => trim($lat),
            'longitude' => trim($lng),
            'warna' => $validated['warna'],
            'alamat' => $validated['alamat'] ?? null,
            'lahan_id' => $validated['lahan'],
            'jumlah_pohon' => $validated['jumlah_pohon'] ?? null,
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
            'alamat' => 'nullable|string|max:500',
            'lahan' => 'required|integer|exists:lahans,id',
            'jumlah_pohon' => 'nullable|integer|min:0',
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
            'alamat.max' => 'Alamat maksimal 500 karakter.',
            'lahan.required' => 'Lahan wajib diisi.',
            'lahan.integer' => 'Lahan tidak valid.',
            'jumlah_pohon.integer' => 'Jumlah pohon tidak valid.',
            'jumlah_pohon.min' => 'Jumlah pohon harus lebih dari atau sama dengan 0.',
        ]);

        $selectedLahan = Lahan::findOrFail($validated['lahan']);
        if (!$this->polygonWithinLahan($validated['polygon'], $selectedLahan)) {
            return back()->withErrors([
                'polygon' => 'Polygon kebun harus berada di dalam batas lahan yang dipilih.'
            ])->withInput();
        }

        [$lat, $lng] = explode(',', $validated['koordinat']);

        $data = [
            'nama' => $validated['nama'],
            'polygon' => $validated['polygon'],
            'luas' => $validated['luas'],
            'latitude' => trim($lat),
            'longitude' => trim($lng),
            'warna' => $validated['warna'],
            'alamat' => $validated['alamat'] ?? null,
            'lahan_id' => $validated['lahan'],
            'jumlah_pohon' => $validated['jumlah_pohon'] ?? null,
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
