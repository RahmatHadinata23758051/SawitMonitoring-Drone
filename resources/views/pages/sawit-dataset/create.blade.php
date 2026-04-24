<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">{{ __('Dataset') }}</li>
                <li class="breadcrumb-item"><a href="{{ route('sawit-dataset.index') }}">Sawit</a></li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Tambah Dataset') }}</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-sawit-dataset-form-root" data-props="{{ json_encode([
        'dataset' => null,
        'old' => old(),
        'errors' => $errors->toArray(),
        'csrfToken' => csrf_token(),
        'routes' => [
            'store' => route('sawit-dataset.store'),
            'index' => route('sawit-dataset.index')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/sawit-dataset-react.jsx')
    @endpush
</x-app-layout>
