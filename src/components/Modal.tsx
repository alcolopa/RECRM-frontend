import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = '100%', 
  maxWidth = '500px',
  showCloseButton = true
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000, // Very high z-index
            padding: '1rem',
          }}
        >
          {/* Backdrop Blur/Overlay */}
          <div
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
            }}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
            style={{
              position: 'relative',
              width,
              maxWidth,
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: '1.25rem',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)',
              maxHeight: 'calc(100vh - 2rem)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 10001,
            }}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--color-bg-card)'
              }}>
                {title && (
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    margin: 0,
                    color: 'var(--color-text)'
                  }}>
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    aria-label="Close modal"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      marginLeft: 'auto'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      e.currentTarget.style.color = 'var(--color-text)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-muted)';
                    }}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div style={{
              padding: '1.5rem',
              overflowY: 'auto',
              flex: 1
            }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
