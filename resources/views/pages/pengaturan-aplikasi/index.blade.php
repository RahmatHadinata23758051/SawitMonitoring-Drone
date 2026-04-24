<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-lg text-gray-800 leading-tight">
            {{ __('Pengaturan Aplikasi') }}
        </h2>
    </x-slot>

    <div id="react-pengaturan-aplikasi-root" data-props="{{ json_encode([
        'setting' => $setting,
        'csrfToken' => csrf_token(),
        'flashSuccess' => session('success'),
        'routes' => [
            'store' => route('pengaturan-aplikasi.store')
        ]
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/pengaturan-aplikasi-react.jsx')
    @endpush
</x-app-layout>
