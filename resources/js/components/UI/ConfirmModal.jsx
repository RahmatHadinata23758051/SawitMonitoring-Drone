import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

/**
 * ConfirmModal - Animated confirmation dialog rendered via React Portal
 * Using createPortal ensures it renders directly into document.body,
 * bypassing any parent CSS transforms or overflow that break position:fixed.
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
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    const modal = (
        <>
            {/* ── Keyframe styles ── */}
            <style>{`
                @keyframes cfm-backdrop { from { opacity:0; } to { opacity:1; } }
                @keyframes cfm-panel {
                    from { opacity:0; transform: scale(0.9) translateY(30px); }
                    to   { opacity:1; transform: scale(1)   translateY(0);    }
                }
            `}</style>

            {/* ── Backdrop ── */}
            <div
                onClick={onCancel}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 99998,
                    background: 'rgba(15,23,42,0.6)',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)',
                    animation: 'cfm-backdrop 0.2s ease forwards',
                }}
            />

            {/* ── Modal panel ── */}
            <div
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 99999,
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
                        maxWidth: '26rem',
                        borderRadius: '1.75rem',
                        background: '#ffffff',
                        boxShadow: '0 32px 72px -12px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                        animation: 'cfm-panel 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    }}
                >
                    {/* Top gradient accent */}
                    <div style={{
                        height: '5px',
                        background: isDanger
                            ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
                            : 'linear-gradient(90deg, #f59e0b, #d97706)',
                    }} />

                    {/* Body */}
                    <div style={{ padding: '2rem 2rem 1.25rem' }}>
                        {/* Icon circle */}
                        <div style={{
                            width: '4rem', height: '4rem',
                            borderRadius: '1rem',
                            background: isDanger ? '#fff1f2' : '#fffbeb',
                            border: `3px solid ${isDanger ? '#fecdd3' : '#fde68a'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                            color: isDanger ? '#e11d48' : '#d97706',
                        }}>
                            {isDanger ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
                        </div>

                        {/* Title */}
                        <h2 id="cfm-title" style={{
                            fontSize: '1.2rem', fontWeight: 900,
                            color: '#0f172a', textAlign: 'center',
                            margin: '0 0 0.5rem',
                        }}>
                            {title}
                        </h2>

                        {/* Message */}
                        <p style={{
                            fontSize: '0.875rem', fontWeight: 500,
                            color: '#64748b', textAlign: 'center',
                            lineHeight: 1.6, margin: '0 0 0.35rem',
                        }}>
                            {message}
                        </p>

                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontWeight: 600 }}>
                            Tindakan ini{' '}
                            <span style={{ color: '#e11d48' }}>tidak dapat dibatalkan</span>.
                        </p>
                    </div>

                    {/* Actions */}
                    <div style={{
                        padding: '0 2rem 2rem',
                        display: 'flex', gap: '0.75rem',
                        flexDirection: 'row',
                    }}>
                        {/* Cancel */}
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.4rem', padding: '0.75rem 1.25rem',
                                borderRadius: '0.875rem', border: 'none', cursor: 'pointer',
                                background: '#f1f5f9', color: '#475569',
                                fontWeight: 700, fontSize: '0.875rem',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.target.style.background = '#e2e8f0'}
                            onMouseLeave={e => e.target.style.background = '#f1f5f9'}
                        >
                            <X size={15} /> {cancelText}
                        </button>

                        {/* Confirm */}
                        <button
                            type="button"
                            onClick={onConfirm}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.4rem', padding: '0.75rem 1.25rem',
                                borderRadius: '0.875rem', border: 'none', cursor: 'pointer',
                                background: isDanger ? '#e11d48' : '#d97706',
                                color: '#fff',
                                fontWeight: 700, fontSize: '0.875rem',
                                boxShadow: isDanger
                                    ? '0 6px 16px -2px rgba(225,29,72,0.4)'
                                    : '0 6px 16px -2px rgba(217,119,6,0.4)',
                                transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            {isDanger ? <Trash2 size={15} /> : <AlertTriangle size={15} />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    // Render into document.body to escape any parent transform / overflow issues
    return ReactDOM.createPortal(modal, document.body);
};

export default ConfirmModal;
