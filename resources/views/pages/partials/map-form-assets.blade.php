<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
<script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
<script src="https://unpkg.com/leaflet-geometryutil@0.10.3/src/leaflet.geometryutil.js"></script>
<script src="https://unpkg.com/@turf/turf@6.5.0/turf.min.js"></script>
<script>
    window.MapFormHelpers = window.MapFormHelpers || (() => {
        function createStandardMap({
            mapId = 'map',
            defaultCenter = [-2.5489, 118.0149],
            defaultZoom = 5
        } = {}) {
            const map = L.map(mapId, {
                zoomControl: true,
            });

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

        async function syncPolygonFields({
            layer,
            luasInput,
            koordinatInput,
            polygonInput,
            updateAddress = null
        }) {
            const latlngs = layer.getLatLngs()[0];
            const area = L.GeometryUtil.geodesicArea(latlngs);
            const hektar = (area / 10000).toFixed(2);
            const center = layer.getBounds().getCenter();

            if (luasInput) {
                luasInput.value = hektar;
            }

            if (koordinatInput) {
                koordinatInput.value = `${center.lat.toFixed(8)},${center.lng.toFixed(8)}`;
            }

            if (polygonInput) {
                polygonInput.value = JSON.stringify(layer.toGeoJSON());
            }

            if (typeof updateAddress === 'function') {
                await updateAddress(center.lat, center.lng);
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

            if (!button) {
                return;
            }

            if (enabled) {
                button.classList.remove('leaflet-disabled');
                button.removeAttribute('aria-disabled');
                button.title = 'Gambar polygon';
                return;
            }

            if (handler?.enabled && handler.enabled()) {
                handler.disable();
            }

            button.classList.add('leaflet-disabled');
            button.setAttribute('aria-disabled', 'true');
            button.title = 'Pilih lahan terlebih dahulu';
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
            clearPolygonFields,
            createAddressUpdater,
            createStandardMap,
            createStatusBadgeUpdater,
            fitMapToLayers,
            getPolygonStyle,
            invalidateMapOnResize,
            setDrawEnabled,
            syncPolygonFields,
        };
    })();
</script>
