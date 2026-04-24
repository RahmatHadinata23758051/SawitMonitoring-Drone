<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">{{ __('Data Master') }}</li>
                <li class="breadcrumb-item"><a href="{{ route('user.index') }}">Data User</a></li>
                <li class="breadcrumb-item breadcrumb-active">{{ __('Ubah Data') }}</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-user-form-root" data-props="{{ json_encode([
        'user' => $user,
        'old' => old(),
        'errors' => $errors->toArray(),
        'csrfToken' => csrf_token(),
        'routes' => [
            'update' => route('user.update', $user->id),
            'index' => route('user.index')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/user-react.jsx')
    @endpush
</x-app-layout>
