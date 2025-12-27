
import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../../types';
import { APP_TITLE } from '../../constants';
import { getCredentialsUsersPaginated } from '../../services/dataService';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Logo from '../shared/Logo';

interface AdminSidebarProps {
    user: User;
    onLogout: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const handlePrint = (elementId: string) => {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (printWindow) {
        printWindow.document.write(`<html><head><title>Stampa Credenziali</title><style>body{font-family:sans-serif;padding:2rem} h3{margin-bottom:1rem; font-size: 1.5rem;} p{margin:0.5rem 0; font-size: 1.2rem;} .credential-box{border: 1px solid #ccc; padding: 2rem; border-radius: 8px;}</style></head><body><div class="credential-box">${printContent.innerHTML}</div></body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    } else {
        alert("Per favore, abilita i pop-up per poter stampare.");
    }
};

const CredentialsModal: React.FC<{
    onClose: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ onClose, showToast }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchUsers = async (reset: boolean = false) => {
        if (reset) setIsLoading(true);
        else setIsLoadingMore(true);

        try {
            const currentLastDoc = reset ? null : lastDoc;
            const { users: newUsers, lastVisible } = await getCredentialsUsersPaginated(currentLastDoc, 20, searchTerm);
            if (reset) setUsers(newUsers);
            else setUsers(prev => [...prev, ...newUsers]);
            setLastDoc(lastVisible);
            setHasMore(!!lastVisible); 
        } catch (err) {
            console.error(err);
            showToast("Errore caricamento dati.", 'error');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => { fetchUsers(true); }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(true);
    };

    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore) fetchUsers(false);
    };

    const handleCopyCredentials = async (user: User) => {
        if(!user.password) {
            showToast("Password non disponibile per la copia.", 'error');
            return;
        }
        const textToCopy = `Username: ${user.username}\nPassword: ${user.password}`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            showToast('Credenziali copiate!', 'success');
        } catch (err) {
            console.error("Failed to copy credentials: ", err);
            showToast("Errore durante la copia.", 'error');
        }
    };

    const copyIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>
    );
    
    const printIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
    );

    return (
        <Modal title="Cassaforte Credenziali" onClose={onClose} size="3xl">
            <div className="space-y-6 w-full relative">
                <div className="sticky top-0 bg-white z-10 pb-4 -mt-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="search"
                                placeholder="Cerca per Username..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="form-input pl-10"
                            />
                        </div>
                        <Button type="submit">Cerca</Button>
                    </form>
                </div>
                
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-2">
                   {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="text-slate-500">Caricamento...</p>
                        </div>
                   ) : (
                    <>
                        <div className="md:hidden space-y-3">
                            {users.map(user => (
                                <div key={user.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 pr-2">
                                            <p className="font-bold text-slate-800 break-words">{user.firstName || 'Senza nome'} {user.lastName || ''}</p>
                                            <p className="text-xs text-slate-500 mt-1">Reg: {new Date(user.creationDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => handleCopyCredentials(user)} className="p-2 rounded-full text-slate-500 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Copia">{copyIcon}</button>
                                            <button onClick={() => handlePrint(`printable-creds-${user.id}`)} className="p-2 rounded-full text-slate-500 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Stampa">{printIcon}</button>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-sm">
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-400 font-medium uppercase">Username</p>
                                            <p className="font-mono text-indigo-600 font-medium break-all">{user.username}</p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-400 font-medium uppercase">Password</p>
                                            <p className="font-mono text-slate-700 break-all">{user.password}</p>
                                        </div>
                                    </div>
                                    <div id={`printable-creds-${user.id}`} className="hidden">
                                        <h3>Credenziali per {user.firstName || ''} {user.lastName || ''} ({user.username})</h3>
                                        <p><strong>Username:</strong> {user.username}</p>
                                        <p><strong>Password:</strong> {user.password}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hidden md:block overflow-x-auto rounded-lg">
                            <table className="w-full text-sm text-center border-collapse">
                                <thead className="bg-slate-100 text-slate-500 font-semibold sticky top-0">
                                    <tr>
                                        <th className="p-3 pl-4 rounded-tl-lg whitespace-nowrap text-center">Username</th>
                                        <th className="p-3 whitespace-nowrap text-center">Nome Cliente</th>
                                        <th className="p-3 whitespace-nowrap text-center">Password</th>
                                        <th className="p-3 whitespace-nowrap text-center">Data Creazione</th>
                                        <th className="p-3 pr-4 text-center rounded-tr-lg whitespace-nowrap">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-3 pl-4 font-mono text-indigo-600 font-medium break-all max-w-[150px] text-center">{user.username}</td>
                                            <td className="p-3 text-slate-700 break-words max-w-[200px] text-center">{user.firstName} {user.lastName}</td>
                                            <td className="p-3 font-mono text-slate-500 bg-slate-50 rounded px-2 w-fit break-all max-w-[200px] text-center mx-auto">{user.password}</td>
                                            <td className="p-3 text-slate-500 whitespace-nowrap text-center">
                                                {new Date(user.creationDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-3 pr-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleCopyCredentials(user)} className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all" title="Copia credenziali">{copyIcon}</button>
                                                    <button onClick={() => handlePrint(`printable-creds-${user.id}`)} className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all" title="Stampa credenziali">{printIcon}</button>
                                                </div>
                                                <div id={`printable-creds-${user.id}`} className="hidden">
                                                    <h3>Credenziali per {user.firstName || ''} {user.lastName || ''} ({user.username})</h3>
                                                    <p><strong>Username:</strong> {user.username}</p>
                                                    <p><strong>Password:</strong> {user.password}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {hasMore && (
                            <div className="p-4 text-center border-t border-slate-100 bg-white rounded-b-2xl">
                                <Button onClick={handleLoadMore} disabled={isLoadingMore} variant="secondary" size="sm">
                                    {isLoadingMore ? 'Caricamento...' : 'Carica altri'}
                                </Button>
                            </div>
                        )}
                    </>
                   )}
                </div>
            </div>
        </Modal>
    );
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, onLogout, showToast }) => {
    const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
    const safeIcon = (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    );

    return (
        <>
            <header className="bg-slate-900 text-white shadow-md z-40 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-white/20">
                                <Logo className="w-10 h-10" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight hidden sm:block">{APP_TITLE}</h1>
                                <h1 className="text-lg font-bold tracking-tight sm:hidden leading-none uppercase">Admin</h1>
                                <p className="text-[10px] font-bold text-slate-400 sm:hidden uppercase tracking-wider mt-0.5">{user.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 sm:space-x-6">
                            <button onClick={() => setIsCredentialsModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700">
                                {safeIcon} <span className="hidden md:inline">Cassaforte</span>
                            </button>
                            <div className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-slate-700/50">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white leading-none hidden sm:block">{user.firstName} {user.lastName}</p>
                                    <p className="text-slate-400 text-[10px] sm:text-xs mt-1 uppercase tracking-wider font-bold hidden sm:block">{user.username}</p>
                                </div>
                                <button onClick={onLogout} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" title="Logout">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {isCredentialsModalOpen && <CredentialsModal onClose={() => setIsCredentialsModalOpen(false)} showToast={showToast} />}
        </>
    );
};

export default AdminSidebar;
