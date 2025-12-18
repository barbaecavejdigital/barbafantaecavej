
import React, { useState, useEffect, useMemo } from 'react';
import { User, Prize, PointTransaction, HeatingAction, Action } from '../../types';
import { getPrizes, getRegulations, getTransactionsForUser, getHeatingActions, getActions } from '../../services/dataService';
import Card from '../shared/Card';
import AnimatedCounter from '../shared/AnimatedCounter';
import Modal from '../shared/Modal';

// --- SUB-COMPONENTS ---

const ExpandButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        title="Espandi a tutto schermo"
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15M3.75 20.25h4.5m-4.5 0v-4.5m0 4.5L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9" />
        </svg>
    </button>
);

const InfoPanel: React.FC<{ regulations: string, actions: Action[], onExpand?: () => void, isExpanded?: boolean }> = ({ regulations, actions, onExpand, isExpanded }) => {
    const [tab, setTab] = useState<'regulations' | 'actions'>('regulations');

    return (
        <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-md ${isExpanded ? 'border-none shadow-none rounded-none' : ''}`}>
            <div className={`px-6 pt-6 pb-4 shrink-0 flex items-center justify-between bg-white z-10 ${isExpanded ? 'hidden' : ''}`}>
                <h3 className="font-bold text-slate-800 text-lg tracking-tight">Info & Regole</h3>
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setTab('regulations')} 
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${tab === 'regulations' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Regole
                        </button>
                        <button 
                            onClick={() => setTab('actions')} 
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${tab === 'actions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Azioni
                        </button>
                    </div>
                    {onExpand && <ExpandButton onClick={onExpand} />}
                </div>
            </div>

            {/* Expanded Header Logic handled by Modal, but internal tab switcher needed if expanded */}
            {isExpanded && (
                 <div className="px-0 pb-6 shrink-0 flex items-center justify-center bg-white z-10">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setTab('regulations')} 
                            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${tab === 'regulations' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Regole
                        </button>
                        <button 
                            onClick={() => setTab('actions')} 
                            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${tab === 'actions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Azioni
                        </button>
                    </div>
                </div>
            )}
            
            <div className={`flex-1 overflow-y-auto custom-scrollbar scroll-mask-bottom ${isExpanded ? 'px-0' : 'px-6 pb-6'}`}>
                {tab === 'regulations' ? (
                     <div className="prose prose-slate prose-sm max-w-none pb-4">
                        <p className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed font-medium">{regulations || "Nessun regolamento disponibile."}</p>
                     </div>
                ) : (
                    <div className={`${isExpanded ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-2"} pb-4`}>
                        {actions.map(a => (
                            <div key={a.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-300">
                                <div>
                                    <p className="font-bold text-slate-800 text-xs sm:text-sm">{a.name}</p>
                                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium">{a.description}</p>
                                </div>
                                <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap shadow-sm">
                                    +{a.points} pt
                                </span>
                            </div>
                        ))}
                        {actions.length === 0 && <p className="text-center text-slate-400 text-xs py-4">Nessuna azione definita.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

const NextRewardCard: React.FC<{ user: User, prizes: Prize[], compact?: boolean }> = ({ user, prizes, compact = false }) => {
    const nextReward = prizes.find(p => p.pointsRequired > user.points);
    const containerPadding = compact ? 'p-5' : 'p-6';
    const titleSize = compact ? 'text-lg' : 'text-xl';
    
    if (!nextReward) {
        return (
            <div className={`bg-white border border-slate-100 shadow-sm ${containerPadding} rounded-[2rem] relative overflow-hidden group hover:shadow-md transition-all duration-300 shrink-0 w-full`}>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Livello Massimo!</h3>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Hai sbloccato tutti i premi.</p>
                    </div>
                    <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-emerald-500">
                            <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h14.25c.414 0 .75-.336.75-.75a2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.348Zm13.668 0c.66.11 1.325.226 1.99.348-.088 1.252-.39 2.454-.871 3.565a5.267 5.267 0 0 1-1.119-3.913ZM12 5.625c-1.63.15-3.216.437-4.75.846a5.274 5.274 0 0 0 2.41 4.192c.767.458 1.64.712 2.535.712.83 0 1.636-.217 2.355-.606a5.272 5.272 0 0 0 2.2-4.148 37.83 37.83 0 0 0-4.75-.846Z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    const pointsNeeded = nextReward.pointsRequired - user.points;
    const progress = Math.min((user.points / nextReward.pointsRequired) * 100, 100);

    return (
        <div className={`rounded-[2rem] ${containerPadding} bg-white border border-slate-100 shadow-sm relative overflow-hidden transform transition-all hover:shadow-md group shrink-0 w-full`}>
            <div className="relative z-10">
                <div className={`flex justify-between items-start ${compact ? 'mb-3' : 'mb-4'}`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-indigo-500">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                            </svg>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Premio più Vicino</p>
                        </div>
                        <h3 className={`${titleSize} font-extrabold leading-tight tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors`}>{nextReward.name}</h3>
                    </div>
                    {!compact && (
                        <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-500">
                                <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {!compact && (
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                            <span>Progresso</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                    )}
                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div 
                            className="h-full bg-indigo-500 rounded-full shadow-sm transition-all duration-1000 ease-out relative overflow-hidden" 
                            style={{ width: `${progress}%` }}
                        >
                             <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-end mt-1">
                        <p className="text-xs text-slate-500 font-medium">
                           Mancano <span className="font-bold text-indigo-600 text-sm">{pointsNeeded}</span> punti
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 font-bold">
                            {user.points} / {nextReward.pointsRequired}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HistoryView: React.FC<{ user: User, onExpand?: () => void, isExpanded?: boolean }> = ({ user, onExpand, isExpanded }) => {
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'awarded' | 'redeemed'>('all');

    useEffect(() => {
        const fetchHistory = async () => {
            const userTransactions = await getTransactionsForUser(user.id);
            setTransactions(userTransactions);
            setIsLoading(false);
        };
        fetchHistory();
    }, [user.id]);
    
    const allTransactions = useMemo(() => 
        transactions.filter(tx => tx.type !== 'creation'),
    [transactions]);

    const awardedTransactions = useMemo(() => 
        transactions.filter(tx => tx.pointsChange >= 0 && tx.type !== 'creation'), 
    [transactions]);

    const redeemedTransactions = useMemo(() => 
        transactions.filter(tx => tx.pointsChange < 0), 
    [transactions]);

    const renderTransactionList = (txs: PointTransaction[]) => {
        if (isLoading) {
            return <div className="text-center p-8 text-slate-400 text-sm font-medium">Caricamento...</div>;
        }
        if (txs.length === 0) {
            return (
                <div className="text-center text-slate-400 py-12 flex flex-col items-center justify-center h-full">
                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                    </div>
                    <p className="font-medium text-xs">Nessun movimento</p>
                </div>
            );
        }

        return (
            <div className={`${isExpanded ? "space-y-3" : "space-y-2"} pb-6`}>
                {txs.map(tx => (
                    <div key={tx.id} className="p-3 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group bg-slate-50/20">
                        <div className="min-w-0 pr-3">
                            <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{tx.description}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {new Date(tx.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        {/* UPDATE: Green for positive, Red for negative */}
                        <div className={`font-bold text-xs sm:text-sm shrink-0 px-2.5 py-1 rounded-xl ${tx.pointsChange > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {tx.pointsChange > 0 ? '+' : ''}{tx.pointsChange}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={`h-full flex flex-col bg-white overflow-hidden ${isExpanded ? '' : 'p-6 rounded-[2.5rem] border border-slate-100 shadow-sm'}`}>
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">I tuoi Movimenti</h3>
                {onExpand && !isExpanded && <ExpandButton onClick={onExpand} />}
            </div>
            
            <div className="flex p-1 bg-slate-100 rounded-xl shrink-0 mb-4 border border-slate-200/50">
                {(['all', 'awarded', 'redeemed'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all duration-300 ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab === 'all' ? 'Tutti' : tab === 'awarded' ? 'Entrate' : 'Uscite'}
                    </button>
                ))}
            </div>
            {/* List handles its own scrolling internally */}
            <div className="flex-1 overflow-y-auto custom-scrollbar scroll-mask-bottom pr-2 -mr-2">
                {activeTab === 'all' && renderTransactionList(allTransactions)}
                {activeTab === 'awarded' && renderTransactionList(awardedTransactions)}
                {activeTab === 'redeemed' && renderTransactionList(redeemedTransactions)}
            </div>
        </div>
    );
};

const BonusGrid: React.FC<{ user: User, heatingActions: HeatingAction[], compact?: boolean, onExpand?: () => void }> = ({ user, heatingActions, compact = false, onExpand }) => {
    const completedIds = user.completedHeatingActions || [];
    const isFullyCompleted = heatingActions.length > 0 && heatingActions.every(a => completedIds.includes(a.id));
    const total = heatingActions.length;
    const completed = completedIds.length;
    const percent = total > 0 ? (completed / total) * 100 : 0;
    
    // COMPACT VIEW (For Desktop Left Column)
    if (compact) {
        return (
            <div 
                onClick={onExpand}
                className={`bg-white border ${isFullyCompleted ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-100'} shadow-sm p-5 rounded-[2rem] transition-all duration-300 hover:shadow-md cursor-pointer shrink-0 relative overflow-hidden group w-full`}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl border shadow-sm transition-colors ${isFullyCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Bonus Benvenuto</h3>
                            <p className="text-[10px] text-slate-500 font-medium group-hover:text-indigo-600 transition-colors">Tocca per i dettagli</p>
                        </div>
                    </div>
                    {onExpand && (
                         <div className="text-slate-300 group-hover:text-indigo-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15M3.75 20.25h4.5m-4.5 0v-4.5m0 4.5L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9" /></svg>
                        </div>
                    )}
                </div>
                
                 <div className="space-y-2">
                     <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Progresso</span>
                        <span>{completed} / {total}</span>
                    </div>
                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div 
                            className={`h-full rounded-full shadow-sm transition-all duration-1000 ease-out relative overflow-hidden ${isFullyCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${percent}%` }}
                        >
                            {!isFullyCompleted && <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    // FULL VIEW (Modal or dedicated tab)
    return (
        <div className={`bg-white h-full overflow-hidden flex flex-col ${onExpand ? 'p-0' : 'p-6 border border-slate-100 rounded-[2rem] shadow-sm'}`}>
            {!onExpand && (
                 <div className="flex items-center gap-3 mb-6 shrink-0">
                    <div className={`p-2 rounded-xl border shadow-sm ${isFullyCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Bonus Benvenuto</h3>
                        <p className={`text-sm font-bold uppercase tracking-wide mt-0.5 ${isFullyCompleted ? 'text-emerald-600' : 'text-indigo-600 opacity-90'}`}>
                            {isFullyCompleted ? 'Tutte le azioni completate!' : `${completed} su ${total} Completati`}
                        </p>
                    </div>
                </div>
            )}
            
            <div className="flex-1 overflow-y-auto custom-scrollbar scroll-mask-bottom">
                {/* 5-Column Grid Layout for Mobile (2 rows of 5 for 10 items) */}
                <div className="grid grid-cols-5 gap-2 shrink-0 p-1">
                    {heatingActions.map((action) => {
                        const isDone = completedIds.includes(action.id);
                        return (
                            <div key={action.id} className="flex flex-col items-center gap-1.5 group p-2 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-300">
                                {/* Condensed size for 5-col layout */}
                                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 shadow-sm ${isDone ? 'bg-indigo-500 border-indigo-500 text-white shadow-indigo-200' : 'bg-white border-slate-200 text-slate-300 group-hover:border-indigo-200 group-hover:text-indigo-400'}`}>
                                    {isDone ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <span className="font-bold text-xs sm:text-lg">{action.slot}</span>
                                    )}
                                </div>
                                <div className="flex flex-col items-center justify-center w-full min-w-0 mt-1">
                                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${isDone ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>+{action.points}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100 pb-8">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                        Dettagli Azioni
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {heatingActions.map(action => (
                            <div key={action.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 text-xs font-bold rounded-lg mt-0.5">{action.slot}</span>
                                <div className="min-w-0 w-full">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-slate-700">{action.name}</p>
                                        <span className="ml-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 whitespace-nowrap">+{action.points} pt</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{action.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PrizesList: React.FC<{ user: User, prizes: Prize[], isMobileView?: boolean, onExpand?: () => void, isExpanded?: boolean }> = ({ user, prizes, isMobileView = false, onExpand, isExpanded }) => {
    // Styling constants for compact mobile view
    const cardPadding = isMobileView ? 'p-3 rounded-2xl' : 'p-4 rounded-3xl';
    const iconPadding = isMobileView ? 'p-1.5 rounded-lg' : 'p-2 rounded-xl';
    const pointsSize = isMobileView ? 'text-base' : 'text-lg';
    const titleSize = isMobileView ? 'text-xs' : 'text-sm';
    const descSize = isMobileView ? 'text-[10px]' : 'text-[11px]';
    const mbHeader = isMobileView ? 'mb-1' : 'mb-2';
    const mbDesc = isMobileView ? 'mb-2' : 'mb-3';

    // In expanded mode, we want bigger grid columns
    const gridCols = isExpanded 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3' 
        : isMobileView 
            ? 'grid-cols-1' 
            : 'grid-cols-1 xl:grid-cols-2';

    return (
        <div className="h-full flex flex-col">
            {!isMobileView && (
                <div className={`p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-sm z-10 shrink-0 ${isExpanded ? 'px-0 pt-0' : ''}`}>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Catalogo Premi</h3>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">Scegli come premiarti oggi</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 shadow-sm">
                            {prizes.length} Premi
                        </div>
                        {onExpand && !isExpanded && <ExpandButton onClick={onExpand} />}
                    </div>
                </div>
            )}
            <div className={`flex-1 overflow-y-auto custom-scrollbar scroll-mask-bottom ${isMobileView ? 'pr-2' : isExpanded ? 'py-4' : 'p-6 bg-slate-50/50'}`}>
                <div className={`grid gap-3 ${gridCols} pb-6`}>
                    {prizes.map(prize => {
                        const canRedeem = user.points >= prize.pointsRequired;
                        const percent = Math.min((user.points / prize.pointsRequired) * 100, 100);
                        const missingPoints = Math.max(0, prize.pointsRequired - user.points);
                        
                        return (
                            <div key={prize.id} className={`bg-white ${cardPadding} border shadow-sm transition-all duration-300 group hover:shadow-md hover:-translate-y-1 ${canRedeem ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-100 opacity-95'}`}>
                                <div className={`flex justify-between items-start ${mbHeader}`}>
                                    <div className={`${iconPadding} transition-colors shrink-0 ${canRedeem ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-400'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-extrabold ${pointsSize} ${canRedeem ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{prize.pointsRequired}</span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase ml-0.5">pt</span>
                                    </div>
                                </div>
                                <h4 className={`font-bold text-slate-800 ${titleSize} mb-1 group-hover:text-indigo-700 transition-colors leading-tight`}>{prize.name}</h4>
                                <p className={`${descSize} text-slate-500 ${mbDesc} line-clamp-2 leading-relaxed font-medium`}>{prize.description}</p>
                                {canRedeem ? (
                                    <div className="mt-2 pt-2 border-t border-slate-50/50 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 w-full text-center">
                                            Riscattabile in negozio
                                        </span>
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Progresso</span>
                                            <span className="text-[9px] font-medium text-slate-400">Mancano <span className="font-bold text-slate-600">{missingPoints}</span></span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                                            <div className="bg-slate-300 h-full rounded-full transition-all duration-1000 group-hover:bg-indigo-300" style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

interface CustomerDashboardProps {
    user: User;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user }) => {
    // ... [State setup same as before]
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [regulations, setRegulations] = useState('');
    const [heatingActions, setHeatingActions] = useState<HeatingAction[]>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [activeTab, setActiveTab] = useState<'home' | 'prizes' | 'history' | 'bonus' | 'regulations'>('home');
    const [regulationsSubTab, setRegulationsSubTab] = useState<'regulation' | 'actions'>('regulation');
    
    // Expanded State for Desktop
    const [expandedCard, setExpandedCard] = useState<'prizes' | 'history' | 'rules' | 'bonus' | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [prizesData, regulationsData, heatingData, actionsData] = await Promise.all([
                getPrizes(),
                getRegulations(),
                getHeatingActions(),
                getActions()
            ]);
            setPrizes(prizesData);
            setRegulations(regulationsData);
            setHeatingActions(heatingData);
            setActions(actionsData.filter(a => a.isEnabled));
        };
        fetchData();
    }, []);

    const handleExpand = (card: 'prizes' | 'history' | 'rules' | 'bonus') => {
        setExpandedCard(card);
    }
    
    const closeExpand = () => {
        setExpandedCard(null);
    }

    // --- MAIN RENDER ---
    return (
        <div className="h-full flex flex-col md:overflow-hidden relative bg-[#F2F2F7]">
            
            {/* DESKTOP/TABLET LAYOUT (Bento Grid) - FIXED HEIGHT NO SCROLL */}
            <div className="hidden md:grid h-full w-full p-4 lg:p-6 gap-4 lg:gap-6 max-w-[1920px] mx-auto overflow-hidden grid-cols-12 grid-rows-[auto_1fr] lg:grid-rows-1">
                
                {/* COL 1: User Stats (Left) */}
                <div className="col-span-12 lg:col-span-3 flex flex-row lg:flex-col gap-4 h-full min-h-0 overflow-visible lg:overflow-hidden">
                    
                     {/* Balance Card - Compact & Impactful */}
                     <div className="bg-indigo-500 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(99,102,241,0.25)] border border-indigo-400/50 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 shrink-0 flex-1 lg:flex-none lg:h-48">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
                        
                        <p className="text-indigo-100 font-bold text-[10px] uppercase tracking-widest mb-2 relative z-10">Il tuo saldo</p>
                        <h2 className="text-6xl font-extrabold mb-1 tracking-tighter text-white relative z-10 drop-shadow-sm">
                            <AnimatedCounter endValue={user.points} />
                        </h2>
                        <span className="text-indigo-100 text-xs font-medium relative z-10">punti totali</span>
                    </div>

                    {/* Bonus Grid - Compact mode (Desktop Left Column) */}
                    {heatingActions.length > 0 && (
                        <div className="flex-1 lg:flex-none">
                           <BonusGrid user={user} heatingActions={heatingActions} compact={true} onExpand={() => handleExpand('bonus')} />
                        </div>
                    )}

                    {/* Next Reward - Compact */}
                    <div className="flex-1 lg:flex-none lg:flex-1 min-h-0">
                        <NextRewardCard user={user} prizes={prizes} compact={true} />
                    </div>
                </div>

                {/* COL 2: Prizes (Center) - The Main Stage */}
                <div className="col-span-12 lg:col-span-6 flex flex-col h-full min-h-0">
                    <div className="flex-1 bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col relative">
                        <PrizesList user={user} prizes={prizes} isMobileView={false} onExpand={() => handleExpand('prizes')} />
                    </div>
                </div>

                {/* COL 3: History & Info (Right) */}
                <div className="hidden lg:flex col-span-3 flex-col gap-4 h-full min-h-0">
                     {/* History Section - Top Half */}
                    <div className="flex-1 min-h-0">
                        <HistoryView user={user} onExpand={() => handleExpand('history')} />
                    </div>
                    {/* Info Section - Bottom Half */}
                    <div className="flex-1 min-h-0">
                        <InfoPanel regulations={regulations} actions={actions} onExpand={() => handleExpand('rules')} />
                    </div>
                </div>
            </div>

            {/* EXPAND MODALS (Desktop/Tablet) */}
            {expandedCard === 'prizes' && (
                <Modal title="Catalogo Premi Completo" onClose={closeExpand} size="3xl">
                     <div className="h-[70vh]">
                         <PrizesList user={user} prizes={prizes} isMobileView={false} isExpanded={true} />
                     </div>
                </Modal>
            )}

            {expandedCard === 'history' && (
                <Modal title="Storico Completo" onClose={closeExpand} size="2xl">
                    <div className="h-[70vh]">
                        <HistoryView user={user} isExpanded={true} />
                    </div>
                </Modal>
            )}

             {expandedCard === 'rules' && (
                <Modal title="Info & Regole" onClose={closeExpand} size="2xl">
                    <div className="h-[70vh]">
                        <InfoPanel regulations={regulations} actions={actions} isExpanded={true} />
                    </div>
                </Modal>
            )}
            
            {expandedCard === 'bonus' && (
                <Modal title="Bonus Benvenuto" onClose={closeExpand} size="3xl">
                    <div className="h-[70vh]">
                        <BonusGrid user={user} heatingActions={heatingActions} />
                    </div>
                </Modal>
            )}

            {/* MOBILE LAYOUT (Tabs) - UPDATED SPACING & STRUCTURE */}
            <div className={`md:hidden flex-1 bg-[#F2F2F7] flex flex-col overflow-hidden relative`}>
                {activeTab === 'home' && (
                    <div className="h-full flex flex-col px-5 pt-5 pb-32 overflow-y-auto hide-scrollbar scroll-mask-bottom animate-fade-in gap-5">
                        {/* Balance Card - No flex-1 to prevent pushing content too far */}
                        <div className="bg-indigo-500 rounded-[2rem] p-5 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden border border-indigo-400/50 shrink-0 min-h-[200px] flex flex-col items-center justify-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
                            
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <p className="text-indigo-100 font-bold text-[10px] uppercase tracking-widest mb-2 opacity-90">Il tuo saldo</p>
                                <h2 className="text-6xl font-extrabold mb-2 tracking-tighter text-white drop-shadow-sm">
                                    <AnimatedCounter endValue={user.points} />
                                </h2>
                                
                                <button 
                                    onClick={() => setActiveTab('history')}
                                    className="mt-1 text-[10px] font-bold text-indigo-600 bg-white px-4 py-2 rounded-full hover:bg-indigo-50 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Vedi Storico
                                </button>
                            </div>
                        </div>

                        {/* Ungrouped Cards for Equidistant Spacing */}
                        {heatingActions.length > 0 && (
                            (() => {
                                const completedIds = user.completedHeatingActions || [];
                                const total = heatingActions.length;
                                const completed = completedIds.length;
                                const percent = total > 0 ? (completed / total) * 100 : 0;
                                const isBonusCompleted = total > 0 && completed === total;

                                return (
                                    <div 
                                        onClick={() => setActiveTab('bonus')} 
                                        className={`bg-white border p-4 rounded-[2rem] shadow-sm active:scale-95 transition-transform shrink-0 w-full group cursor-pointer ${isBonusCompleted ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-100 hover:shadow-md'}`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl border shadow-sm transition-colors ${isBonusCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-sm">Bonus Benvenuto</h3>
                                                    {isBonusCompleted && <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">Completato</p>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-extrabold text-slate-800 leading-none">
                                                    {completed}<span className="text-xs text-slate-400 font-medium">/{total}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                            <div 
                                                className={`h-full rounded-full shadow-sm transition-all duration-1000 ease-out relative overflow-hidden ${isBonusCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                style={{ width: `${percent}%` }}
                                            >
                                                {!isBonusCompleted && <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>}
                                            </div>
                                        </div>
                                        
                                        <p className="text-center text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide group-hover:text-indigo-500 transition-colors flex items-center justify-center gap-1">
                                            Tocca per i dettagli
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </p>
                                    </div>
                                );
                            })()
                        )}
                        <div className="shrink-0 w-full">
                            <NextRewardCard user={user} prizes={prizes} compact={true} />
                        </div>

                    </div>
                )}

                {activeTab === 'prizes' && (
                    <div className="p-5 h-full flex flex-col animate-fade-in pb-36">
                        <div className="flex items-center gap-3 mb-5 shrink-0">
                            <button onClick={() => setActiveTab('home')} className="p-2.5 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Premi Disponibili</h3>
                        </div>
                        <div className="flex-1 min-h-0">
                            {/* Wraps PrizesList in a Card-like white container similar to HistoryView */}
                            <div className="h-full bg-white rounded-[1.75rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col p-5">
                                <PrizesList user={user} prizes={prizes} isMobileView={true} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="p-5 h-full flex flex-col animate-fade-in pb-36">
                        <div className="flex items-center gap-3 mb-5 shrink-0">
                            <button onClick={() => setActiveTab('home')} className="p-2.5 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Storico Movimenti</h3>
                        </div>
                        <div className="flex-1 min-h-0">
                            <div className="h-full bg-white rounded-[1.75rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col p-5">
                                <HistoryView user={user} isExpanded={true} />
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'bonus' && (
                    <div className="p-5 h-full animate-fade-in flex flex-col">
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                            <button onClick={() => setActiveTab('home')} className="p-2.5 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Bonus Benvenuto</h3>
                                <p className="text-sm text-slate-500 font-medium">Completa gli slot per punti extra</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar scroll-mask-bottom">
                             <BonusGrid user={user} heatingActions={heatingActions} />
                        </div>
                    </div>
                )}

                {activeTab === 'regulations' && (
                    <div className="p-5 h-full flex flex-col animate-fade-in pb-36">
                         <div className="flex items-center gap-3 mb-5 shrink-0">
                             <button onClick={() => setActiveTab('home')} className="p-2.5 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Regole</h3>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex p-1 bg-slate-100 rounded-xl shrink-0 mb-6 border border-slate-200/50">
                            <button
                                onClick={() => setRegulationsSubTab('regulation')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${regulationsSubTab === 'regulation' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Regolamento
                            </button>
                            <button
                                onClick={() => setRegulationsSubTab('actions')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${regulationsSubTab === 'actions' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Azioni
                            </button>
                        </div>

                         <div className="flex-1 overflow-y-auto custom-scrollbar scroll-mask-bottom pr-1">
                             {regulationsSubTab === 'regulation' && (
                                <div className="animate-fade-in pb-4">
                                     {regulations ? (
                                         <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 prose prose-slate prose-sm max-w-none text-slate-600">
                                            <p className="whitespace-pre-wrap leading-relaxed text-sm">{regulations}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 text-sm font-medium">Nessun regolamento disponibile.</div>
                                    )}
                                </div>
                             )}

                             {regulationsSubTab === 'actions' && (
                                <div className="animate-fade-in pb-4">
                                    <div className="space-y-3">
                                        {actions.map(action => (
                                            <div key={action.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                                                <div>
                                                     <p className="font-bold text-slate-800 text-sm">{action.name}</p>
                                                     {action.description && <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>}
                                                </div>
                                                <div className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-sm whitespace-nowrap border border-emerald-100">
                                                    +{action.points} pt
                                                </div>
                                            </div>
                                        ))}
                                        {actions.length === 0 && (
                                             <div className="text-center py-6 text-slate-400 text-sm">Nessuna azione definita.</div>
                                        )}
                                    </div>
                                </div>
                             )}
                        </div>
                    </div>
                )}
            </div>

            {/* NEW MOBILE NAVIGATION - LIQUID GLASS STYLE */}
            <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
                <div className="pointer-events-auto w-full max-w-[340px] bg-white/70 backdrop-blur-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-white/60 rounded-full h-[72px] flex items-center justify-evenly px-2 ring-1 ring-black/5">

                    {/* Left: PREMI */}
                    <button 
                        onClick={() => setActiveTab('prizes')} 
                        className="flex flex-col items-center justify-center w-16 h-full group relative"
                    >
                         <div className={`transition-all duration-300 ease-out ${activeTab === 'prizes' ? 'text-indigo-600 scale-125 drop-shadow-md translate-y-[-2px]' : 'text-slate-400 scale-100 hover:text-slate-500'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={activeTab === 'prizes' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === 'prizes' ? 0 : 2} className="w-6 h-6">
                                {activeTab === 'prizes' ? (
                                     <g className="animate-shake-package origin-bottom">
                                        <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 4.002h3.193a1.875 1.875 0 0 1 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6a2.25 2.25 0 0 0 2.25-2.25v-6.75h-8.25Z" />
                                     </g>
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                                )}
                            </svg>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors mt-1 duration-300 ${activeTab === 'prizes' ? 'text-indigo-600' : 'text-slate-400'}`}>Premi</span>
                    </button>

                    {/* Center: HOME */}
                    <button 
                        onClick={() => setActiveTab('home')} 
                         className="flex flex-col items-center justify-center w-16 h-full group relative"
                    >
                         <div className={`transition-all duration-300 ease-out ${activeTab === 'home' ? 'text-indigo-600 scale-125 drop-shadow-md translate-y-[-2px]' : 'text-slate-400 scale-100 hover:text-slate-500'}`}>
                             <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                className="w-6 h-6"
                                fill={activeTab === 'home' ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth={1.5}
                             >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    d="m7.088 4.764l-1 .78C4.572 6.73 3.813 7.322 3.407 8.157S3 9.956 3 11.885v2.092c0 3.786 0 5.68 1.172 6.855C5.115 21.78 6.52 21.965 9 22v-3.994c0-.932 0-1.398.152-1.766a2 2 0 0 1 1.083-1.082c.367-.152.833-.152 1.765-.152s1.398 0 1.765.152a2 2 0 0 1 1.083 1.082c.152.368.152.834.152 1.766V22c2.48-.036 3.885-.22 4.828-1.168C21 19.657 21 17.764 21 13.978v-2.092c0-1.93 0-2.894-.407-3.729s-1.165-1.427-2.681-2.611l-1-.781C14.552 2.92 13.372 2 12 2s-2.552.921-4.912 2.764" 
                                />
                            </svg>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors mt-1 duration-300 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>Home</span>
                    </button>

                    {/* Right: REGOLE */}
                    <button 
                        onClick={() => setActiveTab('regulations')} 
                        className="flex flex-col items-center justify-center w-16 h-full group relative"
                    >
                         <div className={`transition-all duration-300 ease-out ${activeTab === 'regulations' ? 'text-indigo-600 scale-125 drop-shadow-md translate-y-[-2px]' : 'text-slate-400 scale-100 hover:text-slate-500'}`}>
                             <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                className="w-6 h-6"
                                fill={activeTab === 'regulations' ? "currentColor" : "none"} 
                                stroke="currentColor" 
                                strokeWidth={activeTab === 'regulations' ? 0 : 1.5}
                            >
                                <path d="m17 17.4l-1.9 1.9q-.275.275-.7.275t-.7-.275q-.275-.275-.275-.7t.275-.7l1.9-1.9l-1.9-1.9q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l1.9 1.9l1.9-1.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7L18.4 16l1.9 1.9q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275L17 17.4Zm-.65-9.225l3.55-3.55q.3-.3.7-.287t.7.312q.275.3.275.7t-.275.7l-4.225 4.25q-.3.3-.7.3t-.7-.3l-2.15-2.15q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l1.425 1.425ZM3 15h7q.425 0 .713.288T11 16q0 .425-.288.713T10 17H3q-.425 0-.713-.288T2 16q0-.425.288-.713T3 15Zm0-8h7q.425 0 .713.288T11 8q0 .425-.288.713T10 9H3q-.425 0-.713-.288T2 8q0-.425.288-.713T3 7Z" />
                            </svg>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors mt-1 duration-300 ${activeTab === 'regulations' ? 'text-indigo-600' : 'text-slate-400'}`}>Regole</span>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
