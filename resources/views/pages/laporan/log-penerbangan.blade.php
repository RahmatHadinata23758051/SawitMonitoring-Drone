<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Laporan</li>
                <li class="breadcrumb-item breadcrumb-active">Log Penerbangan</li>
            </ol>
        </h2>
    </x-slot>

    <!-- React Log Penerbangan Root -->
    <div id="react-log-penerbangan-root" 
        data-props="{{ json_encode(compact(
            'flightLogs', 
            'totalSamples', 
            'totalMatang', 
            'totalBelum', 
            'avgAccuracy', 
            'countQlv', 
            'countTrad', 
            'filterLabel'
        )) }}">
    </div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/log-penerbangan-react.jsx')
    @endpush
</x-app-layout>
