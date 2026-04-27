<x-app-layout>
    <div class="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
        <div class="max-w-5xl mx-auto space-y-6">

            {{-- PAGE HEADER --}}
            <div class="flex items-center gap-4 mb-2">
                <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-600/30">
                    {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                </div>
                <div>
                    <h1 class="text-xl font-black text-slate-800 tracking-tight" style="letter-spacing:-0.03em">Profil Saya</h1>
                    <p class="text-sm text-slate-500 font-medium mt-0.5">Kelola informasi akun dan keamanan Anda</p>
                </div>
            </div>

            {{-- USER INFO BANNER --}}
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-blue-600/20 overflow-hidden relative">
                <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 40px 40px;"></div>
                <div class="relative z-10 flex items-center gap-5">
                    <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-black border border-white/30 shadow-lg">
                        {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                    </div>
                    <div>
                        <div class="text-white font-black text-xl tracking-tight" style="letter-spacing:-0.02em">{{ auth()->user()->name }}</div>
                        <div class="text-blue-200 text-sm font-medium mt-0.5">{{ auth()->user()->email }}</div>
                        <div class="mt-2 inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Administrator
                        </div>
                    </div>
                </div>
                <div class="relative z-10 hidden md:flex flex-col items-end gap-2 text-right">
                    <div class="text-white/60 text-xs font-medium uppercase tracking-widest">Anggota Sejak</div>
                    <div class="text-white font-bold text-base">{{ auth()->user()->created_at->format('d M Y') }}</div>
                </div>
            </div>

            {{-- GRID LAYOUT --}}
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {{-- LEFT: PROFILE INFO + PASSWORD (3/5) --}}
                <div class="lg:col-span-3 flex flex-col gap-6">

                    {{-- UPDATE PROFILE INFORMATION --}}
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                            <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-800 text-sm">Informasi Profil</h3>
                                <p class="text-xs text-slate-400 mt-0.5">Perbarui nama dan alamat email akun Anda</p>
                            </div>
                        </div>
                        <div class="p-6">
                            @include('profile.partials.update-profile-information-form')
                        </div>
                    </div>

                    {{-- UPDATE PASSWORD --}}
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                            <div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-800 text-sm">Ubah Kata Sandi</h3>
                                <p class="text-xs text-slate-400 mt-0.5">Gunakan kata sandi yang kuat dan unik</p>
                            </div>
                        </div>
                        <div class="p-6">
                            @include('profile.partials.update-password-form')
                        </div>
                    </div>

                </div>

                {{-- RIGHT: TIPS + DELETE ACCOUNT (2/5) --}}
                <div class="lg:col-span-2 flex flex-col gap-6">

                    {{-- SECURITY TIPS --}}
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                            <div class="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <h3 class="font-bold text-slate-800 text-sm">Tips Keamanan</h3>
                        </div>
                        <div class="p-5 space-y-3">
                            <div class="flex items-start gap-3">
                                <div class="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <p class="text-xs text-slate-600 font-medium leading-relaxed">Gunakan kata sandi minimal 8 karakter dengan kombinasi huruf, angka, dan simbol.</p>
                            </div>
                            <div class="flex items-start gap-3">
                                <div class="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <p class="text-xs text-slate-600 font-medium leading-relaxed">Jangan bagikan kata sandi Anda kepada siapapun, termasuk tim teknis.</p>
                            </div>
                            <div class="flex items-start gap-3">
                                <div class="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <p class="text-xs text-slate-600 font-medium leading-relaxed">Perbarui kata sandi secara berkala setiap 3 bulan sekali untuk keamanan optimal.</p>
                            </div>
                        </div>
                    </div>

                    {{-- SESSION INFO --}}
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
                            <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <h3 class="font-bold text-slate-800 text-sm">Informasi Sesi</h3>
                        </div>
                        <div class="p-5 space-y-4">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Akun</span>
                                <span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Aktif
                                </span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Terakhir Masuk</span>
                                <span class="text-xs font-bold text-slate-700">Hari Ini</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</span>
                                <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">Administrator</span>
                            </div>
                        </div>
                    </div>

                    {{-- DELETE ACCOUNT --}}
                    <div class="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
                        <div class="px-5 py-4 border-b border-rose-100 flex items-center gap-3 bg-rose-50/40">
                            <div class="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-rose-700 text-sm">Zona Berbahaya</h3>
                                <p class="text-xs text-rose-400 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
                            </div>
                        </div>
                        <div class="p-5">
                            @include('profile.partials.delete-user-form')
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
</x-app-layout>
