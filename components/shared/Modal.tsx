
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    title: React.ReactNode;
    children: React.ReactNode;
    onClose: () => void;
    size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    className?: string;
}

const modalRoot = document.getElementById('modal-root');

const Modal: React.FC<ModalProps> = ({ title, children, onClose, size = 'lg', className = '' }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        // Prevent body scrolling when modal is open (extra safety)
        const originalStyle = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = originalStyle;
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    // STANDARDIZED SIZES:
    // md -> 500px (Compact, good for alerts/confirms)
    // lg -> 600px (Standard forms)
    // xl -> 750px (Wider forms, comfortable for grids)
    // 2xl -> 1024px (Large Data tables)
    // 3xl -> 1200px (Extra large)
    const sizeClasses = { 
        md: 'sm:w-[500px]', 
        lg: 'sm:w-[600px]', 
        xl: 'sm:w-[750px]', 
        '2xl': 'sm:w-[90vw] lg:w-[1024px] max-w-[95vw]', 
        '3xl': 'sm:w-[90vw] lg:w-[1200px] max-w-[95vw]' 
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 200);
    };

    const modalContent = (
        <div 
            className="fixed inset-0 z-[1050] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop with heavy blur for premium feel */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl transition-opacity duration-300"
                style={{opacity: isClosing ? 0 : 1}}
                onClick={handleClose}
            ></div>

            {/* Modal Panel */}
            <div 
                className={`relative bg-white rounded-[2rem] shadow-2xl w-[95%] sm:w-auto ${sizeClasses[size]} max-h-[90dvh] flex flex-col overflow-hidden transform transition-all mt-auto sm:mt-0 ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'} ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start px-8 py-6 border-b border-slate-100 bg-white/90 backdrop-blur-sm z-20 shrink-0">
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pr-4 leading-snug break-words">
                        {title}
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex-shrink-0 bg-slate-50 border border-slate-100"
                        aria-label="Chiudi"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body - SCROLLS INTERNALLY - No nested scrollbars in children ideally */}
                {/* Removed min-h-[300px] to allow modal to shrink for small content (like delete confirmation) */}
                <div className="p-0 overflow-y-auto custom-scrollbar overscroll-contain flex-1 relative">
                     <div className="p-8">
                        {children}
                     </div>
                </div>
            </div>
        </div>
    );

    if (!modalRoot) return null;

    return createPortal(modalContent, modalRoot);
};

export default Modal;
