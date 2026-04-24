<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">{{ __('Dataset') }}</li>
                <li class="breadcrumb-item"><a href="{{ route('kebun-dataset.index') }}">Kebun</a></li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Ubah Dataset') }}</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-kebun-dataset-form-root" data-props="{{ json_encode([
        'dataset' => $dataset,
        'kebuns' => $kebuns,
        'old' => old(),
        'errors' => $errors->toArray(),
        'csrfToken' => csrf_token(),
        'routes' => [
            'update' => route('kebun-dataset.update', $dataset->id),
            'index' => route('kebun-dataset.index')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/kebun-dataset-react.jsx')
    @endpush
</x-app-layout>
