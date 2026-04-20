<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Login - Drone CPS | IPB University</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-tint": "#2a6b2c",
                        "on-primary-container": "#90d689",
                        "surface-container-high": "#d5ecf8",
                        "inverse-on-surface": "#dff4ff",
                        "secondary-fixed-dim": "#b0c6ff",
                        "surface-container": "#dbf1fe",
                        "tertiary-fixed-dim": "#bbc8d0",
                        "on-tertiary-container": "#b9c6ce",
                        "tertiary": "#303c42",
                        "on-primary": "#ffffff",
                        "primary": "#00450d",
                        "on-error": "#ffffff",
                        "primary-fixed-dim": "#91d78a",
                        "secondary-container": "#759efd",
                        "background": "#f3faff",
                        "tertiary-fixed": "#d7e4ec",
                        "surface-container-lowest": "#ffffff",
                        "outline-variant": "#c0c9bb",
                        "error": "#ba1a1a",
                        "secondary": "#2b5bb5",
                        "on-background": "#071e27",
                        "on-surface-variant": "#41493e",
                        "primary-fixed": "#acf4a4",
                        "surface": "#f3faff",
                        "error-container": "#ffdad6",
                        "surface-dim": "#c7dde9",
                        "on-tertiary": "#ffffff",
                        "on-tertiary-fixed": "#111d23",
                        "secondary-fixed": "#d9e2ff",
                        "inverse-primary": "#91d78a",
                        "outline": "#717a6d",
                        "on-secondary": "#ffffff",
                        "on-surface": "#071e27",
                        "on-tertiary-fixed-variant": "#3c494f",
                        "surface-container-highest": "#cfe6f2",
                        "on-secondary-fixed": "#001945",
                        "surface-bright": "#f3faff",
                        "surface-variant": "#cfe6f2",
                        "on-secondary-container": "#00337c",
                        "on-primary-fixed": "#002203",
                        "tertiary-container": "#47535a",
                        "on-error-container": "#93000a",
                        "primary-container": "#1b5e20",
                        "on-secondary-fixed-variant": "#00429c",
                        "inverse-surface": "#1e333c",
                        "surface-container-low": "#e6f6ff",
                        "on-primary-fixed-variant": "#0c5216"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "fontFamily": {
                        "headline": ["Manrope", "sans-serif"],
                        "body": ["Inter", "sans-serif"],
                        "label": ["Inter", "sans-serif"]
                    }
                }
            }
        }
    </script>
    <style>
        .palm-gradient {
            background: linear-gradient(135deg, theme('colors.primary'), theme('colors.primary-container'));
        }
        .form-input-focus:focus {
            border-bottom: 2px solid theme('colors.secondary');
            box-shadow: none;
            outline: none;
        }
    </style>
</head>
<body class="bg-surface font-body text-on-surface h-screen overflow-hidden flex flex-col">
    <!-- TopAppBar -->
    <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/70 dark:bg-emerald-950/70 backdrop-blur-xl no-border shadow-none">
        <div class="flex items-center gap-3">
            <img src="{{ asset('images/logo-ipb-full.png') }}" alt="Logo IPB University" class="h-10 w-auto object-contain">
            <div class="w-px h-6 bg-slate-200 hidden sm:block"></div>
            <span class="font-headline font-bold text-xl tracking-tight text-primary">Drone CPS</span>
        </div>
        <div class="flex items-center gap-4 hidden md:flex">
            <button class="text-slate-500 hover:bg-emerald-50/50 transition-colors p-2 rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined" data-icon="help_outline">help_outline</span>
            </button>
        </div>
    </header>

    <!-- Main Content: Split Screen -->
    <main class="flex-grow flex w-full h-full pt-[72px]">
        <!-- Left Side: Image / Brand Story (Hidden on small screens) -->
        <div class="hidden lg:flex lg:w-1/2 relative bg-surface-container-lowest overflow-hidden">
            <div class="absolute inset-0 bg-cover bg-center z-0" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCx5wuGXtnP9piFc99hTY8V_-NYijS_aFz6W5dxR1oc8DCInJN695GTSYWWSbM7cHZ4JVDeweooE12gu7bQ-A961oXddYQqZqLURIEKW9ChW2QMn4o-XCTLBdNt2ph_Vw4MDkYKiWger5ETVPN_Rtf3KslWkLNuqkIC9bAOyv0eRpddV37OOHNxqELrjdaMY_CL8rMd9kQXsB5Y9AxzCLpp8u5cfrxZq8QrlThnJx7QCc38VkTEIMQ8xU6mtskq_TE_l-CVhses5jI');">
            </div>
            <!-- Glassmorphism Overlay for Text -->
            <div class="relative z-10 w-full h-full flex flex-col justify-end p-12 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent">
                <div class="max-w-xl">
                    <span class="font-label text-xs uppercase tracking-[0.05em] text-on-primary/80 mb-2 block">IPB University</span>
                    <h1 class="font-headline text-5xl font-extrabold text-on-primary leading-tight mb-4">
                        Ground Control Station
                    </h1>
                    <p class="font-body text-lg text-on-primary/90 leading-relaxed">
                        Advanced telemetry and spatial analysis for sustainable palm oil operations. Command your canopy with actionable intelligence.
                    </p>
                </div>
            </div>
        </div>

        <!-- Right Side: Login Form -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-surface-container-low relative">
            <div class="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-container-highest via-surface-container-low to-surface-container-low"></div>
            
            <div class="w-full max-w-md relative z-10 bg-surface-container-lowest p-10 rounded-xl shadow-[0_12px_32px_-4px_rgba(7,30,39,0.06)]">
                <div class="mb-10 text-center lg:text-left">
                    <div class="flex justify-center mb-6 lg:hidden">
                        <img src="{{ asset('images/logo-ipb-full.png') }}" alt="Logo" class="h-14">
                    </div>
                    <h2 class="font-headline text-3xl font-bold text-on-surface mb-2">Welcome Back</h2>
                    <p class="font-body text-sm text-on-surface-variant">Access your command center.</p>
                </div>

                <!-- Session Status -->
                <x-auth-session-status class="mb-4" :status="session('status')" />

                <form method="POST" action="{{ route('login') }}" class="space-y-6">
                    @csrf
                    <!-- Email Input -->
                    <div>
                        <label class="block font-label text-xs uppercase tracking-[0.05em] text-on-surface-variant mb-2" for="email">Corporate Email</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-lg" data-icon="mail">mail</span>
                            </div>
                            <input class="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-0 border-b-2 border-transparent text-on-surface text-sm transition-all duration-300 focus:ring-0 form-input-focus placeholder:text-outline-variant rounded-t-lg rounded-b-none" 
                                   id="email" type="email" name="email" value="{{ old('email') }}" placeholder="analyst@domain.com" required autofocus autocomplete="username" />
                        </div>
                        @if ($errors->has('email'))
                            <p class="mt-2 text-sm text-error font-body">{{ $errors->first('email') }}</p>
                        @endif
                    </div>

                    <!-- Password Input -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label class="block font-label text-xs uppercase tracking-[0.05em] text-on-surface-variant" for="password">Security Key</label>
                            @if (Route::has('password.request'))
                                <a class="font-body text-xs text-secondary hover:text-secondary-container transition-colors" href="{{ route('password.request') }}">Forgot key?</a>
                            @endif
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span class="material-symbols-outlined text-outline text-lg" data-icon="lock">lock</span>
                            </div>
                            <input class="w-full pl-12 pr-12 py-4 bg-surface-container-highest border-0 border-b-2 border-transparent text-on-surface text-sm transition-all duration-300 focus:ring-0 form-input-focus placeholder:text-outline-variant rounded-t-lg rounded-b-none" 
                                   id="password" type="password" name="password" placeholder="••••••••" required autocomplete="current-password"/>
                            <button class="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface transition-colors" type="button" onclick="const p = document.getElementById('password'); p.type = p.type === 'password' ? 'text' : 'password';">
                                <span class="material-symbols-outlined text-lg" data-icon="visibility">visibility</span>
                            </button>
                        </div>
                        @if ($errors->has('password'))
                            <p class="mt-2 text-sm text-error font-body">{{ $errors->first('password') }}</p>
                        @endif
                    </div>

                    <!-- Remember Me -->
                    <div class="flex items-center">
                        <input id="remember_me" type="checkbox" class="w-4 h-4 text-primary bg-surface-container-highest border-outline-variant rounded focus:ring-primary focus:ring-2" name="remember">
                        <label for="remember_me" class="ms-2 text-sm font-body text-on-surface-variant">Remember me</label>
                    </div>

                    <!-- Sign In Button -->
                    <div class="pt-4">
                        <button class="w-full py-4 px-6 palm-gradient text-on-primary font-body font-semibold text-sm rounded-lg hover:shadow-[0_8px_16px_-4px_rgba(0,69,13,0.2)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2" type="submit">
                            <span>Initialize Session</span>
                            <span class="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
                        </button>
                    </div>
                </form>

                <!-- Minimal Footer for mobile -->
                <div class="absolute bottom-6 w-full text-center lg:hidden left-0">
                    <span class="font-body text-[10px] text-outline-variant">© 2026 IPB University. All rights reserved.</span>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer for desktop -->
    <footer class="hidden lg:flex fixed bottom-0 right-0 w-1/2 justify-between items-center px-8 py-6 bg-transparent pointer-events-none">
        <span class="font-body text-xs text-outline-variant">© 2026 IPB University. All rights reserved.</span>
        <div class="flex gap-4 pointer-events-auto">
            <a class="font-label text-[10px] uppercase tracking-wider text-outline hover:text-secondary transition-colors" href="#">Privacy Policy</a>
            <a class="font-label text-[10px] uppercase tracking-wider text-outline hover:text-secondary transition-colors" href="#">Terms of Service</a>
        </div>
    </footer>
</body>
</html>
