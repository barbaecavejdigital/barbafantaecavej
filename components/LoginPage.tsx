
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { login } from '../services/dataService';
import { APP_TITLE } from '../constants';
import Button from './shared/Button';
import Card from './shared/Card';
import Logo from './shared/Logo';

interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
    onNavigateToHome: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, showToast, onNavigateToHome }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isEntering, setIsEntering] = useState(true);

    useEffect(() => {
        // Rimuove lo stato iniziale di entrata dopo un frame per l'effetto zoom-in
        const timer = setTimeout(() => setIsEntering(false), 50);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(username, password);
            if (user) {
                // Transizione diretta al successo
                showToast(`Benvenuto/a ${user.firstName || user.username}!`, 'success');
                onLoginSuccess(user);
            } else {
                setError('Credenziali non valide.');
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('Si è verificato un errore. Controlla la connessione.');
            setIsLoading(false);
        }
    };
    
    return (
        <div className={`flex flex-col items-center justify-center min-h-screen p-6 bg-[#F2F2F7] transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1) ${isEntering ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
            <div className="w-full max-w-[380px]">
                 <div className="text-center mb-10">
                    <div className="flex justify-center mb-6 transition-transform duration-500 hover:scale-105">
                        <Logo className="w-32 h-32 drop-shadow-lg" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{APP_TITLE}</h1>
                    <p className="text-slate-500 mt-2 font-medium">Area riservata</p>
                </div>
                
                <Card className="shadow-xl shadow-slate-200/50 overflow-hidden relative transition-all duration-300 ease-in-out">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-red-100 flex items-center gap-3 animate-shake">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                {error}
                            </div>
                        )}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-slate-700 text-sm font-bold mb-2 ml-1" htmlFor="username">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="form-input rounded-xl"
                                    required
                                    disabled={isLoading}
                                    placeholder="Inserisci il tuo username"
                                    autoComplete="username"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 text-sm font-bold mb-2 ml-1" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input pr-12 rounded-xl"
                                        required
                                        disabled={isLoading}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-12 text-slate-400 hover:text-slate-600 rounded-r-xl transition-colors focus:outline-none"
                                        aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.232 5.724M4.041 4.041L19.959 19.959" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <Button type="submit" fullWidth disabled={isLoading} size="lg" className="shadow-xl shadow-indigo-300/40">
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>Accesso in corso...</span>
                                    </div>
                                ) : 'Accedi'}
                            </Button>
                        </div>
                    </form>
                </Card>
                
                <div className="text-center mt-10">
                    <button 
                        onClick={onNavigateToHome} 
                        className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 mx-auto py-2 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
                        Torna alla Home
                    </button>
                </div>
            </div>
            <style>
                {`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                        20%, 40%, 60%, 80% { transform: translateX(4px); }
                    }
                    .animate-shake {
                        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                    }
                `}
            </style>
        </div>
    );
};

export default LoginPage;
