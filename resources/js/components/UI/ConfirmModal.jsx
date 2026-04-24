import React, { useEffect } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

/**
 * ConfirmModal - Reusable animated confirmation dialog
 *
 * Props:
 *  isOpen   : bool   - controls visibility
 *  title    : string - modal title
 *  message  : string - modal body message
 *  onConfirm: fn     - called when user clicks confirm
 *  onCancel : fn     - called when user clicks cancel / backdrop
 *  variant  : 'danger' | 'warning' (default: 'danger')
 */
const ConfirmModal = ({
    isOpen,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin ingin melanjutkan?',
    onConfirm,
    onCancel,
    variant = 'danger',
    confirmText = 'Hapus',
    cancelText = 'Batal',
}) => {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onCancel]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const isDanger  = variant === 'danger';
    const accentCls = isDanger
        ? 'bg-rose-50 text-rose-600 ring-rose-200'
        : 'bg-amber-50 text-amber-600 ring-amber-200';
    const btnCls    = isDanger
        ? 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500/40 shadow-rose-500/30'
        : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/40 shadow-amber-500/30';

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                style={{ animation: 'cfm-fade-in 0.2s ease' }}
                onClick={onCancel}
            />

            {/* Panel */}
            <div
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                style={{ animation: 'cfm-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
                {/* Top accent bar */}
                <div className={`h-1.5 w-full ${isDanger ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`} />

                {/* Content */}
                <div className="px-8 pt-8 pb-6">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ring-4 mx-auto mb-5 ${accentCls}`}>
                        {isDanger ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
                    </div>

                    {/* Text */}
                    <h2 id="confirm-modal-title" className="text-xl font-black text-slate-800 text-center mb-2">
                        {title}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 text-center leading-relaxed">
                        {message}
                    </p>
                    <p className="text-xs font-semibold text-slate-400 text-center mt-1">
                        Tindakan ini <span className="text-rose-500">tidak dapat dibatalkan</span>.
                    </p>
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                        <X size={16} />
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm transition-all shadow-lg focus:outline-none focus:ring-2 ${btnCls}`}
                    >
                        {isDanger ? <Trash2 size={16} /> : <AlertTriangle size={16} />}
                        {confirmText}
                    </button>
                </div>
            </div>

            {/* Keyframe animations injected once */}
            <style>{`
                @keyframes cfm-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes cfm-slide-up {
                    from { opacity: 0; transform: translateY(24px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ConfirmModal;
