import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => { onDismiss(); }, 4000);
        return () => { clearTimeout(timer); };
    }, [onDismiss]);
    
    const baseClasses = "relative w-full p-4 pr-12 rounded-2xl shadow-xl text-white animate-toast-enter border border-white/10 backdrop-blur-xl";
    const typeClasses = {
        success: "bg-green-500/80 shadow-green-500/30",
        error: "bg-red-500/80 shadow-red-500/30",
    };

    const icon = type === 'success' ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
    );

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <div className="flex items-center">
                <div className="flex-shrink-0">{icon}</div>
                <div className="flex-1 text-sm font-semibold">{message}</div>
                <button onClick={onDismiss} className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-white/20 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export default Toast;
