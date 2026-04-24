<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Data Master</li>
                <li class="breadcrumb-item breadcrumb-active">Data Lahan</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-lahan-root" data-props="{{ json_encode([
        'lahan' => $lahan->map(fn($l) => array_merge($l->toArray(), ['kebun_count' => $l->kebun_count])),
        'csrfToken' => csrf_token(),
        'flashSuccess' => session('success'),
        'routes' => [
            'create' => route('lahan.create'),
            'editBase' => url('lahan'),
            'destroyBase' => url('lahan')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/lahan-react.jsx')
    @endpush
</x-app-layout>
