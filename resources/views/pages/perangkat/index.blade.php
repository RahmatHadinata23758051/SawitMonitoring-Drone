<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Data Master</li>
                <li class="breadcrumb-item breadcrumb-active">Data Perangkat (Drone)</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-perangkat-root" data-props="{{ json_encode([
        'perangkat' => $perangkat,
        'csrfToken' => csrf_token(),
        'flashSuccess' => session('success'),
        'routes' => [
            'create' => route('perangkat.create'),
            'editBase' => url('perangkat'),
            'destroyBase' => url('perangkat')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/perangkat-react.jsx')
    @endpush
</x-app-layout>
