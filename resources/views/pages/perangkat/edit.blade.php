<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">{{ __('Data Master') }}</li>
                <li class="breadcrumb-item"><a href="{{ route('perangkat.index') }}">Data Perangkat (Drone)</a></li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Ubah Data') }}</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-perangkat-form-root" data-props="{{ json_encode([
        'perangkat' => $perangkat,
        'old' => old(),
        'errors' => $errors->toArray(),
        'csrfToken' => csrf_token(),
        'routes' => [
            'update' => route('perangkat.update', $perangkat->id),
            'index' => route('perangkat.index')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/perangkat-react.jsx')
    @endpush
</x-app-layout>
