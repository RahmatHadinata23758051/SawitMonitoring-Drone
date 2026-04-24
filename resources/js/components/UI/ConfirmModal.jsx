import React, { useEffect } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

/**
 * ConfirmModal - Reusable animated confirmation dialog
 * Uses two separate fixed layers (backdrop + panel) to avoid z-index stacking issues.
 */
const ConfirmModal = ({
    isOpen,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin ingin melanjutkan?',
    onConfirm,
    onCancel,
    variant = 'danger',
    confirmText = 'Ya, Hapus',
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
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const isDanger  = variant === 'danger';
    const accentRing = isDanger ? 'ring-rose-200' : 'ring-amber-200';
    const accentBg   = isDanger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600';
    const barCls     = isDanger
        ? 'bg-gradient-to-r from-rose-400 to-rose-600'
        : 'bg-gradient-to-r from-amber-400 to-amber-600';
    const btnCls     = isDanger
        ? 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-300 shadow-rose-200'
        : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300 shadow-amber-200';

    return (
        <>
            {/* ── Layer 1: Backdrop ─────────────────────────────────── */}
            <div
                onClick={onCancel}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9998,
                    backgroundColor: 'rgba(15,23,42,0.55)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    animation: 'cfm-fade 0.2s ease forwards',
                }}
            />

            {/* ── Layer 2: Panel ───────────────────────────────────── */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    pointerEvents: 'none',
                }}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cfm-title"
                    style={{
                        pointerEvents: 'auto',
                        width: '100%',
                        maxWidth: '28rem',
                        backgroundColor: '#fff',
                        borderRadius: '1.5rem',
                        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25)',
                        border: '1px solid #f1f5f9',
                        overflow: 'hidden',
                        animation: 'cfm-slide 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    }}
                >
                    {/* Accent bar */}
                    <div className={`h-1.5 w-full ${barCls}`} />

                    {/* Body */}
                    <div className="px-8 pt-8 pb-6">
                        {/* Icon */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ring-4 mx-auto mb-5 ${accentBg} ${accentRing}`}>
                            {isDanger ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
                        </div>

                        <h2
                            id="cfm-title"
                            className="text-xl font-black text-slate-800 text-center mb-2"
                        >
                            {title}
                        </h2>

                        <p className="text-sm font-medium text-slate-500 text-center leading-relaxed">
                            {message}
                        </p>

                        <p className="text-xs font-semibold text-center mt-1.5 text-slate-400">
                            Tindakan ini{' '}
                            <span className="text-rose-500 font-bold">tidak dapat dibatalkan</span>.
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
            </div>

            {/* Keyframe animations */}
            <style>{`
                @keyframes cfm-fade {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes cfm-slide {
                    from { opacity: 0; transform: scale(0.92) translateY(20px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);    }
                }
            `}</style>
        </>
    );
};

export default ConfirmModal;
