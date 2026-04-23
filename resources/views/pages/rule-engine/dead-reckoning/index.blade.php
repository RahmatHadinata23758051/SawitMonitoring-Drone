<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Rule Engine</li>
                <li class="breadcrumb-item breadcrumb-active">Dead-Reckoning</li>
            </ol>
        </h2>
    </x-slot>

    <div class="pt-6 pb-12">
        <div class="max-w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-800">Rule Engine — Dead-Reckoning</h1>
                    <p class="text-sm text-slate-500 mt-1">Aturan durasi navigasi otomatis drone berbasis waktu</p>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                    <div class="relative">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                        <input type="text" id="search-rule" placeholder="Cari rule..."
                            class="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-56 transition">
                    </div>
                    <a href="{{ route('dead-reckoning.create') }}"
                        class="inline-flex items-center gap-2 bg-primary text-white rounded-xl py-2 px-4 text-sm font-semibold hover:opacity-90 transition shadow-sm">
                        <i class="fa-solid fa-plus"></i> Tambah Rule
                    </a>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm" id="rule-table">
                        <thead>
                            <tr class="border-b border-slate-200 bg-slate-50/80">
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Aksi Drone</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Durasi</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Satuan Waktu</th>
                                <th class="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse ($rules as $rule)
                                <tr class="hover:bg-slate-50/60 transition-colors">
                                    <td class="px-5 py-4">
                                        <span class="font-mono font-bold text-primary text-sm">{{ $rule->drone_dataset->label }}</span>
                                    </td>
                                    <td class="px-5 py-4">
                                        <span class="font-mono font-black text-slate-800 text-xl">{{ $rule->durasi }}</span>
                                    </td>
                                    <td class="px-5 py-4">
                                        <span class="text-xs border border-slate-300 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full font-medium">{{ $rule->satuan_waktu }}</span>
                                    </td>
                                    <td class="px-5 py-4">
                                        <div class="flex items-center justify-end gap-2">
                                            <a href="{{ route('dead-reckoning.edit', $rule->id) }}" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white transition hover:bg-sky-600 shadow-sm">
                                                <i class="fa fa-pen text-xs"></i>
                                            </a>
                                            <form action="{{ route('dead-reckoning.destroy', $rule->id) }}" method="POST" class="delete-form" data-id="{{ $rule->id }}">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white transition hover:bg-rose-600 shadow-sm">
                                                    <i class="fa fa-trash text-xs"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="4" class="px-5 py-16 text-center text-slate-400">
                                    <i class="fa-solid fa-gears text-4xl opacity-20 block mb-3"></i>Belum ada rule dead-reckoning
                                </td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    @push('scripts')
        <script>
            window.addEventListener('load', function() {
                document.getElementById('search-rule').addEventListener('input', function() {
                    const q = this.value.toLowerCase();
                    document.querySelectorAll('#rule-table tbody tr').forEach(row => { row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none'; });
                });
                @if (session('success')) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '{{ session('success') }}', showConfirmButton: false, timer: 2500, timerProgressBar: true }); @endif
                document.querySelectorAll('.delete-form').forEach(form => {
                    form.addEventListener('submit', function(e) { e.preventDefault(); Swal.fire({ title: 'Konfirmasi', text: `Hapus rule ID ${this.dataset.id}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal' }).then(r => { if (r.isConfirmed) this.submit(); }); });
                });
            });
        </script>
    @endpush
</x-app-layout>
