<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lupa Password - Drone CPS | IPB University</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        body { font-family: 'Poppins', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased overflow-hidden selection:bg-blue-500 selection:text-white">

    <div class="flex min-h-screen">
        
        <!-- Left Side: Image / Hero -->
        <div class="hidden lg:flex w-full lg:w-[55%] bg-slate-900 relative items-center justify-center overflow-hidden">
            <div class="absolute inset-0 z-0">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx5wuGXtnP9piFc99hTY8V_-NYijS_aFz6W5dxR1oc8DCInJN695GTSYWWSbM7cHZ4JVDeweooE12gu7bQ-A961oXddYQqZqLURIEKW9ChW2QMn4o-XCTLBdNt2ph_Vw4MDkYKiWger5ETVPN_Rtf3KslWkLNuqkIC9bAOyv0eRpddV37OOHNxqELrjdaMY_CL8rMd9kQXsB5Y9AxzCLpp8u5cfrxZq8QrlThnJx7QCc38VkTEIMQ8xU6mtskq_TE_l-CVhses5jI" class="w-full h-full object-cover opacity-60 mix-blend-overlay" alt="Palm Oil Plantation">
            </div>
            
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent z-10"></div>
            
            <div class="relative z-20 px-16 text-left w-full h-full flex flex-col justify-end pb-24">
                <div class="mb-4">
                    <div class="w-16 h-1.5 bg-blue-500 rounded-full mb-8"></div>
                </div>
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Monitoring <span class="text-blue-400">Sawit</span> <br>
                </h1>
                <p class="text-lg text-slate-300 max-w-xl leading-relaxed text-justify">
                    Aplikasi stasiun kendali darat (GCS) dan sistem cerdas berbasis AI untuk pemantauan perkebunan kelapa sawit digital dan berkelanjutan.
                </p>
                <div class="mt-8 flex items-center gap-4 text-sm text-slate-400 font-medium">
                    <span class="flex items-center gap-2"><i class="fa-solid fa-plane-up text-blue-500"></i> Auto-Pilot Misi</span>
                    <span class="flex items-center gap-2"><i class="fa-solid fa-brain text-blue-500"></i> AI Kematangan</span>
                    <span class="flex items-center gap-2"><i class="fa-solid fa-satellite text-blue-500"></i> Live Telemetry</span>
                </div>
            </div>
        </div>

        <!-- Right Side: Form -->
        <div class="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative bg-white shadow-2xl z-20">
            
            <div class="w-full max-w-[400px] mx-auto relative z-10">
                <!-- IPB Logo & Title -->
                <div class="flex flex-col items-center mb-6 text-center">
                    <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
                        <img src="{{ asset('images/logo-ipb-full.png') }}" alt="Logo IPB" class="h-16 w-auto">
                    </div>
                    <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Atur Ulang Sandi</h2>
                </div>
                
                <div class="mb-6 text-sm text-slate-500 text-center leading-relaxed">
                    Lupa kata sandi Anda? Tidak masalah. Beri tahu kami alamat email Anda, dan kami akan mengirimkan tautan untuk memilih yang baru.
                </div>

                <x-auth-session-status class="mb-4" :status="session('status')" />

                <form method="POST" action="{{ route('password.email') }}" class="space-y-6">
                    @csrf

                    <!-- Email -->
                    <div>
                        <label for="email" class="block text-sm font-semibold text-slate-700 mb-1.5">Email Terdaftar <span class="text-red-500">*</span></label>
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                                <i class="fa-solid fa-envelope text-slate-400 group-focus-within:text-blue-500"></i>
                            </div>
                            <input type="email" name="email" id="email" value="{{ old('email') }}" required autofocus
                                class="w-full pl-11 pr-4 py-3 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 text-sm font-medium" 
                                placeholder="analis@ipb.ac.id">
                        </div>
                        <x-input-error :messages="$errors->get('email')" class="mt-2 text-xs text-red-500" />
                    </div>

                    <!-- Button -->
                    <div class="pt-2">
                        <button type="submit" class="w-full flex items-center justify-center px-4 py-3.5 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 gap-2">
                            <i class="fa-solid fa-paper-plane mr-1"></i>
                            Kirim Tautan Reset
                        </button>
                    </div>

                    <div class="text-center mt-6">
                        <a href="{{ route('login') }}" class="text-sm font-bold text-slate-500 hover:text-blue-600 transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-arrow-left"></i> Kembali ke Login
                        </a>
                    </div>
                </form>

                <!-- Footer -->
                <div class="mt-16 text-center">
                    <p class="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                        &copy; {{ date('Y') }} IPB University
                    </p>
                </div>
            </div>
            
        </div>
    </div>
</body>
</html>
