<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Laporan</li>
                <li class="breadcrumb-item breadcrumb-active">Log Aktivitas</li>
            </ol>
        </h2>
    </x-slot>

    <div id="react-log-aktivitas-root" data-props="{{ json_encode([
        'logs' => $logs->map(fn($l) => [
            'id' => $l->id,
            'event' => $l->event,
            'description' => $l->description,
            'causer_name' => $l->causer?->name,
            'created_at' => $l->created_at?->toIso8601String()
        ])
    ]) }}"></div>

    @push('scripts')
        @viteReactRefresh
        @vite('resources/js/log-aktivitas-react.jsx')
    @endpush
</x-app-layout>
