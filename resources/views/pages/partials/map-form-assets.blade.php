<link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
<script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
<script src="https://unpkg.com/leaflet-geometryutil@0.10.3/src/leaflet.geometryutil.js"></script>
<script src="https://unpkg.com/@turf/turf@6.5.0/turf.min.js"></script>
<script>
// Fix Leaflet default marker icon paths
delete (L.Icon.Default.prototype)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Fix Leaflet.draw locale strings (Indonesian)
L.drawLocal = {
    draw: {
        toolbar: {
            actions: { title: 'Batal menggambar', text: 'Batal' },
            finish: { title: 'Selesai menggambar', text: 'Selesai' },
            undo: { title: 'Hapus titik terakhir', text: 'Hapus Titik' },
            buttons: {
                polyline: 'Gambar garis',
                polygon: 'Gambar area (poligon)',
                rectangle: 'Gambar kotak',
                circle: 'Gambar lingkaran',
                marker: 'Tambah penanda',
                circlemarker: 'Tambah penanda lingkaran'
            }
        },
        handlers: {
            circle: { tooltip: { start: 'Klik dan seret untuk menggambar lingkaran.' }, radius: 'Radius' },
            circlemarker: { tooltip: { start: 'Klik peta untuk menaruh penanda lingkaran.' } },
            marker: { tooltip: { start: 'Klik peta untuk menaruh penanda.' } },
            polygon: {
                tooltip: {
                    start: 'Klik untuk mulai menggambar area.',
                    cont: 'Klik untuk melanjutkan menggambar.',
                    end: 'Klik titik pertama untuk menutup area.'
                }
            },
            polyline: {
                error: '<strong>Error:</strong> garis tidak boleh bersilangan!',
                tooltip: {
                    start: 'Klik untuk mulai menggambar garis.',
                    cont: 'Klik untuk melanjutkan menggambar.',
                    end: 'Klik titik terakhir untuk selesai.'
                }
            },
            rectangle: { tooltip: { start: 'Klik dan seret untuk menggambar kotak.' } },
            simpleshape: { tooltip: { end: 'Lepas mouse untuk selesai menggambar.' } }
        }
    },
    edit: {
        toolbar: {
            actions: {
                save: { title: 'Simpan perubahan', text: 'Simpan' },
                cancel: { title: 'Batalkan semua perubahan', text: 'Batal' },
                clearAll: { title: 'Hapus semua area', text: 'Hapus Semua' }
            },
            buttons: {
                edit: 'Ubah area',
                editDisabled: 'Tidak ada area untuk diubah',
                remove: 'Hapus area',
                removeDisabled: 'Tidak ada area untuk dihapus'
            }
        },
        handlers: {
            edit: {
                tooltip: {
                    text: 'Seret titik untuk mengubah bentuk.',
                    subtext: 'Klik batal untuk membatalkan perubahan.'
                }
            },
            remove: { tooltip: { text: 'Klik pada area untuk menghapus.' } }
        }
    }
};

    window.MapFormHelpers = window.MapFormHelpers || (() => {
        function createStandardMap({
            mapId = 'map',
            defaultCenter = [-6.9, 107.6],
            defaultZoom = 9
        } = {}) {
            const map = L.map(mapId);
            
            // Use setView for proper initialization (matches React pattern)
            map.setView(defaultCenter, defaultZoom);

            const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            });

            const satelliteLayer = L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri',
                    maxZoom: 19,
                }
            );

            streetLayer.addTo(map);
            L.control.layers({
                'Peta Jalan': streetLayer,
                'Citra Satelit': satelliteLayer,
            }, {}, {
                position: 'topleft'
            }).addTo(map);

            // Try geolocation (matches React pattern)
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        map.setView([position.coords.latitude, position.coords.longitude], 15);
                    },
                    () => {
                        // Geolocation denied or failed - keep default view
                    }
                );
            }

            // Force resize after render (matches React setTimeout pattern)
            setTimeout(() => map.invalidateSize(), 200);

            return {
                map,
                streetLayer,
                satelliteLayer,
                defaultCenter,
                defaultZoom,
            };
        }

        function fitMapToLayers(map, groups, defaultCenter = [-2.5489, 118.0149], defaultZoom = 5, padding = [40, 40]) {
            const focusGroup = L.featureGroup();

            groups.forEach(group => {
                if (!group || typeof group.eachLayer !== 'function') {
                    return;
                }

                group.eachLayer(layer => focusGroup.addLayer(layer));
            });

            if (focusGroup.getLayers().length) {
                map.fitBounds(focusGroup.getBounds(), {
                    padding
                });
                return;
            }

            map.setView(defaultCenter, defaultZoom);
        }

        function addLegend(map, {
            title = 'Legenda Peta',
            items = [],
            note = ''
        } = {}) {
            const legend = L.control({
                position: 'bottomright'
            });

            legend.onAdd = function() {
                const div = L.DomUtil.create('div');
                div.className =
                    'bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-lg px-4 py-3 text-xs text-slate-700';

                const itemsHtml = items.map(item => `
                    <div class="flex items-center gap-2 mb-2">
                        <span style="width:12px;height:12px;border-radius:9999px;background:${item.color};display:inline-block;"></span>
                        <span>${item.label}</span>
                    </div>
                `).join('');

                div.innerHTML = `
                    <div class="font-semibold text-slate-800 mb-2">${title}</div>
                    ${itemsHtml}
                    ${note ? `<div class="text-[11px] text-slate-500">${note}</div>` : ''}
                `;

                return div;
            };

            legend.addTo(map);
            return legend;
        }

        function getPolygonStyle(color) {
            return {
                color,
                fillColor: color,
                fillOpacity: 0.4,
                weight: 2
            };
        }

        function bindColorInput(colorInput, getLayer) {
            if (!colorInput) {
                return;
            }

            colorInput.addEventListener('input', function() {
                const layer = typeof getLayer === 'function' ? getLayer() : null;
                if (!layer) {
                    return;
                }

                layer.setStyle({
                    color: this.value,
                    fillColor: this.value
                });
            });
        }

        function createAddressUpdater(inputEl) {
            let requestId = 0;

            return async function(lat, lng) {
                if (!inputEl) {
                    return;
                }

                const currentRequestId = ++requestId;
                inputEl.value = 'Memuat alamat...';

                try {
                    const url =
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`;
                    const response = await fetch(url, {
                        headers: {
                            'Accept': 'application/json',
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Reverse geocoding gagal');
                    }

                    const data = await response.json();

                    if (currentRequestId !== requestId) {
                        return;
                    }

                    inputEl.value = data.display_name || '';
                } catch (error) {
                    if (currentRequestId !== requestId) {
                        return;
                    }

                    inputEl.value = '';
                }
            };
        }

        // Calculate polygon info with validation (matches React pattern)
        function calculatePolygonInfo(layer) {
            try {
                const geojson = layer.toGeoJSON();
                const bounds = layer.getBounds();
                const center = bounds.getCenter();
                const latlngs = layer.getLatLngs()[0];
                
                if (!Array.isArray(latlngs) || latlngs.length < 3) {
                    console.warn('⚠️ Polygon must have at least 3 points');
                    return null;
                }
                
                const areaSquareMeters = L.GeometryUtil.geodesicArea(latlngs);
                const areaHectares = areaSquareMeters / 10000;

                return {
                    polygon: geojson.geometry,
                    latitude: parseFloat(center.lat.toFixed(7)),
                    longitude: parseFloat(center.lng.toFixed(7)),
                    area_hectare: parseFloat(areaHectares.toFixed(3))
                };
            } catch (error) {
                console.error('❌ Error calculating polygon info:', error);
                return null;
            }
        }

        async function syncPolygonFields({
            layer,
            luasInput,
            koordinatInput,
            polygonInput,
            updateAddress = null
        }) {
            try {
                const info = calculatePolygonInfo(layer);
                if (!info) {
                    console.error('❌ Could not calculate polygon info');
                    return;
                }

                if (luasInput) {
                    luasInput.value = info.area_hectare.toFixed(2);
                }

                if (koordinatInput) {
                    koordinatInput.value = `${info.latitude.toFixed(8)},${info.longitude.toFixed(8)}`;
                }

                if (polygonInput) {
                    polygonInput.value = JSON.stringify(info.polygon);
                }

                if (typeof updateAddress === 'function') {
                    await updateAddress(info.latitude, info.longitude);
                }
            } catch (error) {
                console.error('❌ Error syncing polygon fields:', error);
            }
        }

        function clearPolygonFields({
            luasInput,
            koordinatInput,
            polygonInput,
            alamatInput = null
        }) {
            if (luasInput) {
                luasInput.value = '';
            }

            if (koordinatInput) {
                koordinatInput.value = '';
            }

            if (polygonInput) {
                polygonInput.value = '';
            }

            if (alamatInput) {
                alamatInput.value = '';
            }
        }

        function setDrawEnabled(drawControl, enabled) {
            const polygonMode = drawControl?._toolbars?.draw?._modes?.polygon;
            const button = polygonMode?.button;
            const handler = polygonMode?.handler;

            if (drawControl?.options?.draw) {
                drawControl.options.draw.polygon = true;
            }

            if (!button || !handler) {
                return;
            }

            if (enabled) {
                button.title = 'Gambar polygon';
                button.disabled = false;
                button.dataset.drawReady = 'true';
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
                return;
            }

            if (handler.enabled && handler.enabled()) {
                handler.disable();
            }

            button.title = 'Pilih lahan terlebih dahulu';
            button.disabled = true;
            button.dataset.drawReady = 'false';
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        }

        function bindPolygonToolbarButton(drawControl, beforeEnable = null) {
            const polygonMode = drawControl?._toolbars?.draw?._modes?.polygon;
            const button = polygonMode?.button;
            const handler = polygonMode?.handler;

            if (!button || !handler || button.dataset.manualPolygonBinding === 'true') {
                return;
            }

            button.dataset.manualPolygonBinding = 'true';
            button.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                if (typeof beforeEnable === 'function' && beforeEnable() === false) {
                    return;
                }

                if (typeof handler.enabled === 'function') {
                    if (!handler.enabled()) {
                        handler.enable();
                    }
                } else {
                    handler.enable();
                }
            });
        }

        function attachTreeCountSync(totalInput, ripeInput, unripeInput) {
            const sync = () => {
                const total = parseInt(totalInput?.value ?? '0', 10) || 0;
                const ripe = parseInt(ripeInput?.value ?? '0', 10) || 0;
                unripeInput.value = total - ripe;
            };

            totalInput?.addEventListener('input', sync);
            ripeInput?.addEventListener('input', sync);
        }

        function invalidateMapOnResize(map) {
            setTimeout(() => map.invalidateSize(), 200);
            window.addEventListener('resize', () => map.invalidateSize());
        }

        function createStatusBadgeUpdater(element) {
            return function(message, tone = 'warning') {
                if (!element) {
                    return;
                }

                const tones = {
                    warning: 'bg-amber-50 border-amber-100 text-amber-700',
                    success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
                    info: 'bg-blue-50 border-blue-100 text-blue-700',
                    danger: 'bg-red-50 border-red-100 text-red-700',
                };

                element.className = `inline-flex items-center gap-2 rounded-full px-3 py-1.5 border ${tones[tone]}`;
                element.textContent = message;
            };
        }

        return {
            addLegend,
            attachTreeCountSync,
            bindColorInput,
            calculatePolygonInfo,
            clearPolygonFields,
            createAddressUpdater,
            createStandardMap,
            createStatusBadgeUpdater,
            bindPolygonToolbarButton,
            fitMapToLayers,
            getPolygonStyle,
            invalidateMapOnResize,
            setDrawEnabled,
            syncPolygonFields,
        };
    })();
</script>
