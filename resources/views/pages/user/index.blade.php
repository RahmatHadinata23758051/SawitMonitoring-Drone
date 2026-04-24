<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Data Master</li>
                <li class="breadcrumb-item breadcrumb-active">Data User</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-user-root" data-props="{{ json_encode([
        'user' => $user,
        'csrfToken' => csrf_token(),
        'flashSuccess' => session('success'),
        'routes' => [
            'create' => route('user.create'),
            'editBase' => url('user'),
            'destroyBase' => url('user')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/user-react.jsx')
    @endpush
</x-app-layout>
