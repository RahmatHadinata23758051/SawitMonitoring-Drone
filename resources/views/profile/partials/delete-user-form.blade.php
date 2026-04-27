<section class="space-y-4">
    <p class="text-sm text-rose-600 font-medium leading-relaxed">
        Setelah akun dihapus, semua data akan hilang secara permanen dan tidak dapat dipulihkan. 
        Pastikan Anda telah mengunduh seluruh data yang diperlukan sebelum melanjutkan.
    </p>

    <button
        x-data=""
        x-on:click.prevent="$dispatch('open-modal', 'confirm-user-deletion')"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-sm font-bold rounded-xl transition-all border border-rose-200 hover:border-rose-300"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        Hapus Akun Saya
    </button>

    <x-modal name="confirm-user-deletion" :show="$errors->userDeletion->isNotEmpty()" focusable>
        <form method="post" action="{{ route('profile.destroy') }}" class="p-6">
            @csrf
            @method('delete')

            <div class="flex items-center gap-4 mb-5">
                <div class="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </div>
                <div>
                    <h2 class="text-lg font-black text-slate-800" style="letter-spacing:-0.02em">Hapus Akun?</h2>
                    <p class="text-sm text-slate-500 mt-0.5">Tindakan ini bersifat permanen</p>
                </div>
            </div>

            <p class="text-sm text-slate-600 leading-relaxed mb-5 bg-rose-50 rounded-xl p-4 border border-rose-100">
                Setelah akun dihapus, <strong class="text-rose-700">semua data, laporan, dan riwayat penerbangan</strong> yang terhubung dengan akun ini akan hilang secara permanen. Masukkan kata sandi Anda untuk mengonfirmasi.
            </p>

            <div class="mb-5">
                <label for="password" class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider sr-only">Kata Sandi</label>
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg class="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <input
                        id="password" name="password" type="password"
                        class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-sm font-medium"
                        placeholder="Masukkan kata sandi Anda"
                    >
                </div>
                <x-input-error :messages="$errors->userDeletion->get('password')" class="mt-2" />
            </div>

            <div class="flex justify-end gap-3">
                <button type="button" x-on:click="$dispatch('close')" class="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all">
                    Batalkan
                </button>
                <button type="submit" class="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-rose-600/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Ya, Hapus Akun Saya
                </button>
            </div>
        </form>
    </x-modal>
</section>
