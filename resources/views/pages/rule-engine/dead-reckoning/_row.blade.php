@php
    $satuanCls = match(strtolower($rule->satuan_waktu)) {
        'menit' => 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
        'milidetik' => 'bg-purple-50 text-purple-700 border-purple-100/80',
        default => 'bg-blue-50 text-blue-700 border-blue-100/80',
    };
@endphp
<tr class="rule-row hover:bg-slate-50/60 transition-colors" data-id="{{ $rule->id }}">
    <td class="px-3 py-4 text-slate-300 drag-handle" style="cursor:grab">
        <i class="fa-solid fa-grip-vertical text-base"></i>
    </td>
    <td class="px-3 py-4">
        <span class="step-no text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200/50 rounded-full inline-flex w-6 h-6 items-center justify-center font-mono">
            {{ $i + 1 }}
        </span>
    </td>
    <td class="px-5 py-4">
        <span class="cell-label font-mono font-bold text-slate-700 text-sm">{{ $rule->drone_dataset->label }}</span>
    </td>
    <td class="px-5 py-4">
        <span class="cell-durasi font-mono font-black text-slate-800 text-sm">{{ $rule->durasi }}</span>
    </td>
    <td class="px-5 py-4">
        <span class="cell-satuan text-[10px] font-bold border px-2.5 py-1 rounded-full uppercase tracking-wider {{ $satuanCls }}">{{ $rule->satuan_waktu }}</span>
    </td>
    <td class="px-5 py-4">
        <div class="flex items-center justify-end gap-2">
            <button type="button" class="btn-edit inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
                data-id="{{ $rule->id }}"
                data-aksi-id="{{ $rule->drone_dataset_id }}"
                data-durasi="{{ $rule->durasi }}"
                data-satuan="{{ $rule->satuan_waktu }}"
                title="Edit">
                <i class="fa fa-pen text-[10px]"></i>
            </button>
            <button type="button" class="btn-delete inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
                data-id="{{ $rule->id }}"
                data-label="{{ $rule->drone_dataset->label }}"
                data-url="{{ route('dead-reckoning.destroyAjax', $rule->id) }}"
                title="Hapus">
                <i class="fa fa-trash text-[10px]"></i>
            </button>
        </div>
    </td>
</tr>
