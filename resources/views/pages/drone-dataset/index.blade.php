<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Dataset</li>
                <li class="breadcrumb-item breadcrumb-active">Drone</li>
            </ol>
        </h2>
    </x-slot>

    <!-- React Drone Dataset Root -->
    <div id="react-drone-dataset-root" 
        data-props="{{ json_encode([
            'dataset' => $dataset,
            'csrfToken' => csrf_token(),
            'flashSuccess' => session('success'),
            'routes' => [
                'create' => route('drone-dataset.create'),
                'edit' => route('drone-dataset.edit', ['drone_dataset' => '__ID__']),
                'destroy' => route('drone-dataset.destroy', ['drone_dataset' => '__ID__'])
            ]
        ]) }}">
    </div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/drone-dataset-react.jsx')
    @endpush
</x-app-layout>
