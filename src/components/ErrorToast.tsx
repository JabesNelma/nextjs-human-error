'use client';

import React, { useEffect } from 'react';
import { ErrorToastProps } from '../types';

export const ErrorToast: React.FC<ErrorToastProps> = ({ 
  error, 
  onClose, 
  onRetry,
  retryLabel = 'Try Again',
  closeLabel = 'Close error notification',
  autoCloseMs = 8000,
}) => {
  useEffect(() => {
    if (!error.retryable) {
      const timer = setTimeout(onClose, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [error.retryable, onClose, autoCloseMs]);

  const icons = {
    network: '🌐',
    validation: '⚠️',
    auth: '🔒',
    server: '🔧',
    unknown: '💥',
  };

  const colors = {
    network: '#3b82f6',
    validation: '#f59e0b',
    auth: '#ef4444',
    server: '#8b5cf6',
    unknown: '#6b7280',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        maxWidth: '400px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        borderLeft: `4px solid ${colors[error.type]}`,
        padding: '16px',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: '24px' }}>{icons[error.type]}</span>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
          {error.title}
        </h3>
        <button
          onClick={onClose}
          aria-label={closeLabel}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#9ca3af',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4b5563', lineHeight: 1.5 }}>
        {error.message}
      </p>

      {error.action && (
        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
          💡 {error.action}
        </p>
      )}

      {error.code && (
        <code style={{ fontSize: '11px', color: '#9ca3af', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
          {error.code}
        </code>
      )}

      {error.retryable && onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '8px 16px',
            background: colors[error.type],
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {retryLabel}
        </button>
      )}

      {!error.retryable && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background: colors[error.type],
            borderRadius: '0 0 0 12px',
            animation: `progress ${autoCloseMs}ms linear forwards`,
          }}
        />
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};