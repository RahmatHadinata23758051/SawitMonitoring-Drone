<x-app-layout>
    <x-slot name="header">
        <h2 class="leading-tight">
            <ol class="breadcrumb">
                <li class="breadcrumb-item">Rule Engine</li>
                <li class="breadcrumb-item breadcrumb-active">Dead-Reckoning</li>
            </ol>
        </h2>
    </x-slot>

    {{-- ===== MODAL ADD / EDIT ===== --}}
    <div id="modal-rule" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
            {{-- Header modal --}}
            <div id="modal-header" class="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <div class="flex items-center gap-3">
                    <div id="modal-icon" class="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                        <i class="fa-solid fa-plus text-sm"></i>
                    </div>
                    <div>
                        <h3 id="modal-title" class="text-base font-black text-slate-800">Tambah Instruksi</h3>
                        <p id="modal-subtitle" class="text-xs text-slate-400">Pilih aksi drone dan durasi waktu</p>
                    </div>
                </div>
                <button id="modal-close" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            {{-- Body modal --}}
            <form id="form-rule" class="px-6 py-5 flex flex-col gap-4">
                <input type="hidden" id="rule-id" value="">
                <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Aksi Drone</label>
                    <select id="f-aksi" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                        <option value="">-- Pilih Aksi --</option>
                        @foreach ($aksi as $a)
                            <option value="{{ $a->id }}">{{ $a->label }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="flex gap-3">
                    <div class="flex-1">
                        <label class="block text-xs font-semibold text-slate-600 mb-1.5">Durasi</label>
                        <input type="number" id="f-durasi" min="0.1" step="0.1" placeholder="3" required
                            class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                    </div>
                    <div class="flex-1">
                        <label class="block text-xs font-semibold text-slate-600 mb-1.5">Satuan Waktu</label>
                        <select id="f-satuan" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                            <option value="detik" selected>Detik</option>
                            <option value="menit">Menit</option>
                            <option value="milidetik">Milidetik</option>
                        </select>
                    </div>
                </div>
                <div id="form-error" class="hidden text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"></div>
                <div class="flex gap-2 pt-1">
                    <button type="button" id="modal-btn-cancel" class="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Batal</button>
                    <button type="submit" id="modal-btn-submit" class="flex-1 rounded-xl bg-primary text-white py-2.5 text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                        <i class="fa-solid fa-plus"></i> <span id="modal-btn-submit-text">Tambah</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div class="pt-6 pb-12">
        <div class="max-w-full mx-auto px-6 lg:px-10 flex flex-col gap-5">

            {{-- Page Header --}}
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-800">Rule Engine — Dead-Reckoning</h1>
                    <p class="text-sm text-slate-500 mt-1">Susun instruksi navigasi otomatis drone. <i class="fa-solid fa-grip-vertical text-xs"></i> Drag untuk reorder.</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <div class="relative">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                        <input type="text" id="search-rule" placeholder="Cari..."
                            class="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-40 transition">
                    </div>
                    <button id="btn-run"
                        class="inline-flex items-center gap-2 bg-emerald-600 text-white rounded-xl py-2 px-4 text-sm font-semibold hover:bg-emerald-700 transition shadow-sm">
                        <i class="fa-solid fa-rocket"></i> Jalankan Misi
                    </button>
                    <button id="page-btn-add"
                        class="inline-flex items-center gap-2 bg-primary text-white rounded-xl py-2 px-4 text-sm font-semibold hover:opacity-90 transition shadow-sm">
                        <i class="fa-solid fa-plus"></i> Tambah Rule
                    </button>
                </div>
            </div>

            {{-- Table --}}
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-slate-200 bg-slate-50/80">
                                <th class="w-10 px-3 py-3.5 text-slate-300"><i class="fa-solid fa-grip-vertical text-xs"></i></th>
                                <th class="w-10 px-3 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-widest text-left">#</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Aksi Drone</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Durasi</th>
                                <th class="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Satuan</th>
                                <th class="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="rule-body" class="divide-y divide-slate-100">
                            @forelse ($rules as $i => $rule)
                                @include('pages.rule-engine.dead-reckoning._row', ['rule' => $rule, 'i' => $i])
                            @empty
                                <tr id="empty-row">
                                    <td colspan="6" class="px-5 py-16 text-center text-slate-400">
                                        <i class="fa-solid fa-list-check text-4xl opacity-20 block mb-3"></i>
                                        Belum ada instruksi. Klik <b>Tambah Rule</b> untuk memulai.
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
        .sortable-ghost  { opacity:.35; background:#eff6ff; }
        .sortable-chosen { box-shadow:0 8px 30px rgba(0,0,0,.12); background:#fff; }
        @@keyframes scaleIn { from{opacity:0;transform:scale(.96) translateY(-6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .animate-scale-in { animation: scaleIn .16s ease-out; }
    </style>
    <script>
    (function() {
        const CSRF = '{{ csrf_token() }}';

        /* ──────── Modern Toast (React/Sonner Style) ──────── */
        function showModernToast(title, desc = '') {
            const t = document.createElement('div');
            t.className = 'fixed bottom-6 right-6 z-[9999] bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl p-4 flex items-start gap-3 transform translate-y-12 opacity-0 transition-all duration-300 w-80 font-sans';
            t.innerHTML = `
                <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-bold text-slate-800">${title}</h4>
                    ${desc ? `<p class="text-xs text-slate-500 mt-1">${desc}</p>` : ''}
                </div>
                <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            `;
            document.body.appendChild(t);
            requestAnimationFrame(() => { t.style.transform = 'translateY(0)'; t.style.opacity = '1'; });
            setTimeout(() => {
                t.style.transform = 'translateY(12px)'; t.style.opacity = '0';
                setTimeout(() => t.remove(), 300);
            }, 3500);
        }

        /* ──────── Flash ──────── */
        @if(session('success'))
        showModernToast('Berhasil', '{{ session('success') }}');
        @endif

        /* ──────── Search ──────── */
        document.getElementById('search-rule').addEventListener('input', function(){
            const q = this.value.toLowerCase();
            document.querySelectorAll('#rule-body .rule-row').forEach(r => {
                r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
        });

        /* ──────── Renumber & Empty ──────── */
        function renumber() {
            document.querySelectorAll('#rule-body .rule-row').forEach((r,i) => {
                const b = r.querySelector('.step-no'); if(b) b.textContent = i+1;
            });
        }
        function checkEmpty() {
            if (!document.querySelector('#rule-body .rule-row'))
                document.getElementById('rule-body').innerHTML =
                `<tr id="empty-row"><td colspan="6" class="px-5 py-16 text-center text-slate-400">
                 <i class="fa-solid fa-list-check text-4xl opacity-20 block mb-3"></i>
                 Belum ada instruksi. Klik <b>Tambah Rule</b> untuk memulai.</td></tr>`;
        }

        /* ──────── SortableJS ──────── */
        if (typeof Sortable !== 'undefined') {
            Sortable.create(document.getElementById('rule-body'), {
                handle: '.drag-handle', animation: 150,
                ghostClass: 'sortable-ghost', chosenClass: 'sortable-chosen',
                onEnd: async () => {
                    renumber();
                    const ids = [...document.querySelectorAll('#rule-body .rule-row')].map(r=>r.dataset.id);
                    await fetch('{{ route('dead-reckoning.reorder') }}', {
                        method:'POST',
                        headers:{'Content-Type':'application/json','X-CSRF-TOKEN':CSRF,'Accept':'application/json'},
                        body: JSON.stringify({ids}),
                    }).catch(e=>console.warn('Reorder err:',e));
                },
            });
        } else {
            console.warn('SortableJS library tidak termuat, drag-and-drop dinonaktifkan.');
        }

        /* ──────── Bind semua tombol (delete + edit) ──────── */
        function bindButtons() {
            /* Delete */
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.onclick = async function() {
                    const row   = this.closest('tr');
                    const label = this.dataset.label;
                    const url   = this.dataset.url;

                    const res = await new Promise(resolve => {
                        Swal.fire({
                            html: `
                            <div class="p-2 text-left font-sans">
                                <div class="flex items-center gap-3 mb-4">
                                    <div class="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                        <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                    </div>
                                    <h2 class="text-xl font-bold text-slate-800">Hapus Instruksi?</h2>
                                </div>
                                <p class="text-sm text-slate-500 mb-6 leading-relaxed">Tindakan ini tidak dapat dibatalkan. Instruksi <span class="font-bold text-slate-900">${label}</span> akan dihapus permanen dari urutan misi.</p>
                                
                                <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
                                    <button id="swal-del-cancel" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition focus:outline-none">Batal</button>
                                    <button id="swal-del-confirm" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition shadow-md focus:outline-none">Ya, Hapus</button>
                                </div>
                            </div>`,
                            showConfirmButton: false,
                            padding: '1.25rem',
                            width: '26rem',
                            customClass: { popup: 'rounded-2xl border border-slate-100 shadow-2xl' },
                            didOpen: () => {
                                document.getElementById('swal-del-cancel').onclick = () => { Swal.close(); resolve(false); };
                                document.getElementById('swal-del-confirm').onclick = () => { Swal.close(); resolve(true); };
                            }
                        });
                    });
                    if (!res) return;

                    row.style.transition = 'opacity .2s,transform .2s';
                    row.style.opacity = '0'; row.style.transform = 'translateX(16px)';

                    const r = await fetch(url, { method:'DELETE', headers:{'X-CSRF-TOKEN':CSRF,'Accept':'application/json'} });
                    if (r.ok) {
                        setTimeout(() => { row.remove(); renumber(); checkEmpty(); }, 220);
                        showModernToast('Instruksi dihapus', `Instruksi ${label} berhasil dihapus.`);
                    } else {
                        row.style.opacity = '1'; row.style.transform = '';
                        let errMsg = 'Terjadi kesalahan. Coba lagi.';
                        try {
                            const json = await r.json();
                            if (json && json.message) errMsg = json.message;
                        } catch(_) {}
                        Swal.fire({ icon:'error', title:'Gagal Menghapus', text: errMsg, customClass:{popup:'rounded-2xl'} });
                    }
                };
            });

            /* Edit — onclick langsung (lebih reliable dari delegation) */
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.onclick = function() {
                    openModal('edit', {
                        id:      this.dataset.id,
                        aksi_id: this.dataset.aksiId,
                        durasi:  this.dataset.durasi,
                        satuan:  this.dataset.satuan,
                    });
                };
            });
        }
        bindButtons();

        const modal   = document.getElementById('modal-rule');
        const ruleId  = document.getElementById('rule-id');
        const fAksi   = document.getElementById('f-aksi');
        const fDurasi = document.getElementById('f-durasi');
        const fSatuan = document.getElementById('f-satuan');
        const errBox  = document.getElementById('form-error');
        const btnSub  = document.getElementById('modal-btn-submit');
        const subTxt  = document.getElementById('modal-btn-submit-text');

        function openModal(mode = 'add', data = {}) {
            if (ruleId) ruleId.value  = data.id || '';
            if (fAksi) fAksi.value   = data.aksi_id || '';
            if (fDurasi) fDurasi.value = data.durasi || '';
            if (fSatuan) fSatuan.value = data.satuan || 'detik';
            if (errBox) errBox.classList.add('hidden');

            const isEdit = mode === 'edit';
            
            const mTitle = document.getElementById('modal-title');
            if (mTitle) mTitle.textContent = isEdit ? 'Edit Instruksi' : 'Tambah Instruksi';
            
            const mSubtitle = document.getElementById('modal-subtitle');
            if (mSubtitle) mSubtitle.textContent = isEdit ? 'Ubah aksi atau durasi' : 'Pilih aksi drone dan durasi waktu';
            
            const mIcon = document.getElementById('modal-icon');
            if (mIcon) {
                mIcon.innerHTML = isEdit ? '<i class="fa-solid fa-pen text-sm"></i>' : '<i class="fa-solid fa-plus text-sm"></i>';
                mIcon.className = isEdit
                    ? 'w-9 h-9 rounded-xl flex items-center justify-center bg-sky-100 text-sky-600'
                    : 'w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary';
            }
            
            if (subTxt) subTxt.textContent  = isEdit ? 'Simpan Perubahan' : 'Tambah';
            
            if (btnSub) {
                btnSub.className = isEdit
                    ? 'flex-1 rounded-xl bg-sky-600 text-white py-2.5 text-sm font-semibold hover:bg-sky-700 transition flex items-center justify-center gap-2'
                    : 'flex-1 rounded-xl bg-primary text-white py-2.5 text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2';
                const iEl = btnSub.querySelector('i');
                if (iEl) iEl.className = isEdit ? 'fa-solid fa-floppy-disk' : 'fa-solid fa-plus';
            }

            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            if (fAksi) setTimeout(() => fAksi.focus(), 50);
        }

        function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.getElementById('form-rule').reset();
            errBox.classList.add('hidden');
        }

        document.getElementById('page-btn-add').addEventListener('click', () => openModal('add'));
        document.getElementById('modal-btn-cancel').addEventListener('click', closeModal);
        document.getElementById('modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', e => { if(e.target===modal) closeModal(); });
        document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

        /* ──────── Modal Add / Edit ──────── */
        /* Form submit (Add & Edit) */
        document.getElementById('form-rule').addEventListener('submit', async function(e) {
            e.preventDefault();
            if (errBox) errBox.classList.add('hidden');
            
            let origHTML = '';
            if (btnSub) {
                btnSub.disabled = true;
                origHTML = btnSub.innerHTML;
                btnSub.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
            }

            const id      = ruleId ? ruleId.value : '';
            const isEdit  = !!id;
            const payload = { 
                aksi: fAksi ? fAksi.value : '', 
                durasi: fDurasi ? fDurasi.value : '', 
                satuan_waktu: fSatuan ? fSatuan.value : 'detik' 
            };

            const url    = isEdit
                ? `/rule-engine/dead-reckoning/${id}/ajax`
                : '{{ route('dead-reckoning.storeAjax') }}';
            const method = isEdit ? 'PUT' : 'POST';

            try {
                const res  = await fetch(url, {
                    method,
                    headers:{'Content-Type':'application/json','X-CSRF-TOKEN':CSRF,'Accept':'application/json'},
                    body: JSON.stringify(payload),
                });
                const json = await res.json();

                if (res.ok && json.ok) {
                    if (isEdit) {
                        /* Update baris yg sudah ada */
                        const row = document.querySelector(`.rule-row[data-id="${id}"]`);
                        if (row) {
                            const lbl = row.querySelector('.cell-label'); if(lbl) lbl.textContent = json.label;
                            const dur = row.querySelector('.cell-durasi'); if(dur) dur.textContent = json.durasi;
                            const sat = row.querySelector('.cell-satuan'); if(sat) sat.textContent = json.satuan;
                            /* update data attr tombol edit */
                            const editBtn = row.querySelector('.btn-edit');
                            if (editBtn) {
                                editBtn.dataset.aksiId = payload.aksi;
                                editBtn.dataset.durasi = json.durasi;
                                editBtn.dataset.satuan = json.satuan;
                            }
                            row.style.transition = 'background .4s';
                            row.style.background = '#f0fdf4';
                            setTimeout(()=>row.style.background='', 600);
                        }
                    } else {
                        /* Tambah baris baru */
                        const empty = document.getElementById('empty-row');
                        if (empty) empty.remove();
                        const ruleBody = document.getElementById('rule-body');
                        if (ruleBody) {
                            const count = document.querySelectorAll('#rule-body .rule-row').length + 1;
                            const tr = document.createElement('tr');
                            tr.className = 'rule-row hover:bg-slate-50/60 transition-colors';
                            tr.dataset.id = json.id;
                            tr.style.cssText = 'opacity:0;transform:translateY(-6px);transition:opacity .25s,transform .25s';
                            tr.innerHTML = rowHtml(json, count);
                            ruleBody.appendChild(tr);
                            requestAnimationFrame(()=>{ tr.style.opacity='1'; tr.style.transform='translateY(0)'; });
                            bindButtons();
                        }
                    }
                    closeModal();
                    showModernToast(isEdit ? 'Perubahan Disimpan' : 'Instruksi Ditambahkan', `Misi telah berhasil diperbarui.`);
                } else {
                    const msg = json.errors ? Object.values(json.errors).flat().join(' ') : (json.message || 'Gagal menyimpan.');
                    if (errBox) { errBox.textContent = msg; errBox.classList.remove('hidden'); }
                    else alert(msg);
                }
            } catch(err) {
                if (errBox) { errBox.textContent = 'Koneksi gagal: ' + err.message; errBox.classList.remove('hidden'); }
                else alert('Koneksi gagal: ' + err.message);
            } finally {
                if (btnSub) {
                    btnSub.disabled = false;
                    btnSub.innerHTML = origHTML;
                }
            }
        });

        function rowHtml(json, count) {
            return `
            <td class="px-3 py-4 text-slate-300 drag-handle" style="cursor:grab">
                <i class="fa-solid fa-grip-vertical text-base"></i></td>
            <td class="px-3 py-4">
                <span class="step-no text-xs font-bold text-slate-400 bg-slate-100 rounded-full inline-flex w-6 h-6 items-center justify-center">${count}</span></td>
            <td class="px-5 py-4"><span class="cell-label font-mono font-bold text-primary text-sm">${json.label}</span></td>
            <td class="px-5 py-4"><span class="cell-durasi font-mono font-black text-slate-800 text-xl">${json.durasi}</span></td>
            <td class="px-5 py-4"><span class="cell-satuan text-xs border border-slate-300 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full font-medium">${json.satuan}</span></td>
            <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-2">
                    <button type="button" class="btn-edit inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition shadow-sm"
                        data-id="${json.id}" data-aksi-id="" data-durasi="${json.durasi}" data-satuan="${json.satuan}" title="Edit">
                        <i class="fa fa-pen text-xs"></i></button>
                    <button type="button" class="btn-delete inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition shadow-sm"
                        data-id="${json.id}" data-label="${json.label}" data-url="${json.delete_url}" title="Hapus">
                        <i class="fa fa-trash text-xs"></i></button>
                </div></td>`;
        }

        /* ──────── Jalankan Misi ──────── */
        document.getElementById('btn-run').addEventListener('click', async function() {
            const btn  = this;
            const rows = document.querySelectorAll('#rule-body .rule-row');
            if (!rows.length) {
                return Swal.fire({
                    icon:'warning', title:'Tidak Ada Instruksi',
                    text:'Tambah minimal satu instruksi sebelum menjalankan misi.',
                    customClass:{popup:'rounded-2xl', confirmButton:'rounded-xl px-5'},
                });
            }

            /* Hitung estimasi total durasi */
            let totalSec = 0;
            rows.forEach(r => {
                const dur = parseFloat(r.querySelector('.cell-durasi')?.textContent || 0);
                const sat = r.querySelector('.cell-satuan')?.textContent || 'detik';
                totalSec += sat === 'menit' ? dur*60 : sat === 'milidetik' ? dur/1000 : dur;
            });
            const estLabel = totalSec >= 60 ? `±${(totalSec/60).toFixed(1)} menit` : `±${Math.round(totalSec)} detik`;

            const conf = await new Promise(resolve => {
                Swal.fire({
                    html: `
                    <div class="p-2 text-left font-sans">
                        <div class="flex items-center gap-3 mb-5">
                            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            </div>
                            <h2 class="text-xl font-bold text-slate-800">Konfirmasi Penerbangan</h2>
                        </div>
                        <p class="text-sm text-slate-500 mb-6 leading-relaxed">Tinjau kembali parameter misi sebelum drone diterbangkan. Pastikan area sekitar aman dari rintangan.</p>
                        
                        <div class="space-y-3 mb-8">
                            <div class="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-3.5 rounded-xl">
                                <div class="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                                    <span>Total Instruksi</span>
                                </div>
                                <span class="font-bold text-slate-800">${rows.length} langkah</span>
                            </div>
                            <div class="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-3.5 rounded-xl">
                                <div class="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    <span>Estimasi Durasi</span>
                                </div>
                                <span class="font-bold text-slate-800">${estLabel}</span>
                            </div>
                        </div>

                        <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
                            <button id="swal-btn-cancel" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition focus:outline-none">Batal</button>
                            <button id="swal-btn-deploy" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition shadow-md flex items-center gap-2 focus:outline-none">
                                Jalankan Misi
                            </button>
                        </div>
                    </div>`,
                    showConfirmButton: false,
                    showCloseButton: false,
                    padding: '1.25rem',
                    width: '28rem',
                    customClass: { popup: 'rounded-2xl border border-slate-100 shadow-2xl overflow-hidden' },
                    didOpen: () => {
                        document.getElementById('swal-btn-cancel').onclick = () => { Swal.close(); resolve(false); };
                        document.getElementById('swal-btn-deploy').onclick = () => { Swal.close(); resolve(true); };
                    }
                });
            });
            if (!conf) return;

            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengeksekusi...';

            try {
                const seqRes  = await fetch('/api/dead-reckoning/sequence');
                const seqData = await seqRes.json();
                if (!seqData.sequence?.length) {
                    return Swal.fire({ icon:'warning', title:'Tidak ada sequence.', customClass:{popup:'rounded-2xl'} });
                }
                // Gunakan proxy Laravel agar tidak hardcode port 3001
                const execRes  = await fetch('/drone/execute-sequence', {
                    method:'POST',
                    headers:{'Content-Type':'application/json', 'X-CSRF-TOKEN': CSRF},
                    body: JSON.stringify({ sequence: seqData.sequence }),
                });
                const execData = await execRes.json();
                execRes.ok
                    ? Swal.fire({ icon:'success', title:'Misi Dimulai! 🚀', html:`<p>${execData.steps ?? seqData.sequence.length} instruksi sedang dieksekusi.</p><small class="text-slate-400">Drone akan ARM, Takeoff, lalu menjalankan instruksi otomatis.</small>`,
                        timer:4000, timerProgressBar:true, showConfirmButton:false, customClass:{popup:'rounded-2xl'} })
                    : Swal.fire({ icon:'error', title:'Gagal Memulai', text: execData.error || 'Server drone tidak merespon.', customClass:{popup:'rounded-2xl'} });
            } catch {
                Swal.fire({ icon:'error', title:'Koneksi Gagal', text:'Pastikan Node.js drone server (port 3001) berjalan.', customClass:{popup:'rounded-2xl'} });
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-rocket"></i> Jalankan Misi';
            }
        });

    })();
    </script>
    @endpush
</x-app-layout>
