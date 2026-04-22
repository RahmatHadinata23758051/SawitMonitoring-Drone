import "./bootstrap";

import Alpine from "alpinejs";
import Hls from "hls.js";
import ApexCharts from "apexcharts";
import nipplejs from 'nipplejs';

// jQuery (harus pertama)
import $ from "jquery";
window.$ = window.jQuery = $;

// DataTables
import "datatables.net-dt";
import "datatables.net-buttons-dt";
import "datatables.net-buttons/js/buttons.html5.mjs";
import "datatables.net-buttons/js/buttons.print.mjs";

// JSZip (untuk excel)
import JSZip from "jszip";
window.JSZip = JSZip;

// Sweetalert
import Swal from "sweetalert2";
window.Swal = Swal;

// Global libs
window.Alpine = Alpine;
window.Hls = Hls;
window.ApexCharts = ApexCharts;
window.nipplejs = nipplejs;

Alpine.start();
