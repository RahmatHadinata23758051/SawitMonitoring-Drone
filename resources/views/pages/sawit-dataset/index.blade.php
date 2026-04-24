<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Dataset</li>
                <li class="breadcrumb-item breadcrumb-active">Sawit</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-sawit-dataset-root" data-props="{{ json_encode([
        'dataset' => $dataset,
        'csrfToken' => csrf_token(),
        'flashSuccess' => session('success'),
        'routes' => [
            'create' => route('sawit-dataset.create'),
            'editBase' => url('dataset/sawit'),
            'destroyBase' => url('dataset/sawit')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/sawit-dataset-react.jsx')
    @endpush
</x-app-layout>
