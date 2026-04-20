<?php

namespace App\Http\Controllers;

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
        return view('pages.cuaca.index', compact('provinces'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'province' => 'required',
            'city' => 'required',
            'district' => 'required',
            'village' => 'required',
        ], [
            'province.required' => 'Provinsi wajib diisi.',
            'city.required' => 'Kota/Kabupaten wajib diisi.',
            'district.required' => 'Kecamatan wajib diisi.',
            'village.required' => 'Desa wajib diisi.',
        ]);

        $cuaca = Cuaca::first();
        if (!$cuaca) {
            $cuaca = new Cuaca();
        }

        $cuaca->province_code = $request->province;
        $cuaca->city_code = $request->city;
        $cuaca->district_code = $request->district;
        $cuaca->village_code = $request->village;
        $cuaca->save();

        return redirect()->route('cuaca.index')->with('success', 'Data cuaca berhasil disimpan!');
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
