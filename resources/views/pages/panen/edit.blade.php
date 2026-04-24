<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('panen.index') }}">Manajemen Panen</a></li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Ubah Data') }}</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-panen-form-root" data-props="{{ json_encode([
        'panen' => $panen,
        'kebun' => $kebun,
        'old' => old(),
        'errors' => $errors->toArray(),
        'csrfToken' => csrf_token(),
        'routes' => [
            'update' => route('panen.update', $panen->id),
            'index' => route('panen.index')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/panen-react.jsx')
    @endpush
</x-app-layout>
