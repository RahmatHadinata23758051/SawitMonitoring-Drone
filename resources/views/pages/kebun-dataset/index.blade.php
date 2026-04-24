<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Dataset</li>
                <li class="breadcrumb-item breadcrumb-active">Kebun</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-kebun-dataset-root" data-props="{{ json_encode([
        'dataset' => $dataset->load('kebun'),
        'csrfToken' => csrf_token(),
        'flashSuccess' => session('success'),
        'routes' => [
            'create' => route('kebun-dataset.create'),
            'editBase' => url('dataset/kebun'),
            'destroyBase' => url('dataset/kebun')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/kebun-dataset-react.jsx')
    @endpush
</x-app-layout>
