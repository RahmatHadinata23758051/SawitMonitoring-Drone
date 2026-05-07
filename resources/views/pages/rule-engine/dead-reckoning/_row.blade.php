<tr class="rule-row hover:bg-slate-50/60 transition-colors" data-id="{{ $rule->id }}">
    <td class="px-3 py-4 text-slate-300 drag-handle" style="cursor:grab">
        <i class="fa-solid fa-grip-vertical text-base"></i>
    </td>
    <td class="px-3 py-4">
        <span class="step-no text-xs font-bold text-slate-400 bg-slate-100 rounded-full inline-flex w-6 h-6 items-center justify-center">
            {{ $i + 1 }}
        </span>
    </td>
    <td class="px-5 py-4">
        <span class="cell-label font-mono font-bold text-primary text-sm">{{ $rule->drone_dataset->label }}</span>
    </td>
    <td class="px-5 py-4">
        <span class="cell-durasi font-mono font-black text-slate-800 text-xl">{{ $rule->durasi }}</span>
    </td>
    <td class="px-5 py-4">
        <span class="cell-satuan text-xs border border-slate-300 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full font-medium">{{ $rule->satuan_waktu }}</span>
    </td>
    <td class="px-5 py-4">
        <div class="flex items-center justify-end gap-2">
            <button type="button" class="btn-edit inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition shadow-sm"
                data-id="{{ $rule->id }}"
                data-aksi-id="{{ $rule->drone_dataset_id }}"
                data-durasi="{{ $rule->durasi }}"
                data-satuan="{{ $rule->satuan_waktu }}"
                title="Edit">
                <i class="fa fa-pen text-xs"></i>
            </button>
            <button type="button" class="btn-delete inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition shadow-sm"
                data-id="{{ $rule->id }}"
                data-label="{{ $rule->drone_dataset->label }}"
                data-url="{{ route('dead-reckoning.destroyAjax', $rule->id) }}"
                title="Hapus">
                <i class="fa fa-trash text-xs"></i>
            </button>
        </div>
    </td>
</tr>
