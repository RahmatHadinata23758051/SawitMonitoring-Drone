<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-lg text-gray-800 leading-tight">
            {{ __('Ground Control Station (GCS)') }}
        </h2>
    </x-slot>

    <div class="pt-2 pb-12">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col gap-4">
            <div class="flex justify-between">
                <div>
                    <p class="font-bold text-base">Status: <span class="text-green-500">Connected</span></p>
                    <p class="font-bold text-base">Current Mode: <span class="">Manual</span></p>
                    {{-- <p class="font-bold text-base">Current Algorithm: <span class="">Quick Look Vision</span></p> --}}
                </div>
                <div>
                    {{-- Button Open Modal --}}
                    <button onclick="openDroneModal()"
                        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200">
                        Konfigurasi
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3 h-[300px] py-4 px-2 mb-3">
                {{-- Stream Kamera --}}
                <div class="bg-white shadow-md rounded-xl p-2">
                    <div class="mb-3 flex gap-2 items-center text-teal-600">
                        <i class="fa-solid fa-video"></i>
                        <p class="text-base font-medium">STREAM</p>
                    </div>
                    <video id="droneView" class="w-full h-[80%]" controls autoplay muted
                        crossorigin="anonymous"></video>
                    <canvas id="captureCanvas" class="hidden"></canvas>
                </div>

                {{-- Peta --}}
                <div class="bg-white shadow-md rounded-xl p-2">
                    <div class="mb-3 flex gap-2 items-center text-green-700">
                        <i class="fa-solid fa-compass"></i>
                        <p class="text-base font-medium">PETA POSISI DRONE</p>
                    </div>
                    <div id="map" class="w-full h-[80%]"></div>
                </div>

                {{-- Gauge Cockpit --}}
                <div class="bg-white shadow-md rounded-xl p-2">
                    <div class="mb-2 flex gap-2 items-center text-blue-600">
                        <i class="fa-solid fa-gauge-high"></i>
                        <p class="text-base font-medium">GAUGE COCKPIT</p>
                    </div>
                    <div class="w-full h-[80%] grid grid-cols-2 gap-2">
                        <div class="bg-primary rounded-lg text-white h-max p-2">
                            <p class="text-xs text-center uppercase">Kecepatan</p>
                            <p class="text-xl text-center">0.0 m/s</p>
                        </div>
                        <div class="bg-primary rounded-lg text-white h-max p-2">
                            <p class="text-xs text-center uppercase">Ketinggian</p>
                            <p class="text-xl text-center">0.0 m</p>
                        </div>
                        <div
                            class="bg-primary rounded-lg text-white h-max p-2 col-span-2 flex gap-2 items-center justify-around">
                            <div>
                                <p class="text-xs text-center uppercase">Pitch</p>
                                <p class="text-xl text-center">0.0&deg;</p>
                            </div>
                            <div>
                                <p class="text-xs text-center uppercase">Roll</p>
                                <p class="text-xl text-center">0.0&deg;</p>
                            </div>
                            <div>
                                <p class="text-xs text-center">Yaw</p>
                                <p class="text-xl text-center">0.0&deg;</p>
                            </div>
                        </div>
                        <div class="bg-primary rounded-lg text-white h-max p-2">
                            <div class="flex gap-2 items-center text-xs">
                                <i class="fa-solid fa-battery-empty"></i>
                                <p class="uppercase">Baterai</p>
                            </div>
                            <p class="text-xl">80%</p>
                        </div>
                        <div class="bg-primary rounded-lg text-white h-max p-2">
                            <div class="flex gap-2 items-center text-xs">
                                <i class="fa-regular fa-clock"></i>
                                <p class="uppercase">Waktu</p>
                            </div>
                            <p class="text-xl">00:00</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3 py-4 px-2 mb-3">
                {{-- Waypoints --}}
                <div class="col-span-2 bg-white shadow-md rounded-xl p-2">
                    <div class="flex justify-between items-center mb-2">
                        <p class="font-semibold">MISSION PLANNER</p>
                        <div>
                            <select id="missionSelect" class="border rounded px-2 py-1 text-sm">
                                <option value="">-- Pilih Mission --</option>
                            </select>
                            <button onclick="resetWaypoints()" class="text-sm bg-red-500 text-white px-2 py-1 rounded">
                                Reset
                            </button>
                            <button onclick="startMission()"
                                class="text-sm bg-blue-500 text-white px-2 py-1 rounded">Start Mission</button>
                        </div>
                    </div>
                    <canvas id="plannerCanvas" class="w-full border rounded"></canvas>
                    <div class="text-end">
                        <button onclick="saveMission()" class="bg-primary text-white px-4 py-1 rounded my-2">
                            Simpan Mission
                        </button>
                    </div>
                </div>

                <div class="bg-white shadow-md rounded-xl p-2">
                    <p></p>
                </div>
            </div>

            <div class="bg-white shadow-md rounded-xl py-4 px-2 mb-3 mt-6 grid grid-cols-2 gap-3 hidden">

                {{-- ARM = langsung take off, tidak ada tombol TAKEOFF terpisah --}}
                <button id="btnArm"
                    class="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed">
                    TAKE OFF
                </button>

                <button onclick="send('throttle_down')" id="btnDown"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    THROTTLE -
                </button>

                <button onclick="send('throttle_up')" id="btnUp"
                    class="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    THROTTLE +
                </button>

                <button onclick="send('roll_left')" id="btnRollLeft"
                    class="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    ROLL -
                </button>

                <button onclick="send('roll_right')" id="btnRollRight"
                    class="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    ROLL +
                </button>

                <button onclick="send('pitch_backward')" id="btnPitchB"
                    class="bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    PITCH -
                </button>

                <button onclick="send('pitch_forward')" id="btnPitchF"
                    class="bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    PITCH +
                </button>

                <button onclick="send('yaw_left')" id="btnYawLeft"
                    class="bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    YAW -
                </button>

                <button onclick="send('yaw_right')" id="btnYawRight"
                    class="bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    YAW +
                </button>

                <button onclick="send('reset_attitude')" id="btnReset"
                    class="col-span-2 bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    RESET
                </button>

                <button onclick="send('land')" id="btnLand"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-xl font-semibold
                           transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    LAND
                </button>

                {{-- <button onclick="send('disarm')" id="btnDisarm"
                    class="bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition-all duration-200
                           disabled:bg-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled>
                    DISARM
                </button> --}}

                <button onclick="send('emergency')" id="btnEmergency"
                    class="bg-black hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all duration-200">
                    EMERGENCY STOP
                </button>
            </div>
        </div>
    </div>

    {{-- Modal Konfigurasi Drone --}}
    <div id="droneModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 hidden"
        style="z-index: 999999;">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">

            {{-- Header --}}
            <div class="flex justify-between items-center mb-5">
                <h2 class="text-base font-semibold text-gray-800">Konfigurasi Drone</h2>
                <button onclick="closeDroneModal()"
                    class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg px-2 py-1 text-lg leading-none transition">
                    &times;
                </button>
            </div>

            {{-- Dropdown Pilih Drone --}}
            <div class="mb-4">
                <label class="block text-sm text-gray-500 mb-1">Pilih Drone</label>
                <select id="selectDrone"
                    class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">--- Pilih drone ---</option>
                    @foreach ($drone as $item)
                        <option value="{{ $item->id }}">{{ $item->id_drone }}</option>
                    @endforeach
                </select>
            </div>

            {{-- Radio Mode --}}
            <div class="mb-4">
                <label class="block text-sm text-gray-500 mb-2">Mode Terbang</label>
                <div class="flex gap-3">
                    <label id="optManual" onclick="setFlightMode('manual')"
                        class="flex-1 flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 cursor-pointer text-sm transition-all">
                        <input type="radio" name="flightMode" value="manual" class="accent-indigo-600"> Manual
                    </label>
                    <label id="optAuto" onclick="setFlightMode('auto')"
                        class="flex-1 flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 cursor-pointer text-sm transition-all">
                        <input type="radio" name="flightMode" value="auto" class="accent-indigo-600"> Auto
                    </label>
                </div>
            </div>

            {{-- Dropdown Algoritma (muncul hanya jika Auto) --}}
            <div id="algoGroup" class="mb-4 hidden">
                <label class="block text-sm text-gray-500 mb-1">Algoritma Terbang</label>
                <select id="selectAlgo"
                    class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">--- Pilih algoritma ---</option>
                    <option value="DR">Dead-Reckoning</option>
                    <option value="LR">Live-Reckoning</option>
                    <option value="QLV">Quick Look Vision</option>
                </select>
            </div>

            <hr class="border-gray-200 mb-4">

            {{-- Tombol Simpan --}}
            <button onclick="saveDroneConfig()"
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-semibold text-sm transition-all duration-200">
                Simpan Konfigurasi
            </button>
        </div>
    </div>

    @push('scripts')
        <script>
            // ---------- MODAL KONFIGURASI ----------
            let flightMode = 'manual';

            function openDroneModal() {
                document.getElementById('droneModal').classList.remove('hidden');
            }

            function closeDroneModal() {
                document.getElementById('droneModal').classList.add('hidden');
            }

            function setFlightMode(mode) {
                flightMode = mode;

                const optManual = document.getElementById('optManual');
                const optAuto = document.getElementById('optAuto');
                const algoGroup = document.getElementById('algoGroup');

                // Active style
                [optManual, optAuto].forEach(el => {
                    el.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-700');
                    el.classList.add('border-gray-300');
                });
                const activeEl = mode === 'manual' ? optManual : optAuto;
                activeEl.classList.add('border-indigo-500', 'bg-indigo-50', 'text-indigo-700');
                activeEl.classList.remove('border-gray-300');

                // Radio checked
                document.querySelector(`input[name="flightMode"][value="${mode}"]`).checked = true;

                // Tampilkan/sembunyikan algoritma
                algoGroup.classList.toggle('hidden', mode === 'manual');
            }

            function saveDroneConfig() {
                const drone = document.getElementById('selectDrone').value;
                const algo = flightMode === 'auto' ? document.getElementById('selectAlgo').value : null;

                if (!drone) {
                    alert('Pilih drone terlebih dahulu.');
                    return;
                }

                console.log({
                    drone,
                    mode: flightMode,
                    algo
                });
                // TODO: kirim ke server via fetch jika diperlukan

                closeDroneModal();
            }

            // Tutup modal jika klik di luar box
            document.getElementById('droneModal').addEventListener('click', function(e) {
                if (e.target === this) closeDroneModal();
            });


            // GENERATE POHON UNTUK MEMBUAT WAYPOINTS (masih generate manual)
            // Data
            let trees = [];
            let waypoints = [];

            // Home Point
            let home;

            // Drone (Untuk simulasi pergerakan di waypoints)
            let drone = {
                angle: 0,
                speed: 1.5,
                targetIndex: 0,
                isFlying: false
            };

            // Canvas dan Context
            let plannerCanvas;
            let ctx;

            // Generate Grid Segitiga (Sesuai Pola Kebun Sawit)
            function generateTrees(rows = 6, cols = 12) {
                let padding = 160;

                // ambil width canvas
                let canvasWidth = plannerCanvas.width;

                let availableWidth = canvasWidth - padding;

                // spacing otomatis
                let spacingX = availableWidth / cols;

                let spacingY = spacingX * 0.866;

                let offsetX = padding / 2;
                let offsetY = 40;

                trees = [];

                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {

                        let xOffset = (i % 2 === 0) ? 0 : spacingX / 2;

                        trees.push({
                            id: `${i}-${j}`,
                            x: offsetX + j * spacingX + xOffset,
                            y: offsetY + i * spacingY
                        });
                    }
                }
            }

            // Draw Drone
            function drawDrone() {
                ctx.save();

                ctx.translate(drone.x, drone.y);
                ctx.rotate(drone.angle);

                ctx.beginPath();
                ctx.moveTo(12, 0); // depan
                ctx.lineTo(-8, -6); // kiri
                ctx.lineTo(-8, 6); // kanan
                ctx.closePath();

                ctx.fillStyle = "#facc15";
                ctx.fill();

                ctx.restore();
            }

            // Draw Waypoints
            function draw() {
                ctx.clearRect(0, 0, plannerCanvas.width, plannerCanvas.height);

                // ===== PATH =====
                if (waypoints.length > 0) {
                    ctx.beginPath();

                    ctx.moveTo(home.x, home.y);

                    waypoints.forEach((wp) => {
                        ctx.lineTo(wp.x, wp.y);
                    });

                    ctx.lineTo(home.x, home.y);

                    ctx.strokeStyle = "#2563eb";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Loop Pohon
                trees.forEach(tree => {
                    ctx.beginPath();
                    ctx.arc(tree.x, tree.y, 10, 0, Math.PI * 2);

                    let isSelected = waypoints.find(wp => wp.id === tree.id);
                    ctx.fillStyle = isSelected ? "#f59e0b" : "#16a34a";

                    ctx.fill();

                    // nomor waypoint
                    let index = waypoints.findIndex(wp => wp.id === tree.id);
                    if (index !== -1) {
                        ctx.fillStyle = "#000";
                        ctx.font = "10px Arial";
                        ctx.fillText(index + 1, tree.x - 3, tree.y + 3);
                    }
                });

                // HOME
                ctx.beginPath();
                ctx.arc(home.x, home.y, 12, 0, Math.PI * 2);
                ctx.fillStyle = "#dc2626";
                ctx.fill();

                ctx.fillStyle = "#fff";
                ctx.font = "10px Arial";
                ctx.fillText("H", home.x - 3, home.y + 3);

                ctx.fillStyle = "#000";
                ctx.font = "12px Arial";
                ctx.fillText("HOME", home.x - 18, home.y - 20);

                drawDrone();
            }

            // Reset Waypoints
            function resetWaypoints() {
                waypoints = [];
                draw();
            }

            // Get Full Jalur Drone
            function getFullPath() {
                if (waypoints.length === 0) return [];

                let path = [home];

                let prev = home;

                waypoints.forEach(wp => {
                    path.push(wp);

                    // orbit berdasarkan arah datang
                    let orbit = createOrbitPoints(wp, prev, 15, 24);
                    path.push(...orbit);

                    prev = wp;
                });

                path.push(home);

                return path;
            }

            // Mulai Mission
            function startMission() {
                if (waypoints.length === 0) {
                    alert("Pilih pohon dulu!");
                    return;
                }

                drone.targetIndex = 1; // mulai dari waypoint pertama
                drone.isFlying = true;
            }

            // Update Posisi Drone
            function updateDrone() {
                if (!drone.isFlying) return;

                let path = getFullPath();
                let target = path[drone.targetIndex];

                if (!target) {
                    drone.isFlying = false;
                    return;
                }

                let dx = target.x - drone.x;
                let dy = target.y - drone.y;

                let distance = Math.sqrt(dx * dx + dy * dy);

                // arah drone
                drone.angle = Math.atan2(dy, dx);

                if (distance < 2) {
                    drone.targetIndex++;

                    if (drone.targetIndex >= path.length) {
                        drone.isFlying = false;
                        return;
                    }
                } else {
                    drone.x += (dx / distance) * drone.speed;
                    drone.y += (dy / distance) * drone.speed;
                }
            }

            // Animasi Gerak Drone
            function animate() {
                updateDrone();
                draw();
                requestAnimationFrame(animate);
            }

            // Create Jalur Memutari Pohon
            function createOrbitPoints(center, entryPoint, radius = 15, totalPoints = 24) {
                let points = [];

                // sudut awal berdasarkan arah datang
                let startAngle = Math.atan2(
                    entryPoint.y - center.y,
                    entryPoint.x - center.x
                );

                for (let i = 0; i < totalPoints; i++) {
                    let angle = startAngle + (i / totalPoints) * Math.PI * 2;

                    points.push({
                        x: center.x + Math.cos(angle) * radius,
                        y: center.y + Math.sin(angle) * radius
                    });
                }

                return points;
            }

            // Load Misi yang Tersimpan
            function loadMissionList() {
                fetch("/missions")
                    .then(res => res.json())
                    .then(data => {
                        const select = document.getElementById("missionSelect");

                        select.innerHTML = `<option value="">-- Pilih Mission --</option>`;

                        data.forEach(m => {
                            select.innerHTML += `
                    <option value="${m.id}">
                        ${m.mission_name}
                    </option>
                `;
                        });
                    });
            }

            // Load Misi Berdasarkan ID
            function loadMission(id) {
                if (!id) return;

                fetch(`/missions/${id}`)
                    .then(res => res.json())
                    .then(mission => {

                        // isi ulang waypoint
                        waypoints = mission.waypoints || [];
                        console.log(waypoints);

                        // redraw
                        draw();
                    });
            }

            // Get ID Drone yang Dipilih
            function getSelectedDroneId() {
                return document.getElementById("selectDrone").value;
            }

            // Save Mission
            function saveMission() {
                if (waypoints.length === 0) {
                    alert("Waypoint kosong!");
                    return;
                }

                fetch("/missions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": "{{ csrf_token() }}"
                        },
                        body: JSON.stringify({
                            mission_name: "Mission " + Date.now(),
                            drone_id: getSelectedDroneId(),
                            waypoints: waypoints,
                            path_data: getFullPath()
                        })
                    })
                    .then(async res => {
                        if (!res.ok) {
                            const err = await res.json();
                            throw err;
                        }
                        return res.json();
                    })
                    .then(data => {
                        alert(data.message);

                        // reload dropdown
                        loadMissionList();
                    })
                    .catch(err => {
                        if (err.errors) {
                            alert(Object.values(err.errors).flat().join("\n"));
                        } else {
                            alert("Gagal menyimpan mission");
                        }
                    });
            }


            function resetWaypoints() {
                waypoints = [];
                draw();
            }

            document.addEventListener("DOMContentLoaded", function() {
                // Inisialisasi Map
                var map = L.map('map', {
                    center: [-6.914744, 107.60981],
                    zoom: 13,
                    zoomControl: false
                });

                L.tileLayer('https://www.google.cn/maps/vt?lyrs=s,h&x={x}&y={y}&z={z}', {
                    attribution: '&copy; Google Hybrid',
                    maxZoom: 18,
                }).addTo(map);

                // ---------- STATE ----------
                // DISARMED -> FLYING -> DISARMED
                let state = "DISARMED";

                // ---------- SEND COMMAND ----------
                async function send(command) {
                    try {
                        const res = await fetch("/drone/control", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": "{{ csrf_token() }}"
                            },
                            body: JSON.stringify({
                                command
                            })
                        });
                        await res.json();
                        updateState(command);
                    } catch (err) {
                        console.error("Control error:", err);
                    }
                }

                window.send = send;

                // ---------- UPDATE STATE ----------
                function updateState(cmd) {
                    if (cmd === "arm") state = "FLYING";
                    if (cmd === "land") state = "DISARMED";
                    if (cmd === "disarm") state = "DISARMED";
                    if (cmd === "emergency") state = "DISARMED";

                    const isFlying = state === "FLYING";
                    const isDisarmed = state === "DISARMED";

                    // TAKE OFF — hanya aktif saat DISARMED
                    document.getElementById("btnArm").disabled = !isDisarmed;

                    // Semua kontrol — hanya aktif saat FLYING
                    document.getElementById("btnUp").disabled = !isFlying;
                    document.getElementById("btnDown").disabled = !isFlying;
                    document.getElementById("btnRollLeft").disabled = !isFlying;
                    document.getElementById("btnRollRight").disabled = !isFlying;
                    document.getElementById("btnPitchF").disabled = !isFlying;
                    document.getElementById("btnPitchB").disabled = !isFlying;
                    document.getElementById("btnYawLeft").disabled = !isFlying;
                    document.getElementById("btnYawRight").disabled = !isFlying;
                    document.getElementById("btnReset").disabled = !isFlying;
                    document.getElementById("btnLand").disabled = !isFlying;
                    // document.getElementById("btnDisarm").disabled = !isFlying;

                    // // Joystick zone — aktif hanya saat FLYING
                    // const joystickZone = document.getElementById("joystickZone");
                    // joystickZone.style.opacity = isFlying ? "1" : "0.4";
                    // joystickZone.style.pointerEvents = isFlying ? "auto" : "none";

                    // Status text
                    const statusEl = document.getElementById("statusText");
                    if (statusEl) {
                        statusEl.textContent = state;
                        statusEl.className = isFlying ?
                            "font-medium text-lg text-green-500" :
                            "font-medium text-lg text-red-500";
                    }
                }

                updateState("");

                // ---------- TAKE OFF BUTTON ----------
                document.getElementById("btnArm").addEventListener("click", async () => {
                    await send("arm");
                });

                // ---------- STREAM KAMERA ----------
                const video = document.getElementById('droneView');
                const src = "{{ asset('streams/drone.m3u8') }}";
                console.log("Stream src:", src);

                function startStream() {
                    if (Hls.isSupported()) {
                        const hls = new Hls({
                            lowLatencyMode: true,
                            manifestLoadingMaxRetry: 999,
                            manifestLoadingRetryDelay: 2000,
                        });
                        hls.loadSource(src);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.ERROR, function(event, data) {
                            if (data.fatal) {
                                console.log("Stream error, retrying...");
                                setTimeout(() => {
                                    hls.destroy();
                                    startStream();
                                }, 2000);
                            }
                        });
                    }
                }

                startStream();

                // ---------- CAPTURE FRAME ----------
                const canvas = document.getElementById('captureCanvas');
                const context = canvas.getContext('2d');
                let isProcessing = false;

                function captureFrame() {
                    if (video.readyState !== 4 || isProcessing) return;
                    isProcessing = true;

                    const maxWidth = 640;
                    const scale = maxWidth / video.videoWidth;
                    canvas.width = maxWidth;
                    canvas.height = video.videoHeight * scale;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(function(blob) {
                        sendToServer(blob);
                    }, "image/jpeg", 0.7);
                }

                function sendToServer(blobImage) {
                    const formData = new FormData();
                    formData.append("file", blobImage, "frame.jpg");

                    fetch("/api/predict", {
                            method: "POST",
                            body: formData
                        })
                        .then(res => res.json())
                        .then(data => {
                            console.log("Laravel Response:", data);
                        })
                        .catch(err => console.error("Predict error:", err))
                        .finally(() => {
                            isProcessing = false;
                        });
                }
                setInterval(captureFrame, 5000);

                // Untuk Waypoints
                plannerCanvas = document.getElementById("plannerCanvas");
                ctx = plannerCanvas.getContext("2d");

                plannerCanvas.width = plannerCanvas.offsetWidth;
                plannerCanvas.height = 400;

                generateTrees();

                // cari pohon paling kiri
                let minX = Math.min(...trees.map(t => t.x));

                // set "Home" di kiri pohon pertama
                home = {
                    x: minX - 55,
                    y: (plannerCanvas.height / 2) - 120
                };

                // set posisi drone
                drone.x = home.x;
                drone.y = home.y;

                draw();
                animate();

                // Event saat canvas clicked
                plannerCanvas.addEventListener("click", function(e) {
                    const rect = plannerCanvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    trees.forEach(tree => {
                        const dist = Math.sqrt((tree.x - x) ** 2 + (tree.y - y) ** 2);

                        if (dist < 10) {
                            let index = waypoints.findIndex(wp => wp.id === tree.id);

                            if (index === -1) {
                                waypoints.push(tree);
                            } else {
                                waypoints.splice(index, 1);
                            }

                            draw();
                        }
                    });
                });


                document.getElementById("missionSelect").addEventListener("change", function() {
                    loadMission(this.value);
                });

                loadMissionList();

                // // ---------- JOYSTICK VALUES ----------
                // // Semua nilai range 0-255, netral di 128
                // let joystickLeft = {
                //     x: 128,
                //     y: 128
                // }; // yaw (x), throttle (y)
                // let joystickRight = {
                //     x: 128,
                //     y: 128
                // }; // roll (x), pitch (y)

                // // ---------- SEND JOYSTICK (continuous 10Hz) ----------
                // async function sendJoystick() {
                //     if (state !== "FLYING") return;
                //     try {
                //         await fetch("/drone/control", {
                //             method: "POST",
                //             headers: {
                //                 "Content-Type": "application/json",
                //                 "X-CSRF-TOKEN": "{{ csrf_token() }}"
                //             },
                //             body: JSON.stringify({
                //                 command: "joystick",
                //                 yaw: joystickLeft.x,
                //                 throttle: joystickLeft.y,
                //                 roll: joystickRight.x,
                //                 pitch: joystickRight.y,
                //             })
                //         });
                //     } catch (err) {
                //         console.error("Joystick error:", err);
                //     }
                // }

                // setInterval(sendJoystick, 100);

                // // ---------- NIPPLEJS KIRI: Throttle + Yaw ----------
                // const managerLeft = nipplejs.create({
                //     zone: document.getElementById("joystickLeft"),
                //     mode: "static",
                //     position: {
                //         left: "50%",
                //         top: "50%"
                //     },
                //     color: "#6366f1",
                //     size: 120,
                // });

                // managerLeft.on("move", (evt, data) => {
                //     if (!data.vector) return;
                //     const dist = Math.min(data.force, 1); // normalisasi 0-1 via nipplejs
                //     const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

                //     joystickLeft.x = clamp(128 + data.vector.x * 128 * dist); // yaw
                //     joystickLeft.y = clamp(128 - data.vector.y * 72 * dist); // throttle (atas = naik, max ~200)
                // });

                // managerLeft.on("end", () => {
                //     joystickLeft = {
                //         x: 128,
                //         y: 128
                //     };
                // });

                // // ---------- NIPPLEJS KANAN: Pitch + Roll ----------
                // const managerRight = nipplejs.create({
                //     zone: document.getElementById("joystickRight"),
                //     mode: "static",
                //     position: {
                //         left: "50%",
                //         top: "50%"
                //     },
                //     color: "#10b981",
                //     size: 120,
                // });

                // managerRight.on("move", (evt, data) => {
                //     if (!data.vector) return;
                //     const dist = Math.min(data.force, 1); // normalisasi 0-1 via nipplejs
                //     const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

                //     joystickRight.x = clamp(128 + data.vector.x * 128 * dist); // roll
                //     joystickRight.y = clamp(128 + data.vector.y * 128 * dist); // pitch
                // });

                // managerRight.on("end", () => {
                //     joystickRight = {
                //         x: 128,
                //         y: 128
                //     };
                // });
            });
        </script>
    @endpush
</x-app-layout>
