<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Manajemen</li>
                <li class="breadcrumb-item breadcrumb-active">Data Panen</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-panen-root" data-props="{{ json_encode([
        'panen' => $panen,
        'csrfToken' => csrf_token(),
        'flashSuccess' => session('success'),
        'routes' => [
            'create' => route('panen.create'),
            'editBase' => url('panen'),
            'destroyBase' => url('panen')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/panen-react.jsx')
    @endpush
</x-app-layout>
