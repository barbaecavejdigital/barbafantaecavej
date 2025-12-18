
import React from 'react';
import { User } from '../../types';
import { APP_TITLE } from '../../constants';
import AnimatedCounter from './AnimatedCounter';
import Logo from './Logo';

interface HeaderProps {
    user: User;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
    return (
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-black/5 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center space-x-3">
                         <Logo className="w-14 h-14" />
                        <h1 className="text-xl font-bold text-gray-800 hidden sm:block">{APP_TITLE}</h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="text-right">
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">{user.firstName} {user.lastName}</p>
                            <div className="text-xs sm:text-sm text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full inline-block mt-1 border border-indigo-200">
                                <AnimatedCounter endValue={user.points} /> Punti
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 bg-gray-200/50 hover:bg-gray-200 hover:text-indigo-500 transition-colors"
                            title="Logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
