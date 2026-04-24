<x-app-layout>
    <!-- React Dashboard Root -->
    <div id="react-dashboard-root" 
        data-props="{{ json_encode(compact(
            'countLahan', 'countKebun', 'countPerangkat', 'countUser',
            'countPohon', 'countPohonMatang', 'countPohonBelumMatang',
            'lahan', 'cuaca',
            'countMissions', 'countFlightLogs', 'totalSampel', 'totalMatang', 'totalBelum',
            'avgAccuracy', 'recentFlights'
        )) }}">
    </div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/dashboard-react.jsx')
    @endpush
</x-app-layout>
