<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Rule Engine</li>
                <li class="breadcrumb-item breadcrumb-active">Dead-Reckoning</li>
            </ol>
        </h2>
    </x-slot>

    {{-- ======================= MODAL QUICK-ADD ======================= --}}
    <div id="modal-add" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/40 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-scale-in">
            <div class="flex items-center justify-between mb-5">
                <h3 class="text-lg font-black text-slate-800">Tambah Instruksi</h3>
                <button id="modal-close" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <form id="form-add-rule">
                <div class="flex flex-col gap-4">
                    {{-- Aksi --}}
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1.5">Aksi Drone</label>
                        <select name="aksi" id="quick-aksi" required
                            class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                            <option value="">-- Pilih Aksi --</option>
                            @foreach ($aksi as $a)
                                <option value="{{ $a->id }}">{{ $a->label }}</option>
                            @endforeach
                        </select>
                    </div>
                    {{-- Durasi --}}
                    <div class="flex gap-3">
                        <div class="flex-1">
                            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Durasi</label>
                            <input type="number" name="durasi" id="quick-durasi" min="0.1" step="0.1" placeholder="3" required
                                class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                        </div>
                        <div class="flex-1">
                            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Satuan</label>
                            <select name="satuan_waktu" id="quick-satuan" required
                                class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                                <option value="detik" selected>Detik</option>
                                <option value="menit">Menit</option>
                                <option value="milidetik">Milidetik</option>
                            </select>
                        </div>
                    </div>
                    {{-- Error --}}
                    <div id="quick-error" class="hidden text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"></div>
                    {{-- Submit --}}
                    <button type="submit" id="btn-quick-submit"
                        class="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                        <i class="fa-solid fa-plus"></i> Tambah Instruksi
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div class="pt-6 pb-12">
        <div class="max-w-full mx-auto px-6 lg:px-10 flex flex-col gap-6">

            {{-- Header --}}
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-800">Rule Engine — Dead-Reckoning</h1>
                    <p class="text-sm text-slate-500 mt-1">
                        Atur urutan navigasi otomatis drone. Drag <i class="fa-solid fa-grip-vertical text-xs"></i> untuk reorder.
                    </p>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                    <div class="relative">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                        <input type="text" id="search-rule" placeholder="Cari rule..."
                            class="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-48 transition">
                    </div>
                    <button id="btn-run-mission"
                        class="inline-flex items-center gap-2 bg-emerald-600 text-white rounded-xl py-2 px-4 text-sm font-semibold hover:bg-emerald-700 transition shadow-sm">
                        <i class="fa-solid fa-rocket"></i> Jalankan Misi
                    </button>
                    <button id="btn-open-modal"
                        class="inline-flex items-center gap-2 bg-primary text-white rounded-xl py-2 px-4 text-sm font-semibold hover:opacity-90 transition shadow-sm">
                        <i class="fa-solid fa-plus"></i> Tambah Rule
                    </button>
                </div>
            </div>

            {{-- Tabel --}}
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm" id="rule-table">
                        <thead>
                            <tr class="border-b border-slate-200 bg-slate-50/80">
                                <th class="w-10 px-3 py-3.5 text-slate-300"><i class="fa-solid fa-grip-vertical text-xs"></i></th>
                                <th class="text-left px-3 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-widest w-10">#</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Aksi Drone</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Durasi</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Satuan</th>
                                <th class="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="sortable-body" class="divide-y divide-slate-100">
                            @forelse ($rules as $index => $rule)
                                <tr class="rule-row hover:bg-slate-50/60 transition-colors"
                                    data-id="{{ $rule->id }}"
                                    style="cursor: default;">
                                    <td class="px-3 py-4 text-slate-300 drag-handle" style="cursor: grab;">
                                        <i class="fa-solid fa-grip-vertical text-base"></i>
                                    </td>
                                    <td class="px-3 py-4">
                                        <span class="step-number text-xs font-bold text-slate-400 bg-slate-100 rounded-full inline-flex w-6 h-6 items-center justify-center">
                                            {{ $index + 1 }}
                                        </span>
                                    </td>
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
                                            <a href="{{ route('dead-reckoning.edit', $rule->id) }}"
                                                class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition shadow-sm">
                                                <i class="fa fa-pen text-xs"></i>
                                            </a>
                                            <button type="button"
                                                class="btn-delete inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition shadow-sm"
                                                data-id="{{ $rule->id }}"
                                                data-label="{{ $rule->drone_dataset->label }}"
                                                data-url="{{ route('dead-reckoning.destroyAjax', $rule->id) }}">
                                                <i class="fa fa-trash text-xs"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr id="empty-row">
                                    <td colspan="6" class="px-5 py-16 text-center text-slate-400">
                                        <i class="fa-solid fa-gears text-4xl opacity-20 block mb-3"></i>
                                        Belum ada rule. Klik <b>Tambah Rule</b> untuk memulai.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js"></script>
    <style>
        .sortable-ghost { opacity: 0.4; background: #f0f9ff; }
        .sortable-chosen { box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
        .sortable-drag { opacity: 1 !important; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scaleIn 0.15s ease-out; }
    </style>
    <script>
    window.addEventListener('load', function () {
        const CSRF = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // ===== FLASH SUCCESS =====
        @if (session('success'))
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '{{ session('success') }}', showConfirmButton: false, timer: 2500, timerProgressBar: true });
        @endif

        // ===== LIVE SEARCH =====
        document.getElementById('search-rule').addEventListener('input', function () {
            const q = this.value.toLowerCase();
            document.querySelectorAll('#sortable-body .rule-row').forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
        });

        // ===== DRAG & DROP (SortableJS) =====
        const tbody = document.getElementById('sortable-body');
        Sortable.create(tbody, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: async function () {
                renumberSteps();
                const ids = Array.from(document.querySelectorAll('#sortable-body .rule-row')).map(r => r.dataset.id);
                try {
                    await fetch('{{ route('dead-reckoning.reorder') }}', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF, 'Accept': 'application/json' },
                        body: JSON.stringify({ ids }),
                    });
                } catch (e) { console.warn('Reorder gagal:', e); }
            },
        });

        // ===== RENUMBER + EMPTY CHECK =====
        function renumberSteps() {
            document.querySelectorAll('#sortable-body .rule-row').forEach((row, i) => {
                const badge = row.querySelector('.step-number');
                if (badge) badge.textContent = i + 1;
            });
        }

        function checkEmpty() {
            if (!document.querySelector('#sortable-body .rule-row')) {
                document.getElementById('sortable-body').innerHTML =
                    `<tr id="empty-row"><td colspan="6" class="px-5 py-16 text-center text-slate-400">
                        <i class="fa-solid fa-gears text-4xl opacity-20 block mb-3"></i>Belum ada rule. Klik <b>Tambah Rule</b> untuk memulai.</td></tr>`;
            }
        }

        // ===== AJAX DELETE =====
        function bindDeleteButtons() {
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.onclick = async function () {
                    const row = this.closest('tr');
                    const label = this.dataset.label;
                    const url = this.dataset.url;

                    const ok = await Swal.fire({
                        title: 'Hapus Rule?',
                        html: `Step <b>${label}</b> akan dihapus.`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Hapus',
                        cancelButtonText: 'Batal',
                        confirmButtonColor: '#e11d48',
                    });
                    if (!ok.isConfirmed) return;

                    row.style.transition = 'opacity 0.2s, transform 0.2s';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(16px)';

                    const res = await fetch(url, {
                        method: 'DELETE',
                        headers: { 'X-CSRF-TOKEN': CSRF, 'Accept': 'application/json' },
                    });

                    if (res.ok) {
                        setTimeout(() => { row.remove(); renumberSteps(); checkEmpty(); }, 220);
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Dihapus', showConfirmButton: false, timer: 1500 });
                    } else {
                        row.style.opacity = '1'; row.style.transform = '';
                        Swal.fire({ icon: 'error', title: 'Gagal hapus', text: 'Coba lagi.' });
                    }
                };
            });
        }
        bindDeleteButtons();

        // ===== MODAL QUICK-ADD =====
        const modal    = document.getElementById('modal-add');
        const btnOpen  = document.getElementById('btn-open-modal');
        const btnClose = document.getElementById('modal-close');
        const form     = document.getElementById('form-add-rule');
        const errBox   = document.getElementById('quick-error');
        const btnSubmit= document.getElementById('btn-quick-submit');

        function openModal() {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.getElementById('quick-aksi').focus();
        }
        function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            form.reset();
            errBox.classList.add('hidden');
        }

        btnOpen.addEventListener('click', openModal);
        btnClose.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            errBox.classList.add('hidden');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

            const data = {
                aksi: document.getElementById('quick-aksi').value,
                durasi: document.getElementById('quick-durasi').value,
                satuan_waktu: document.getElementById('quick-satuan').value,
            };

            try {
                const res  = await fetch('{{ route('dead-reckoning.storeAjax') }}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF, 'Accept': 'application/json' },
                    body: JSON.stringify(data),
                });
                const json = await res.json();

                if (res.ok && json.ok) {
                    // Tambah row baru ke tabel
                    const emptyRow = document.getElementById('empty-row');
                    if (emptyRow) emptyRow.remove();

                    const newCount = document.querySelectorAll('#sortable-body .rule-row').length + 1;
                    const tr = document.createElement('tr');
                    tr.className = 'rule-row hover:bg-slate-50/60 transition-colors';
                    tr.dataset.id = json.id;
                    tr.style.opacity = '0';
                    tr.style.transform = 'translateY(-8px)';
                    tr.style.transition = 'opacity 0.25s, transform 0.25s';
                    tr.innerHTML = `
                        <td class="px-3 py-4 text-slate-300 drag-handle" style="cursor:grab;">
                            <i class="fa-solid fa-grip-vertical text-base"></i>
                        </td>
                        <td class="px-3 py-4">
                            <span class="step-number text-xs font-bold text-slate-400 bg-slate-100 rounded-full inline-flex w-6 h-6 items-center justify-center">${newCount}</span>
                        </td>
                        <td class="px-5 py-4"><span class="font-mono font-bold text-primary text-sm">${json.label}</span></td>
                        <td class="px-5 py-4"><span class="font-mono font-black text-slate-800 text-xl">${json.durasi}</span></td>
                        <td class="px-5 py-4"><span class="text-xs border border-slate-300 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full font-medium">${json.satuan}</span></td>
                        <td class="px-5 py-4">
                            <div class="flex items-center justify-end gap-2">
                                <a href="${json.edit_url}" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition shadow-sm">
                                    <i class="fa fa-pen text-xs"></i>
                                </a>
                                <button type="button" class="btn-delete inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition shadow-sm"
                                    data-id="${json.id}" data-label="${json.label}" data-url="${json.delete_url}">
                                    <i class="fa fa-trash text-xs"></i>
                                </button>
                            </div>
                        </td>`;
                    tbody.appendChild(tr);

                    // Animasi masuk
                    requestAnimationFrame(() => {
                        tr.style.opacity = '1';
                        tr.style.transform = 'translateY(0)';
                    });

                    // Re-bind delete pada row baru
                    bindDeleteButtons();
                    closeModal();
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Instruksi ditambahkan!', showConfirmButton: false, timer: 1500 });
                } else {
                    const errors = json.errors ? Object.values(json.errors).flat().join(' ') : (json.message || 'Gagal menyimpan.');
                    errBox.textContent = errors;
                    errBox.classList.remove('hidden');
                }
            } catch (err) {
                errBox.textContent = 'Koneksi gagal: ' + err.message;
                errBox.classList.remove('hidden');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="fa-solid fa-plus"></i> Tambah Instruksi';
            }
        });

        // ===== JALANKAN MISI =====
        document.getElementById('btn-run-mission').addEventListener('click', async function () {
            const btn  = this;
            const rows = document.querySelectorAll('#sortable-body .rule-row');

            if (rows.length === 0) {
                Swal.fire({ icon: 'warning', title: 'Tidak Ada Rule', text: 'Tambah minimal satu instruksi.' });
                return;
            }

            const conf = await Swal.fire({
                title: '🚀 Jalankan Misi?',
                html: `Drone akan mengeksekusi <b>${rows.length}</b> instruksi berurutan.<br><small class="text-slate-500">Pastikan area terbang aman!</small>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Jalankan!',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#059669',
            });
            if (!conf.isConfirmed) return;

            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengeksekusi...';

            try {
                const seqRes  = await fetch('/api/dead-reckoning/sequence');
                const seqData = await seqRes.json();

                if (!seqData.sequence?.length) {
                    Swal.fire({ icon: 'warning', title: 'Tidak ada rule.' });
                    return;
                }

                const execRes  = await fetch('http://127.0.0.1:3001/execute-sequence', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sequence: seqData.sequence }),
                });
                const execData = await execRes.json();

                execRes.ok
                    ? Swal.fire({ icon: 'success', title: 'Misi Dimulai!', text: `${execData.steps} instruksi dieksekusi.`, timer: 3000, timerProgressBar: true, showConfirmButton: false })
                    : Swal.fire({ icon: 'error', title: 'Gagal', text: execData.error || 'Server drone tidak merespon.' });
            } catch {
                Swal.fire({ icon: 'error', title: 'Koneksi Gagal', text: 'Pastikan Node.js drone server (port 3001) berjalan.' });
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-rocket"></i> Jalankan Misi';
            }
        });
    });
    </script>
    @endpush
</x-app-layout>
