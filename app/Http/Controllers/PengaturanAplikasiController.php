<?php

namespace App\Http\Controllers;

use App\Models\PengaturanAplikasi;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PengaturanAplikasiController extends Controller
{
    public function index()
    {
        $setting = PengaturanAplikasi::first();
        return view('pages.pengaturan-aplikasi.index', compact('setting'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'logo_aplikasi' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'nama' => 'required|string',
            'nama_tab' => 'required|string',
            'versi' => 'required|string',
            'copyright' => 'required|string',
            'tahun_copyright' => 'required|string',
        ], [
            'logo_aplikasi.image' => 'Logo harus berupa gambar.',
            'logo_aplikasi.mimes' => 'Format logo harus berupa jpeg, png, atau jpg.',
            'logo_aplikasi.max' => 'Ukuran logo melebihi 2MB.',
            'nama.required' => 'Nama website harus diisi.',
            'nama_tab.required' => 'Nama tab browser harus diisi.',
            'versi.required' => 'Versi website harus diisi.',
            'copyright.required' => 'Copyright harus diisi.',
            'tahun_copyright.required' => 'Tahun copyright harus diisi.',
        ]);

        $setting = PengaturanAplikasi::first();

        if (!$setting) {
            $setting = new PengaturanAplikasi();
        }

        if ($request->hasFile('logo_aplikasi')) {
            ImageService::deleteImage($setting->logo_aplikasi);
            $imgPath = ImageService::image_intervention($request->file('logo_aplikasi'), 'images/pengaturan-aplikasi/');
            $setting->logo_aplikasi = $imgPath;
        }

        $setting->nama = $validated['nama'];
        $setting->nama_tab = $validated['nama_tab'];
        $setting->versi = $validated['versi'];
        $setting->copyright = $validated['copyright'];
        $setting->tahun_copyright = $validated['tahun_copyright'];
        $setting->save();

        activity()
            ->event('update')
            ->performedOn($setting)
            ->causedBy(Auth::user())
            ->log('Pengaturan aplikasi berhasil diupdate');

        return redirect()->route('pengaturan-aplikasi.index')->with('success', 'Pengaturan aplikasi berhasil disimpan!');
    }

    public function fetchPengaturanAplikasi()
    {
        $setting = PengaturanAplikasi::first();
        return response()->json([
            'image' => $setting->logo_aplikasi ?? null,
            'name' => $setting->nama ?? 'Deteksi Tingkat Kematangan Sawit',
            'version' => $setting->versi ?? '1.0',
            'copyright' => $setting->copyright ?? 'MakeSens',
            'copyright_year' => $setting->tahun_copyright ?? '2026',
            'tab_name' => $setting->nama_tab ?? null,
        ]);
    }
}
