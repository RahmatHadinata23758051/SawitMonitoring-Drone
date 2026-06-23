<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-lg text-gray-800 leading-tight">
            {{ __('Pengaturan Data Cuaca') }}
        </h2>
    </x-slot>

    <div id="react-cuaca-root" data-props="{{ json_encode([
        'cuaca' => $cuaca,
        'provinces' => $provinces,
        'cities' => $cities,
        'districts' => $districts,
        'villages' => $villages,
        'csrfToken' => csrf_token(),
        'flashSuccess' => session('success'),
        'flashError' => session('error'),
        'routes' => [
            'store' => route('cuaca.store'),
            'refresh' => route('cuaca.refresh'),
            'matchRegion' => route('cuaca.match-region')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/cuaca-react.jsx')
    @endpush
</x-app-layout>
