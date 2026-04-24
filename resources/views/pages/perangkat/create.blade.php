<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">{{ __('Data Master') }}</li>
                <li class="breadcrumb-item"><a href="{{ route('perangkat.index') }}">Data Perangkat (Drone)</a></li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Tambah Data') }}</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-perangkat-form-root" data-props="{{ json_encode([
        'perangkat' => null,
        'old' => old(),
        'errors' => $errors->toArray(),
        'csrfToken' => csrf_token(),
        'routes' => [
            'store' => route('perangkat.store'),
            'index' => route('perangkat.index')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/perangkat-react.jsx')
    @endpush
</x-app-layout>
