<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">{{ __('Dataset') }}</li>
                <li class="breadcrumb-item"><a href="{{ route('drone-dataset.index') }}">Drone</a></li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Tambah Dataset') }}</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-drone-dataset-form-root" data-props="{{ json_encode([
        'dataset' => null,
        'old' => old(),
        'errors' => $errors->toArray(),
        'csrfToken' => csrf_token(),
        'routes' => [
            'store' => route('drone-dataset.store'),
            'index' => route('drone-dataset.index')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/drone-dataset-react.jsx')
    @endpush
</x-app-layout>
