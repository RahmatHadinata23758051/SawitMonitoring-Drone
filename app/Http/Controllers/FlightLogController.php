<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use App\Models\FlightLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

/**
 * FlightLogController — BL-09
 * Menangani persistensi log penerbangan dari React GCS ke database.
 */
class FlightLogController extends Controller
{
    private function validateFlightLogFilters(Request $request): array
    {
        return $request->validate([
            'tanggal_dari' => 'nullable|date',
            'tanggal_sampai' => 'nullable|date|after_or_equal:tanggal_dari',
        ]);
    }

    private function buildFlightLogQuery(Request $request): Builder
    {
        $filters = $this->validateFlightLogFilters($request);
        $query = FlightLog::query()->with(['mission', 'perangkat']);

        if (!empty($filters['tanggal_dari'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['tanggal_dari'], 'Asia/Jakarta')->startOfDay());
        }

        if (!empty($filters['tanggal_sampai'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['tanggal_sampai'], 'Asia/Jakarta')->endOfDay());
        }

        return $query;
    }

    private function buildFilterLabel(?string $dateFrom, ?string $dateTo): string
    {
        if ($dateFrom && $dateTo) {
            return Carbon::parse($dateFrom)->translatedFormat('d M Y') . ' - ' . Carbon::parse($dateTo)->translatedFormat('d M Y');
        }

        if ($dateFrom) {
            return 'Mulai ' . Carbon::parse($dateFrom)->translatedFormat('d M Y');
        }

        if ($dateTo) {
            return 'Sampai ' . Carbon::parse($dateTo)->translatedFormat('d M Y');
        }

        return 'Semua Tanggal';
    }

    private function exportHeadings(): array
    {
        return [
            'Kode Log',
            'Tanggal',
            'Nama Misi',
            'Algoritma',
            'Mode Scan',
            'Waktu Terbang',
            'Sampel',
            'Matang',
            'Belum Matang',
            'Akurasi',
            'Status',
        ];
    }

    private function exportRows($logs): array
    {
        return $logs->map(function ($log) {
            return [
                $log->log_code,
                $log->created_at?->timezone('Asia/Jakarta')->format('Y-m-d H:i:s') ?? '-',
                $log->mission_name,
                match ($log->nav_algorithm) {
                    'dead_reckoning' => 'Dead Reckoning',
                    'live_reckoning' => 'Live Reckoning',
                    'hybrid' => 'Hybrid',
                    default => ucfirst((string) $log->nav_algorithm),
                },
                $log->scan_mode === 'qlv' ? 'QLV' : 'Tradisional',
                $log->flight_time_label,
                (int) $log->samples_count,
                (int) $log->matang,
                (int) $log->belum_matang,
                number_format((float) $log->accuracy, 1) . '%',
                ucfirst((string) $log->status),
            ];
        })->all();
    }

    private function exportFilenameBase(string $label): string
    {
        $slug = Str::slug($label ?: 'semua-tanggal');
        return 'log_penerbangan_' . $slug . '_' . now('Asia/Jakarta')->format('Ymd_His');
    }

    private function xmlEscape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }

    private function xlsxColumnName(int $index): string
    {
        $name = '';

        while ($index > 0) {
            $index--;
            $name = chr(65 + ($index % 26)) . $name;
            $index = intdiv($index, 26);
        }

        return $name;
    }

    private function buildXlsxWorksheetXml(array $matrix): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        $xml .= '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';

        foreach ($matrix as $rowIndex => $row) {
            $rowNumber = $rowIndex + 1;
            $xml .= '<row r="' . $rowNumber . '">';

            foreach ($row as $columnIndex => $value) {
                $cellRef = $this->xlsxColumnName($columnIndex + 1) . $rowNumber;
                $styleIndex = in_array($rowNumber, [1, 4], true) ? '1' : '0';
                $stringValue = (string) $value;

                if ($stringValue !== '' && is_numeric($value) && !str_starts_with($stringValue, '0')) {
                    $xml .= '<c r="' . $cellRef . '" s="' . $styleIndex . '"><v>' . $stringValue . '</v></c>';
                    continue;
                }

                $xml .= '<c r="' . $cellRef . '" s="' . $styleIndex . '" t="inlineStr"><is><t xml:space="preserve">' .
                    $this->xmlEscape($stringValue) .
                    '</t></is></c>';
            }

            $xml .= '</row>';
        }

        $xml .= '</sheetData></worksheet>';

        return $xml;
    }

    private function buildXlsxFile(array $matrix): string
    {
        $filePath = tempnam(sys_get_temp_dir(), 'flight_logs_');
        $zip = new ZipArchive();

        if ($zip->open($filePath, ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Gagal membuat file XLSX.');
        }

        $createdAt = now('UTC')->format('Y-m-d\TH:i:s\Z');
        $worksheetXml = $this->buildXlsxWorksheetXml($matrix);

        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            . '<Default Extension="xml" ContentType="application/xml"/>'
            . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            . '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
            . '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
            . '</Types>');

        $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
            . '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
            . '</Relationships>');

        $zip->addFromString('docProps/app.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
            . '<Application>Microsoft Excel</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop>'
            . '<HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs>'
            . '<TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Log Penerbangan</vt:lpstr></vt:vector></TitlesOfParts>'
            . '<Company></Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0300</AppVersion>'
            . '</Properties>');

        $zip->addFromString('docProps/core.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            . '<dc:title>Log Penerbangan</dc:title>'
            . '<dc:creator>Codex</dc:creator>'
            . '<cp:lastModifiedBy>Codex</cp:lastModifiedBy>'
            . '<dcterms:created xsi:type="dcterms:W3CDTF">' . $createdAt . '</dcterms:created>'
            . '<dcterms:modified xsi:type="dcterms:W3CDTF">' . $createdAt . '</dcterms:modified>'
            . '</cp:coreProperties>');

        $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<sheets><sheet name="Log Penerbangan" sheetId="1" r:id="rId1"/></sheets>'
            . '</workbook>');

        $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            . '</Relationships>');

        $zip->addFromString('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
            . '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
            . '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            . '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            . '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>'
            . '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
            . '</styleSheet>');

        $zip->addFromString('xl/worksheets/sheet1.xml', $worksheetXml);
        $zip->close();

        return $filePath;
    }

    private function pdfEscape(string $value): string
    {
        return str_replace(
            ['\\', '(', ')'],
            ['\\\\', '\(', '\)'],
            Str::ascii($value)
        );
    }

    private function buildPdfDocument(array $pages): string
    {
        $objects = [
            1 => '<< /Type /Catalog /Pages 2 0 R >>',
            2 => '',
            3 => '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>',
        ];

        $pageRefs = [];
        $nextObjectId = 4;

        foreach ($pages as $pageContent) {
            $pageId = $nextObjectId++;
            $contentId = $nextObjectId++;
            $pageRefs[] = $pageId . ' 0 R';

            $objects[$pageId] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ' . $contentId . ' 0 R >>';
            $objects[$contentId] = '<< /Length ' . strlen($pageContent) . " >>\nstream\n" . $pageContent . "\nendstream";
        }

        $objects[2] = '<< /Type /Pages /Kids [' . implode(' ', $pageRefs) . '] /Count ' . count($pageRefs) . ' >>';
        ksort($objects);

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $id => $content) {
            $offsets[$id] = strlen($pdf);
            $pdf .= $id . " 0 obj\n" . $content . "\nendobj\n";
        }

        $xrefPosition = strlen($pdf);
        $pdf .= 'xref' . "\n";
        $pdf .= '0 ' . (count($objects) + 1) . "\n";
        $pdf .= "0000000000 65535 f \n";

        foreach (array_keys($objects) as $id) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$id]);
        }

        $pdf .= 'trailer << /Size ' . (count($objects) + 1) . ' /Root 1 0 R >>' . "\n";
        $pdf .= 'startxref' . "\n" . $xrefPosition . "\n%%EOF";

        return $pdf;
    }

    private function buildPdfContent(array $rows, string $rangeLabel): string
    {
        $lines = [
            'LAPORAN LOG PENERBANGAN',
            'Rentang Export: ' . $rangeLabel,
            'Generated: ' . now('Asia/Jakarta')->format('Y-m-d H:i:s') . ' WIB',
            '',
            sprintf(
                '%-18s %-19s %-24s %-12s %-11s %7s %7s %7s %8s',
                'Kode Log',
                'Tanggal',
                'Nama Misi',
                'Algoritma',
                'Mode',
                'Sampel',
                'Matang',
                'Belum',
                'Akurasi'
            ),
            str_repeat('-', 127),
        ];

        foreach ($rows as $row) {
            $lines[] = sprintf(
                '%-18s %-19s %-24s %-12s %-11s %7s %7s %7s %8s',
                Str::limit(Str::ascii((string) $row[0]), 18, ''),
                Str::limit(Str::ascii((string) $row[1]), 19, ''),
                Str::limit(Str::ascii((string) $row[2]), 24, ''),
                Str::limit(Str::ascii((string) $row[3]), 12, ''),
                Str::limit(Str::ascii((string) $row[4]), 11, ''),
                Str::limit((string) $row[6], 7, ''),
                Str::limit((string) $row[7], 7, ''),
                Str::limit((string) $row[8], 7, ''),
                Str::limit((string) $row[9], 8, '')
            );
        }

        if (count($rows) === 0) {
            $lines[] = 'Tidak ada data log penerbangan pada rentang yang dipilih.';
        }

        $pages = array_chunk($lines, 42);
        $pageStreams = [];

        foreach ($pages as $pageLines) {
            $commands = [
                'BT',
                '/F1 9 Tf',
                '11 TL',
                '28 805 Td',
            ];

            foreach ($pageLines as $index => $line) {
                if ($index > 0) {
                    $commands[] = 'T*';
                }

                $commands[] = '(' . $this->pdfEscape($line) . ') Tj';
            }

            $commands[] = 'ET';
            $pageStreams[] = implode("\n", $commands);
        }

        return $this->buildPdfDocument($pageStreams);
    }

    private function exportAsCsv($logs, string $rangeLabel, string $fileName): StreamedResponse
    {
        $headings = $this->exportHeadings();
        $rows = $this->exportRows($logs);

        return response()->streamDownload(function () use ($headings, $rows, $rangeLabel) {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Laporan Log Penerbangan']);
            fputcsv($output, ['Rentang Export', $rangeLabel]);
            fputcsv($output, []);
            fputcsv($output, $headings);

            foreach ($rows as $row) {
                fputcsv($output, $row);
            }

            fclose($output);
        }, $fileName . '.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function exportAsXlsx($logs, string $rangeLabel, string $fileName)
    {
        $matrix = [
            ['Laporan Log Penerbangan'],
            ['Rentang Export', $rangeLabel],
            [],
            $this->exportHeadings(),
            ...$this->exportRows($logs),
        ];

        $filePath = $this->buildXlsxFile($matrix);

        return response()->download(
            $filePath,
            $fileName . '.xlsx',
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        )->deleteFileAfterSend(true);
    }

    private function exportAsPdf($logs, string $rangeLabel, string $fileName)
    {
        $pdfContent = $this->buildPdfContent($this->exportRows($logs), $rangeLabel);

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '.pdf"',
        ]);
    }

    /**
     * GET /api/flight-logs
     * Ambil semua log penerbangan (terbaru di atas) → JSON untuk GCS React
     */
    public function index()
    {
        $logs = FlightLog::with(['mission', 'perangkat'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn ($log) => [
                'id'           => 'LOG-' . $log->id,
                'date'         => $log->created_at->format('d/m/Y H:i:s'),
                'name'         => $log->mission_name,
                'nav'          => $log->nav_algorithm ?? 'hybrid',
                'scan'         => $log->scan_mode ?? 'traditional',
                'flightTime'   => $log->flight_time_seconds,
                'samples'      => $log->samples_count,
                'matang'       => $log->matang,
                'belumMatang'  => $log->belum_matang,
                'batteryUsed'  => (float) $log->battery_used,
                'accuracy'     => (float) $log->accuracy,
            ]);

        return response()->json($logs);
    }

    /**
     * POST /api/flight-logs
     * Dipanggil dari React GCS saat drone LANDING (newAlt <= 0)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'mission_name'        => 'required|string|max:255',
            'mission_id'          => 'nullable|integer|exists:missions,id',
            'nav_algorithm'       => 'nullable|string|in:dead_reckoning,live_reckoning,hybrid,manual,Manual Control',
            'scan_mode'           => 'nullable|string|in:traditional,qlv,manual,Manual',
            'flight_time_seconds' => 'required|integer|min:0',
            'battery_used'        => 'required|numeric|min:0',
            'samples_count'       => 'required|integer|min:0',
            'matang'              => 'required|integer|min:0',
            'belum_matang'        => 'required|integer|min:0',
            'accuracy'            => 'required|numeric|min:0|max:100',
            'config_data'         => 'nullable|array',
        ]);

        // Generate kode log unik: LOG-YYYYMMDD-HHMM-RAND
        $logCode = 'LOG-' . date('Ymd-Hi') . '-' . strtoupper(substr(uniqid(), -4));

        $log = FlightLog::create([
            'log_code'            => $logCode,
            'mission_id'          => $validated['mission_id'] ?? null,
            'mission_name'        => $validated['mission_name'],
            'nav_algorithm'       => $validated['nav_algorithm'] ?? 'hybrid',
            'scan_mode'           => $validated['scan_mode'] ?? 'traditional',
            'flight_time_seconds' => $validated['flight_time_seconds'],
            'battery_used'        => $validated['battery_used'],
            'samples_count'       => $validated['samples_count'],
            'matang'              => $validated['matang'],
            'belum_matang'        => $validated['belum_matang'],
            'accuracy'            => $validated['accuracy'],
            'config_data'         => $validated['config_data'] ?? null,
            'status'              => 'completed',
        ]);

        if ($request->has('telemetry_data') && is_array($request->telemetry_data)) {
            $details = [];
            foreach ($request->telemetry_data as $data) {
                $details[] = [
                    'flight_log_id' => $log->id,
                    'timestamp'     => $data['timestamp'] ?? null,
                    'lat'           => $data['lat'] ?? null,
                    'lon'           => $data['lon'] ?? null,
                    'alt'           => $data['alt'] ?? null,
                    'ax'            => $data['ax'] ?? null,
                    'ay'            => $data['ay'] ?? null,
                    'az'            => $data['az'] ?? null,
                    'gx'            => $data['gx'] ?? null,
                    'gy'            => $data['gy'] ?? null,
                    'gz'            => $data['gz'] ?? null,
                    'mode'          => $data['mode'] ?? null,
                    'sub_state'     => $data['subState'] ?? null,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ];
            }
            \App\Models\FlightLogDetail::insert($details);
        }

        // Activity log
        try {
            activity()
                ->performedOn($log)
                ->event('create')
                ->causedBy(Auth::user())
                ->log("Log penerbangan tercatat otomatis: {$log->mission_name} [{$log->log_code}] — {$log->samples_count} sampel, akurasi {$log->accuracy}%");
        } catch (\Exception $e) {
            Log::warning('Activity log gagal untuk FlightLog #' . $log->id . ': ' . $e->getMessage());
        }

        return response()->json([
            'status'  => true,
            'message' => 'Log penerbangan berhasil disimpan',
            'data'    => [
                'id'       => 'LOG-' . $log->id,
                'log_code' => $log->log_code,
                'date'     => $log->created_at->format('d/m/Y H:i:s'),
            ],
        ], 201);
    }

    /**
     * GET /api/flight-logs/{logCode}/details
     * Ambil data telemetry raw sensor untuk penerbangan tertentu
     */
    public function details($logCode)
    {
        $log = FlightLog::where('log_code', $logCode)->firstOrFail();
        $details = $log->details()->orderBy('id', 'asc')->get();
        return response()->json([
            'status' => true,
            'data' => $details
        ]);
    }

    /**
     * GET /laporan/log-penerbangan (Blade view — BL-09 final)
     * Tampilkan flight_logs dari DB (bukan missions)
     */
    public function logPenerbangan(Request $request)
    {
        $query = $this->buildFlightLogQuery($request);
        $flightLogs = (clone $query)
            ->latest()
            ->paginate(20)
            ->withQueryString();

        // Aggregate stats
        $summary = (clone $query)
            ->selectRaw('COALESCE(SUM(samples_count), 0) as total_samples')
            ->selectRaw('COALESCE(SUM(matang), 0) as total_matang')
            ->selectRaw('COALESCE(SUM(belum_matang), 0) as total_belum')
            ->selectRaw('COALESCE(AVG(accuracy), 0) as avg_accuracy')
            ->first();

        $totalSamples   = (int) ($summary->total_samples ?? 0);
        $totalMatang    = (int) ($summary->total_matang ?? 0);
        $totalBelum     = (int) ($summary->total_belum ?? 0);
        $avgAccuracy    = (float) ($summary->avg_accuracy ?? 0);
        $countQlv       = (clone $query)->where('scan_mode', 'qlv')->count();
        $countTrad      = (clone $query)->where('scan_mode', 'traditional')->count();
        $filterLabel    = $this->buildFilterLabel($request->input('tanggal_dari'), $request->input('tanggal_sampai'));

        return view('pages.laporan.log-penerbangan', compact(
            'flightLogs',
            'totalSamples', 'totalMatang', 'totalBelum', 'avgAccuracy',
            'countQlv', 'countTrad', 'filterLabel',
        ));
    }

    public function export(Request $request, string $format)
    {
        abort_unless(in_array($format, ['csv', 'xlsx', 'pdf'], true), 404);

        $logs = $this->buildFlightLogQuery($request)
            ->latest()
            ->get();

        $rangeLabel = $this->buildFilterLabel($request->input('tanggal_dari'), $request->input('tanggal_sampai'));
        $fileName = $this->exportFilenameBase($rangeLabel);

        return match ($format) {
            'csv' => $this->exportAsCsv($logs, $rangeLabel, $fileName),
            'xlsx' => $this->exportAsXlsx($logs, $rangeLabel, $fileName),
            'pdf' => $this->exportAsPdf($logs, $rangeLabel, $fileName),
        };
    }
}
