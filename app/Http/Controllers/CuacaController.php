<?php

namespace App\Http\Controllers;

use App\Console\Commands\FetchOpenWeather;
use App\Models\Cuaca;
use Illuminate\Http\Request;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

class CuacaController extends Controller
{
    public function index()
    {
        $provinces = Province::get();
        $cuaca     = Cuaca::first();
        // Load all options server-side sehingga dropdown langsung penuh tanpa AJAX delay
        $cities    = $cuaca?->province_code ? City::where('province_code', $cuaca->province_code)->get()     : collect();
        $districts = $cuaca?->city_code     ? District::where('city_code', $cuaca->city_code)->get()         : collect();
        $villages  = $cuaca?->district_code ? Village::where('district_code', $cuaca->district_code)->get()  : collect();
        return view('pages.cuaca.index', compact('provinces', 'cuaca', 'cities', 'districts', 'villages'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'province' => 'required',
            'city'     => 'required',
            'district' => 'required',
            'village'  => 'required',
        ], [
            'province.required' => 'Provinsi wajib diisi.',
            'city.required'     => 'Kota/Kabupaten wajib diisi.',
            'district.required' => 'Kecamatan wajib diisi.',
            'village.required'  => 'Desa wajib diisi.',
        ]);

        $cuaca = Cuaca::first() ?? new Cuaca();

        // Simpan kode wilayah + nama lokasi dari model Indonesia
        $city     = City::where('code', $request->city)->first();
        $district = District::where('code', $request->district)->first();
        $village  = Village::where('code', $request->village)->first();
        $province = Province::where('code', $request->province)->first();

        $cuaca->province_code   = $request->province;
        $cuaca->city_code       = $request->city;
        $cuaca->district_code   = $request->district;
        $cuaca->village_code    = $request->village;
        $cuaca->provinsi        = $province?->name;
        $cuaca->kabupaten_kota  = $city?->name;
        $cuaca->kecamatan       = $district?->name;
        $cuaca->desa            = $village?->name;
        $cuaca->save();

        // Langsung fetch OpenWeatherMap setelah simpan lokasi
        $cityName = $city?->name ?? $cuaca->kabupaten_kota;
        if ($cityName) {
            FetchOpenWeather::fetchAndSave($cuaca, $cityName);
        }

        return redirect()->route('cuaca.index')->with('success', 'Lokasi disimpan dan data cuaca berhasil diperbarui!');
    }

    /**
     * Refresh data cuaca dari OWM tanpa mengubah lokasi.
     */
    public function refresh()
    {
        $cuaca = Cuaca::first();
        if (!$cuaca || !$cuaca->kabupaten_kota) {
            return back()->with('error', 'Harap atur lokasi cuaca terlebih dahulu.');
        }

        $cityName = $cuaca->kabupaten_kota;
        if ($cuaca->city_code && !$cityName) {
            $city     = City::where('code', $cuaca->city_code)->first();
            $cityName = $city?->name;
        }

        $result = FetchOpenWeather::fetchAndSave($cuaca, $cityName);

        if ($result === 0) {
            return back()->with('success', "Data cuaca {$cuaca->kabupaten_kota} berhasil diperbarui!");
        }

        return back()->with('error', 'Gagal mengambil data dari OpenWeatherMap. Cek koneksi internet atau nama kota.');
    }

    public function getCities(Request $request)
    {
        return City::where('province_code', $request->province_code)->get();
    }

    public function getDistricts(Request $request)
    {
        return District::where('city_code', $request->city_code)->get();
    }

    public function getVillages(Request $request)
    {
        return Village::where('district_code', $request->district_code)->get();
    }
}
