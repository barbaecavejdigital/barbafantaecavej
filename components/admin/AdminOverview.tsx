import React, { useState, useEffect } from 'react';
import { getRecentTransactions, getDashboardStats } from '../../services/dataService';
import { PointTransaction } from '../../types';
import Card from '../shared/Card';
import Modal from '../shared/Modal';

interface AdminOverviewProps {
    refreshKey: number;
    show?: 'stats-desktop' | 'stats-mobile' | 'recent';
    isStickyFooter?: boolean;
}

const StatCardDesktopRect: React.FC<{ icon: React.ReactNode, label: string, value: number | string, isLoading: boolean, variant?: 'default' | 'purple' | 'orange' }> = ({ icon, label, value, isLoading, variant = 'default' }) => (
    <Card className="hover:shadow-md transition-shadow duration-300 p-3">
        <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
                variant === 'purple' ? 'bg-purple-50 text-purple-600' :
                variant === 'orange' ? 'bg-orange-50 text-orange-600' :
                'bg-indigo-50 text-indigo-600'
            }`}>
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" }) : icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                {isLoading ? (
                    <div className="h-6 w-16 bg-slate-100 rounded-lg animate-pulse mt-1"></div>
                ) : (
                    <p className={`text-xl font-extrabold mt-0.5 leading-tight ${
                        variant === 'purple' ? 'text-purple-700' :
                        variant === 'orange' ? 'text-orange-600' :
                        'text-slate-800'
                    }`}>{value}</p>
                )}
            </div>
        </div>
    </Card>
);


// Compact Mobile Stat Card - Redesigned to be cleaner (White BG)
const StatCardMobile: React.FC<{ icon: React.ReactNode, value: number | string, label: string, isLoading: boolean, variant?: 'default' | 'purple' | 'orange' }> = ({ icon, value, label, isLoading, variant = 'default' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex flex-col items-center justify-center text-center h-auto min-h-[60px] active:scale-[0.98] transition-transform">
         <div className={`p-1.5 rounded-lg mb-1 ${
             variant === 'purple' ? 'bg-purple-50 text-purple-500' :
             variant === 'orange' ? 'bg-orange-50 text-orange-500' :
             'bg-indigo-50 text-indigo-500'
         }`}>
             {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-3.5 h-3.5" }) : icon}
        </div>
        
        {isLoading ? (
            <div className="h-3 w-8 bg-slate-100 rounded animate-pulse my-0.5"></div>
        ) : (
             <p className="text-sm font-extrabold leading-none text-slate-800">{value}</p>
        )}
        <p className="text-[9px] font-bold uppercase tracking-wide truncate w-full mt-0.5 text-slate-400">{label}</p>
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


const AdminOverview: React.FC<AdminOverviewProps> = ({ refreshKey, show = 'stats-desktop', isStickyFooter = false }) => {
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [totalRedeemed, setTotalRedeemed] = useState(0);
    const [totalActionsCompleted, setTotalActionsCompleted] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState<(PointTransaction & { userName: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // State specifically for the sliding panel
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    // State for desktop modal expansion
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                const stats = await getDashboardStats();
                setTotalCustomers(stats.totalCustomers);
                setTotalRedeemed(stats.totalRedeemed);
                setTotalActionsCompleted(stats.totalActions);

                // Fetch Recent Transactions
                const recent = await getRecentTransactions(15);
                setRecentTransactions(recent);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [refreshKey]);

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

    // Mobile View: Horizontal compact stats
    if (show === 'stats-mobile') {
        return (
            <div className="grid grid-cols-3 gap-3 px-1">
                <StatCardMobile icon={usersIcon} label="Clienti" value={totalCustomers} isLoading={isLoading} />
                <StatCardMobile icon={giftIcon} label="Riscatti" value={totalRedeemed} isLoading={isLoading} variant="orange" />
                <StatCardMobile icon={actionIcon} label="Azioni" value={totalActionsCompleted} isLoading={isLoading} />
            </div>
        );
    }
    
    // Desktop View: Sidebar stats
    if (show === 'stats-desktop') {
        return (
            <div className="flex flex-col gap-4 h-full">
                <div className="grid grid-cols-1 gap-2">
                    <StatCardDesktopRect icon={usersIcon} label="Totale Clienti" value={totalCustomers} isLoading={isLoading} />
                    <StatCardDesktopRect icon={giftIcon} label="Premi Riscattati" value={totalRedeemed} isLoading={isLoading} variant="orange" />
                    <StatCardDesktopRect icon={actionIcon} label="Azioni Totali" value={totalActionsCompleted} isLoading={isLoading} />
                </div>
                
                <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-700">Attività Recente</h3>
                            {/* Removed Live Badge */}
                        </div>
                        <button 
                            onClick={() => setIsExpanded(true)} 
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50"
                            title="Espandi elenco"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15M3.75 20.25h4.5m-4.5 0v-4.5m0 4.5L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9" />
                            </svg>
                        </button>
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
            </div>
        );
    }

    // Recent / Sliding Panel (Mobile & Tablet)
    if (show === 'recent') {
        const headerHeight = 70; // Approximate height of the visible handle bar

        return (
            <>
                {/* Backdrop - only visible when open */}
                <div 
                    className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-500 lg:hidden ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsPanelOpen(false)}
                />

                {/* Sliding Panel */}
                <div 
                    className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-slate-100 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) lg:hidden flex flex-col"
                    style={{ 
                        height: '75vh',
                        transform: isPanelOpen ? 'translateY(0)' : `translateY(calc(100% - ${headerHeight}px))`
                    }}
                >
                    {/* Handle / Header Area */}
                    <div 
                        onClick={() => setIsPanelOpen(!isPanelOpen)} 
                        className="cursor-pointer bg-white/50 rounded-t-[2rem] pt-3 pb-4 px-6 flex-shrink-0 relative touch-pan-y"
                    >
                        {/* Drag Handle Indicator */}
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
                        
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">Feed Attività</h3>
                                    <p className="text-xs text-slate-500">{isPanelOpen ? 'Tocca per ridurre' : 'Tocca per espandere'}</p>
                                </div>
                            </div>
                            
                            {/* Expand/Collapse Chevron */}
                            <div className={`transition-transform duration-500 text-slate-400 ${isPanelOpen ? 'rotate-180' : 'rotate-0'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable List Content */}
                    <div className="flex-1 overflow-y-auto p-0 bg-slate-50/50 pb-safe scroll-mask-bottom">
                         {isLoading ? (
                            <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div></div>
                        ) : recentTransactions.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <p>Nessuna attività recente</p>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-slate-200 ml-6 my-6 space-y-8 pr-4 pb-6">
                                {recentTransactions.map((tx) => {
                                        const { name, description } = parseTransactionDescription(tx);
                                        return (
                                        <div key={tx.id} className="relative pl-6">
                                            <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ring-2 ring-slate-50 ${tx.pointsChange > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{tx.userName}</p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {new Date(tx.date).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})} - {new Date(tx.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${tx.pointsChange > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {tx.pointsChange > 0 ? '+' : ''}{tx.pointsChange}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-slate-700 text-sm break-words">{name}</p>
                                                {description !== '-' && <p className="text-xs text-slate-500 mt-1 break-words">{description}</p>}
                                            </div>
                                        </div>
                                        );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    return null;
};

export default AdminOverview;