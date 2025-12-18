import React from 'react';
import { ToastData } from '../../types';
import Toast from './Toast';

interface ToastContainerProps {
    toasts: ToastData[];
    setToasts: React.Dispatch<React.SetStateAction<ToastData[]>>;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, setToasts }) => {
    
    const handleDismiss = (id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };

    return (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 z-[1100] flex flex-col items-center sm:items-end w-auto sm:w-full sm:max-w-xs space-y-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="w-full pointer-events-auto max-w-xs sm:max-w-full">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onDismiss={() => handleDismiss(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;