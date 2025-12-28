import React, { useState, useEffect, useRef } from 'react';
import { getRecentTransactions, getDashboardStats, clearAllTransactions } from '../../services/dataService';
import { PointTransaction } from '../../types';
import Card from '../shared/Card';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

interface AdminOverviewProps {
    refreshKey: number;
    show?: 'stats-desktop' | 'stats-mobile' | 'recent';
    isStickyFooter?: boolean;
    onDataChange?: () => void;
}

const StatCardDesktopRect: React.FC<{ icon: React.ReactNode, label: string, value: number | string, isLoading: boolean }> = ({ icon, label, value, isLoading }) => (
    <Card className="hover:shadow-md transition-shadow duration-300 p-3">
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-indigo-600">
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" }) : icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                {isLoading ? (
                    <div className="h-6 w-16 bg-slate-100 rounded-lg animate-pulse mt-1"></div>
                ) : (
                    <p className="text-xl font-extrabold mt-0.5 leading-tight text-indigo-600">{value}</p>
                )}
            </div>
        </div>
    </Card>
);

const StatCardMobile: React.FC<{ icon: React.ReactNode, value: number | string, label: string, isLoading: boolean }> = ({ icon, value, label, isLoading }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 flex flex-col items-center justify-center h-auto min-h-[50px] active:scale-[0.98] transition-transform">
         <div className="flex items-center gap-1.5 mb-0.5">
            <div className="text-indigo-500 shrink-0">
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4" }) : icon}
            </div>
            {isLoading ? (
                <div className="h-3 w-6 bg-slate-100 rounded animate-pulse"></div>
            ) : (
                <p className="text-sm font-extrabold text-slate-800 leading-none">{value}</p>
            )}
        </div>
        <p className="text-[8px] font-bold uppercase tracking-tight truncate w-full text-center text-slate-400 leading-none mt-0.5">{label}</p>
    </div>
);

const parseTransactionDescription = (tx: PointTransaction) => {
    let name = tx.description;
    let description = '-';
    if (tx.type === 'reversal') {
        name = tx.description;
        description = 'Azione correttiva';
    } else if (tx.type === 'redemption' || tx.type === 'assignment') {
        const match = tx.description.match(/^(.*?)\s\((.*)\)$/);
        if (match && match.length === 3) {
            name = match[1];
            description = match[2];
        } else { name = tx.description; }
    } else if (tx.type === 'creation') {
        name = 'Account Creato';
        description = 'Benvenuto/a nel programma!';
    }
    return { name, description };
};


const AdminOverview: React.FC<AdminOverviewProps> = ({ refreshKey, show = 'stats-desktop', isStickyFooter = false, onDataChange }) => {
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalRedeemed, setTotalRedeemed] = useState(0);
    const [totalActionsCompleted, setTotalActionsCompleted] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState<(PointTransaction & { userName: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    // Touch logic
    const touchStartY = useRef<number | null>(null);
    const touchCurrentY = useRef<number | null>(null);

    const fetchData = async () => {
        try {
            const stats = await getDashboardStats();
            setTotalCustomers(stats.totalCustomers);
            setTotalRedeemed(stats.totalRedeemed);
            setTotalActionsCompleted(stats.totalActions);

            const recent = await getRecentTransactions(15);
            setRecentTransactions(recent);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshKey]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchCurrentY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
        if (touchStartY.current !== null && touchCurrentY.current !== null) {
            const deltaY = touchStartY.current - touchCurrentY.current;
            const threshold = 50; 

            if (deltaY > threshold && !isPanelOpen) {
                setIsPanelOpen(true);
            } else if (deltaY < -threshold && isPanelOpen) {
                setIsPanelOpen(false);
            }
        }
        touchStartY.current = null;
        touchCurrentY.current = null;
    };

    const handleClearAll = async () => {
        setIsClearing(true);
        try {
            await clearAllTransactions();
            setIsClearConfirmOpen(false);
            await fetchData();
            if (onDataChange) onDataChange();
        } catch (error) {
            console.error("Failed to clear transactions:", error);
        } finally {
            setIsClearing(false);
        }
    };

    const usersIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );

    const giftIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
    );

    const actionIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9 2 2 4-4" />
        </svg>
    );

    const trashIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
    );

    const confirmationModal = isClearConfirmOpen && (
        <Modal title="Svuota Attività" onClose={() => setIsClearConfirmOpen(false)} size="md">
            <div className="space-y-4">
                <p className="text-slate-600 leading-relaxed">
                    Sei sicuro di voler svuotare tutta la cronologia delle attività? 
                    Questa azione <span className="font-bold text-red-600 uppercase tracking-tight">resetterà anche le statistiche globali</span> dei riscatti e delle azioni.
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="secondary" onClick={() => setIsClearConfirmOpen(false)} disabled={isClearing}>Annulla</Button>
                    <Button variant="danger" onClick={handleClearAll} disabled={isClearing}>
                        {isClearing ? 'Svuotamento...' : 'Svuota Tutto'}
                    </Button>
                </div>
            </div>
        </Modal>
    );

    if (show === 'stats-mobile') {
        return (
            <div className="grid grid-cols-3 gap-3 px-1">
                <StatCardMobile icon={usersIcon} label="Clienti" value={totalCustomers} isLoading={isLoading} />
                <StatCardMobile icon={giftIcon} label="Riscatti" value={totalRedeemed} isLoading={isLoading} />
                <StatCardMobile icon={actionIcon} label="Azioni" value={totalActionsCompleted} isLoading={isLoading} />
            </div>
        );
    }
    
    if (show === 'stats-desktop') {
        return (
            <div className="flex flex-col gap-4 h-full">
                <div className="grid grid-cols-1 gap-2">
                    <StatCardDesktopRect icon={usersIcon} label="Totale Clienti" value={totalCustomers} isLoading={isLoading} />
                    <StatCardDesktopRect icon={giftIcon} label="Premi Riscattati" value={totalRedeemed} isLoading={isLoading} />
                    <StatCardDesktopRect icon={actionIcon} label="Azioni Totali" value={totalActionsCompleted} isLoading={isLoading} />
                </div>
                
                <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-700">Attività Recente</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsClearConfirmOpen(true)} 
                                className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                                title="Svuota Attività"
                                disabled={recentTransactions.length === 0 || isLoading}
                            >
                                {trashIcon}
                            </button>
                            <button 
                                onClick={() => setIsExpanded(true)} 
                                className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50"
                                title="Espandi elenco"
                                disabled={recentTransactions.length === 0 || isLoading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15M3.75 20.25h4.5m-4.5 0v-4.5m0 4.5L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-0 custom-scrollbar scroll-mask-bottom">
                        {isLoading ? (
                             <div className="p-8 text-center"><div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div></div>
                        ) : recentTransactions.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-xs">Nessuna attività recente</div>
                        ) : (
                            <ul className="divide-y divide-slate-50 pb-4">
                                {recentTransactions.slice(0, 10).map(tx => {
                                    const { name } = parseTransactionDescription(tx);
                                    return (
                                        <li key={tx.id} className="p-3 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className="font-bold text-xs text-slate-800 truncate max-w-[100px]" title={tx.userName}>{tx.userName}</p>
                                                {tx.performedBy && (
                                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">Admin: {tx.performedBy}</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-600 truncate mb-1" title={name}>{name}</p>
                                            <div className="flex justify-end items-center gap-2 mt-1">
                                                <span className="text-[9px] text-slate-400">
                                                    {new Date(tx.date).toLocaleDateString('it-IT', {day:'2-digit', month:'2-digit', year: 'numeric'})}
                                                </span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tx.pointsChange > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {tx.pointsChange > 0 ? '+' : ''}{tx.pointsChange}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {isExpanded && (
                    <Modal title="Feed Attività Completo" onClose={() => setIsExpanded(false)} size="2xl">
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-sm text-left table-auto">
                                <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0">
                                    <tr>
                                        <th className="p-3 whitespace-nowrap">Data e Ora</th>
                                        <th className="p-3 whitespace-nowrap">Utente</th>
                                        <th className="p-3">Descrizione</th>
                                        <th className="p-3 text-right whitespace-nowrap">Admin</th>
                                        <th className="p-3 text-right whitespace-nowrap">Punti</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {recentTransactions.map(tx => {
                                        const { name, description } = parseTransactionDescription(tx);
                                        return (
                                            <tr key={tx.id} className="hover:bg-slate-50">
                                                <td className="p-3 text-slate-500 whitespace-nowrap text-xs">
                                                    {new Date(tx.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} <span className="text-slate-400 ml-1">{new Date(tx.date).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</span>
                                                </td>
                                                <td className="p-3 font-semibold text-slate-700 break-words max-w-[150px]">{tx.userName}</td>
                                                <td className="p-3 text-slate-600 break-words max-w-[250px]">
                                                    <p className="font-medium">{name}</p>
                                                    {description !== '-' && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {tx.performedBy ? (
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{tx.performedBy}</span>
                                                    ) : <span className="text-slate-300">-</span>}
                                                </td>
                                                <td className="p-3 text-right">
                                                     <span className={`text-sm font-bold ${tx.pointsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {tx.pointsChange > 0 ? '+' : ''}{tx.pointsChange}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setIsExpanded(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">Chiudi</button>
                        </div>
                    </Modal>
                )}
                {confirmationModal}
            </div>
        );
    }

    if (show === 'recent') {
        const headerHeight = 60; 

        return (
            <>
                <div 
                    className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-500 lg:hidden ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsPanelOpen(false)}
                />

                <div 
                    className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] border-t border-slate-100 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) lg:hidden flex flex-col"
                    style={{ 
                        height: '75vh',
                        transform: isPanelOpen ? 'translateY(0)' : `translateY(calc(100% - ${headerHeight}px))`
                    }}
                >
                    <div 
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="bg-white rounded-t-[2.5rem] pt-2 pb-3 px-6 flex-shrink-0 relative touch-none select-none active:bg-slate-50 transition-colors flex flex-col items-center"
                    >
                        <div onClick={() => setIsPanelOpen(!isPanelOpen)} className="w-10 h-1 bg-slate-200 rounded-full mb-2 cursor-pointer" />
                        
                        <div className="w-full flex items-center justify-between">
                            <div className="w-10"></div> {/* Spacer */}
                            <div className="flex flex-col items-center justify-center text-center flex-1 cursor-pointer" onClick={() => setIsPanelOpen(!isPanelOpen)}>
                                <h3 className="font-bold text-slate-900 text-sm">Feed Attività</h3>
                                <span className={`text-[10px] font-bold text-indigo-500/70 uppercase tracking-tight transition-opacity duration-300 ${isPanelOpen ? 'opacity-100' : 'animate-pulse'}`}>
                                    {isPanelOpen ? 'Scorri verso il basso' : 'Scorri verso l\'alto'}
                                </span>
                            </div>
                            <div className="w-10 flex justify-end">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsClearConfirmOpen(true); }}
                                    className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Svuota Attività"
                                    disabled={recentTransactions.length === 0 || isLoading}
                                >
                                    {trashIcon}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0 bg-slate-50/30 pb-safe custom-scrollbar">
                         {isLoading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto shadow-sm"></div>
                                <p className="mt-4 text-slate-400 text-sm font-medium">Caricamento...</p>
                            </div>
                        ) : recentTransactions.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3">
                                <div className="p-4 bg-white rounded-full border border-slate-100 shadow-sm text-slate-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0a9 9 0 0 1 18 0z" /></svg>
                                </div>
                                <p className="font-semibold text-slate-500">Nessuna attività recente</p>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-slate-200 ml-8 my-6 space-y-8 pr-6 pb-12">
                                {recentTransactions.map((tx) => {
                                        const { name, description } = parseTransactionDescription(tx);
                                        return (
                                        <div key={tx.id} className="relative pl-8">
                                            <div className={`absolute -left-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-white shadow-md ring-1 ring-black/5 ${tx.pointsChange > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-extrabold text-slate-900 text-sm">{tx.userName}</p>
                                                            {tx.performedBy && (
                                                                <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">Admin: {tx.performedBy}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                                {new Date(tx.date).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                                {new Date(tx.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-sm font-black px-2.5 py-1 rounded-xl shadow-sm border ${tx.pointsChange > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                        {tx.pointsChange > 0 ? '+' : ''}{tx.pointsChange}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-slate-700 text-sm leading-snug break-words">{name}</p>
                                                {description !== '-' && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100/50">{description}</p>}
                                            </div>
                                        </div>
                                        );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                {confirmationModal}
            </>
        );
    }

    return null;
};

export default AdminOverview;