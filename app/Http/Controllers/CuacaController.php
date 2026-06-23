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
            'province'  => 'required',
            'city'      => 'required',
            'district'  => 'required',
            'village'   => 'required',
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
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
        $cuaca->latitude        = $request->latitude;
        $cuaca->longitude       = $request->longitude;
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
     * Match region names from reverse geocode address object.
     */
    public function matchRegion(Request $request)
    {
        $addr = $request->input('address', []);
        $addrValues = array_filter(array_values($addr), function($val) {
            return is_string($val);
        });

        // 1. Match Province
        $province = null;
        $provSearch = array_filter([
            $addr['state'] ?? null,
            $addr['province'] ?? null,
            $addr['region'] ?? null
        ]);
        
        foreach ($provSearch as $name) {
            $clean = $this->cleanName($name);
            $province = Province::whereRaw("LOWER(REPLACE(name, ' ', '')) = ?", [str_replace(' ', '', $clean)])->first();
            if ($province) break;
        }
        
        if (!$province) {
            foreach ($addrValues as $name) {
                $clean = $this->cleanName($name);
                $province = Province::whereRaw("LOWER(REPLACE(name, ' ', '')) = ?", [str_replace(' ', '', $clean)])->first();
                if ($province) break;
            }
        }

        if (!$province) {
            return response()->json(['error' => 'Province not found'], 404);
        }

        $provinceCode = $province->code;
        $cities = City::where('province_code', $provinceCode)->get();

        // 2. Match City
        $city = null;
        $citySearch = array_filter([
            $addr['city'] ?? null,
            $addr['city_district'] ?? null,
            $addr['county'] ?? null,
            $addr['municipality'] ?? null
        ]);

        foreach ($citySearch as $name) {
            $clean = $this->cleanName($name);
            $city = City::where('province_code', $provinceCode)
                ->whereRaw("LOWER(REPLACE(name, ' ', '')) = ?", [str_replace(' ', '', $clean)])
                ->first();
            if ($city) break;
        }

        if (!$city) {
            // Try fuzzy match
            foreach ($citySearch as $name) {
                $fuzzyClean = $this->cleanNameFuzzy($name);
                foreach ($cities as $c) {
                    if ($this->cleanNameFuzzy($c->name) === $fuzzyClean) {
                        $city = $c;
                        break 2;
                    }
                }
            }
        }

        if (!$city && count($cities) > 0) {
            $city = $cities[0];
        }

        if (!$city) {
            return response()->json([
                'province_code' => $provinceCode,
                'cities' => $cities,
                'districts' => [],
                'villages' => []
            ]);
        }

        $cityCode = $city->code;
        $districts = District::where('city_code', $cityCode)->get();

        // 3. Match District (Kecamatan)
        $district = null;
        $districtSearch = array_filter([
            $addr['town'] ?? null,
            $addr['subdistrict'] ?? null,
            $addr['district'] ?? null,
            $addr['locality'] ?? null
        ]);

        foreach ($districtSearch as $name) {
            $clean = $this->cleanName($name);
            $district = District::where('city_code', $cityCode)
                ->whereRaw("LOWER(REPLACE(name, ' ', '')) = ?", [str_replace(' ', '', $clean)])
                ->first();
            if ($district) break;
        }

        if (!$district) {
            // Try fuzzy match
            foreach ($districtSearch as $name) {
                $fuzzyClean = $this->cleanNameFuzzy($name);
                foreach ($districts as $d) {
                    if ($this->cleanNameFuzzy($d->name) === $fuzzyClean) {
                        $district = $d;
                        break 2;
                    }
                }
            }
        }

        if (!$district && count($districts) > 0) {
            $district = $districts[0];
        }

        if (!$district) {
            return response()->json([
                'province_code' => $provinceCode,
                'city_code' => $cityCode,
                'cities' => $cities,
                'districts' => $districts,
                'villages' => []
            ]);
        }

        $districtCode = $district->code;
        $villages = Village::where('district_code', $districtCode)->get();

        // 4. Match Village (Desa/Kelurahan)
        $village = null;
        $villageSearch = array_filter([
            $addr['village'] ?? null,
            $addr['hamlet'] ?? null,
            $addr['neighbourhood'] ?? null,
            $addr['suburb'] ?? null,
            $addr['residential'] ?? null
        ]);

        foreach ($villageSearch as $name) {
            $clean = $this->cleanName($name);
            $village = Village::where('district_code', $districtCode)
                ->whereRaw("LOWER(REPLACE(name, ' ', '')) = ?", [str_replace(' ', '', $clean)])
                ->first();
            if ($village) break;
        }

        if (!$village) {
            // Try fuzzy match
            foreach ($villageSearch as $name) {
                $fuzzyClean = $this->cleanNameFuzzy($name);
                foreach ($villages as $v) {
                    if ($this->cleanNameFuzzy($v->name) === $fuzzyClean) {
                        $village = $v;
                        break 2;
                    }
                }
            }
        }

        if (!$village && count($villages) > 0) {
            $village = $villages[0];
        }

        return response()->json([
            'province_code' => $provinceCode,
            'city_code' => $cityCode,
            'district_code' => $districtCode,
            'village_code' => $village ? $village->code : '',
            'cities' => $cities,
            'districts' => $districts,
            'villages' => $villages
        ]);
    }

    private function cleanName($str)
    {
        if (!$str) return '';
        return strtolower(preg_replace('/[^a-zA-Z0-9\s]/', '', $str));
    }

    private function cleanNameFuzzy($str)
    {
        if (!$str) return '';
        $str = $this->cleanName($str);
        $keywords = ['daerah khusus ibukota', 'daerah istimewa', 'dki', 'diy', 'provinsi', 'prov', 'kabupaten', 'kab', 'kota', 'kecamatan', 'kec', 'desa', 'kelurahan', 'kel'];
        foreach ($keywords as $kw) {
            $str = preg_replace('/\b' . preg_quote($kw, '/') . '\b/i', '', $str);
        }
        return trim(preg_replace('/\s+/', ' ', $str));
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
