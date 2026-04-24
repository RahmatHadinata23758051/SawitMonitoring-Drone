<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Laporan</li>
                <li class="breadcrumb-item breadcrumb-active">Prediksi Kematangan AI</li>
            </ol>
        </h2>
    </x-slot>

    <!-- React Laporan AI Root -->
    <div id="react-laporan-ai-root" 
        data-props="{{ json_encode(compact('laporan', 'flightLogs', 'flightLogSummary')) }}">
    </div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/laporan-ai-react.jsx')
    @endpush
</x-app-layout>
