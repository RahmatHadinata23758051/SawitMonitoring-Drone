<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-lg text-gray-800 leading-tight">
            {{ __('Ground Control Station (GCS)') }}
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
            <!-- React Root Container -->
            <div id="react-gcs-root"></div>
        </div>
    </div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/gcs-react.jsx')
    @endpush
</x-app-layout>
