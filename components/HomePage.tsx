
import React, { useState } from 'react';
import { APP_TITLE } from '../constants';
import Button from './shared/Button';
import Logo from './shared/Logo';

interface HomePageProps {
    onNavigateToLogin: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToLogin }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleStartExit = () => {
        setIsExiting(true);
        // Navigazione coordinata con la fine dell'animazione
        setTimeout(() => {
            onNavigateToLogin();
        }, 500);
    };

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-4 bg-[#f2f2f7] text-center overflow-hidden relative transition-all duration-500 ease-in-out`}>
            {/* Animated Mesh Background */}
            <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-indigo-400/15 rounded-full mix-blend-multiply filter blur-[100px] animate-mesh-1"></div>
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-300/15 rounded-full mix-blend-multiply filter blur-[100px] animate-mesh-2"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[70%] h-[70%] bg-rose-300/10 rounded-full mix-blend-multiply filter blur-[100px] animate-mesh-3"></div>
            </div>

            <div className={`relative z-10 max-w-2xl mx-auto flex flex-col items-center transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isExiting ? 'scale-95 opacity-0 blur-md' : 'scale-100 opacity-100 blur-0'}`}>
                {/* Logo Section */}
                <div className="mb-6 sm:mb-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                    <Logo className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-[0_15px_30px_rgba(0,0,0,0.08)]" />
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight leading-tight">
                    Benvenut* in <br /> 
                    <span className="text-indigo-600">{APP_TITLE}</span>
                </h1>
                
                {/* Small Description - Refined Font Size */}
                <p 
                    className="max-w-md mx-auto mt-4 text-xs sm:text-sm text-gray-500 whitespace-pre-line leading-relaxed animate-slide-up opacity-0 font-medium"
                    style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
                >
                    Un modo diverso di vivere il salone, dove ogni visita ha valore e ogni azione fa la differenza.{"\n"}
                    Accumula punti e riscatta premi fantastici!{"\n"}
                    Se ci tieni allo stile, sei nel posto giusto.
                </p>

                {/* Perfected Button - Proportional & Elegant */}
                <div 
                    className="mt-6 animate-slide-up opacity-0"
                    style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
                >
                    <Button 
                        onClick={handleStartExit} 
                        size="md" 
                        disabled={isExiting}
                        className="!text-[13px] !px-12 !py-3 transition-all duration-300 font-semibold tracking-[0.2em] uppercase !rounded-2xl shadow-sm hover:shadow-md active:scale-95"
                    >
                        ACCEDI
                    </Button>
                </div>
            </div>

            <style>
                {`
                    @keyframes mesh-1 {
                        0% { transform: translate(0, 0) scale(1); }
                        33% { transform: translate(5%, 5%) scale(1.05); }
                        66% { transform: translate(-2%, 8%) scale(0.98); }
                        100% { transform: translate(0, 0) scale(1); }
                    }
                    @keyframes mesh-2 {
                        0% { transform: translate(0, 0) scale(1.05); }
                        33% { transform: translate(-5%, -5%) scale(0.95); }
                        66% { transform: translate(8%, -2%) scale(1.02); }
                        100% { transform: translate(0, 0) scale(1.05); }
                    }
                    @keyframes mesh-3 {
                        0% { transform: translate(0, 0) scale(1); }
                        50% { transform: translate(-5%, 2%) scale(1.1); }
                        100% { transform: translate(0, 0) scale(1); }
                    }
                    .animate-mesh-1 { animation: mesh-1 20s infinite alternate ease-in-out; }
                    .animate-mesh-2 { animation: mesh-2 25s infinite alternate ease-in-out; }
                    .animate-mesh-3 { animation: mesh-3 22s infinite alternate ease-in-out; }
                `}
            </style>
        </div>
    );
};

export default HomePage;
