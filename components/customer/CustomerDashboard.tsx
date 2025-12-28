
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

const PrimiPassiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 512 512" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.175,203.061c0,0-0.004-0.013-0.007-0.026l-0.672-1.763L13.175,203.061z"/>
        <path d="M17.239,163.415l11.178-7.3c0.006,0,0.012-0.007,0.019-0.014L17.239,163.415z"/>
        <path d="M480.364,260.466c-0.549-1.436-0.823-2.951-0.823-4.466c0-1.521,0.274-3.042,0.826-4.492l16.869-44.275
            l1.586-4.172c1.74-4.564,2.582-9.324,2.582-14.006c0.006-12.986-6.458-25.516-17.835-32.953l-5.599-3.656l-37.84-24.708
            c-2.569-1.684-4.447-4.276-5.25-7.247l-13.548-50.047c-4.675-17.23-20.28-29.075-37.978-29.075c-0.669,0-1.335,0.013-2.004,0.052
            L329.766,44v-0.006l-0.774,0.02c-2.896,0-5.687-0.98-7.933-2.788l-37.766-30.42l-2.598-2.089
            C273.507,2.912,264.725-0.006,256.002,0c-8.72-0.013-17.504,2.912-24.697,8.717l0.01-0.007L195.11,37.87l-4.159,3.35
            c-2.256,1.815-5.057,2.795-7.94,2.795L182.338,44l-51.555-2.572l-0.033-0.007c-0.8-0.046-1.502-0.052-2.102-0.052
            c-17.701,0-33.303,11.844-37.978,29.075l-13.549,50.047c-0.806,2.983-2.693,5.582-5.278,7.273l-3.732,2.436l-39.694,25.915
            c-11.371,7.444-17.828,19.966-17.822,32.946c0,4.675,0.839,9.415,2.573,13.973l18.465,48.473l0.003,0.006
            c0.548,1.437,0.826,2.965,0.826,4.486c0,1.522-0.274,3.043-0.826,4.48l-18.461,48.46l0.003-0.006
            c-1.74,4.564-2.583,9.318-2.583,13.999c-0.006,12.987,6.451,25.523,17.838,32.966l32.218,21.038l11.201,7.313
            c2.583,1.684,4.463,4.27,5.269,7.26l13.549,50.041c4.671,17.23,20.28,29.075,37.978,29.081c0.6-0.006,1.254-0.013,1.952-0.052
            l-1.482,0.078l53.439-2.67h-0.026l0.5-0.007c2.866,0,5.658,0.98,7.91,2.795l40.371,32.522h0.003
            c7.185,5.792,15.964,8.71,24.687,8.704c8.72,0.007,17.502-2.912,24.691-8.71l43.841-35.318l-3.467,2.795
            c2.253-1.815,5.038-2.788,7.907-2.788l0.6,0.013l52.189,2.605l-0.262-0.012c0.568,0.026,1.186,0.039,1.855,0.045
            c17.691-0.006,33.306-11.844,37.978-29.081l13.548-50.041c0.806-2.99,2.684-5.569,5.262-7.254l43.45-28.37
            c11.364-7.444,17.818-19.966,17.812-32.947c0-4.682-0.842-9.442-2.586-14.012L480.364,260.466z M455.38,241.988
            c-1.72,4.512-2.582,9.265-2.582,14.012c0,4.754,0.862,9.507,2.582,14.019l18.449,48.44l0.003,0.007
            c0.565,1.482,0.829,2.984,0.829,4.473c-0.007,4.166-2.063,8.188-5.716,10.571l-43.41,28.344h0.003
            c-8.086,5.275-13.95,13.346-16.474,22.67l-13.548,50.04c-1.485,5.524-6.513,9.324-12.16,9.317l-0.751-0.02l-0.189-0.006
            l-51.474-2.566h0.036c-0.634-0.039-1.303-0.052-2.004-0.059c-8.968,0-17.685,3.069-24.694,8.717l-3.47,2.801l-36.897,29.721
            c-2.324,1.874-5.086,2.788-7.91,2.788c-2.82,0-5.586-0.914-7.913-2.788l-40.368-32.522c-7.006-5.641-15.719-8.71-24.69-8.71
            c-0.601,0-1.303,0.007-2.106,0.052v0.007l-51.64,2.579l0.016-0.006l-0.652,0.013c-5.642,0.006-10.676-3.794-12.161-9.317
            l-13.548-50.04c-2.524-9.324-8.387-17.394-16.474-22.67l-32.212-21.031l-11.194-7.313c-3.65-2.377-5.713-6.405-5.72-10.578
            c0.003-1.496,0.265-2.997,0.826-4.466l18.461-48.454l-0.003,0.007c1.72-4.518,2.582-9.265,2.582-14.019
            c0-4.753-0.858-9.506-2.582-14.018L38.848,195.33l-0.679-1.776c-0.565-1.489-0.826-2.997-0.83-4.492
            c0.007-4.172,2.067-8.188,5.716-10.564l43.414-28.343l0.007-0.007c8.082-5.288,13.94-13.352,16.464-22.67l13.548-50.047
            c1.482-5.517,6.523-9.324,12.161-9.317l0.503,0.006l51.91,2.592l0.056,0.007c0.63,0.026,1.264,0.04,1.894,0.046
            c8.968,0,17.688-3.063,24.701-8.704l40.386-32.529c2.321-1.874,5.08-2.782,7.904-2.788c2.821,0,5.583,0.914,7.907,2.788
            l-2.602-2.096l42.979,34.618c7.022,5.654,15.752,8.704,24.707,8.704c0.666,0,1.263-0.02,1.792-0.033h-0.14l52.075-2.599h0.035
            l0.601-0.013c5.641-0.007,10.678,3.8,12.16,9.317l13.548,50.047c2.524,9.317,8.38,17.381,16.464,22.67l49.018,32.006l-5.602-3.656
            c3.653,2.377,5.71,6.392,5.716,10.558c0,1.496-0.264,2.998-0.832,4.492l-20.832,54.683L455.38,241.988z"/>
        <path d="M196.151,226.298l-13.784,2.709c-0.725,0.15-1.123,0.725-0.979,1.463l10.254,52.175l-0.597,0.124
            l-39.528-46.423c-0.653-0.757-1.45-0.986-2.305-0.816l-14.636,2.88c-0.725,0.144-1.123,0.718-0.966,1.455l15.817,80.448
            c0.14,0.738,0.725,1.136,1.45,0.992l13.783-2.71c0.725-0.15,1.123-0.731,0.983-1.469l-10.242-52.051l0.61-0.118l39.613,46.28
            c0.653,0.757,1.338,0.999,2.318,0.816l14.509-2.86c0.724-0.144,1.122-0.725,0.966-1.463l-15.814-80.454
            C197.46,226.54,196.876,226.155,196.151,226.298z"/>
        <path d="M280.868,279.649l-35.731,7.026c-0.483,0.105-0.78-0.091-0.865-0.581l-3.385-17.192
            c-0.102-0.483,0.098-0.77,0.581-0.874l29.757-5.85c0.725-0.144,1.123-0.719,0.983-1.449l-2.546-12.922
            c-0.144-0.724-0.728-1.123-1.453-0.986l-29.754,5.857c-0.484,0.091-0.784-0.111-0.881-0.594l-3.232-16.454
            c-0.098-0.49,0.101-0.784,0.584-0.875l35.731-7.026c0.725-0.144,1.123-0.725,0.966-1.456l-2.56-13.038
            c-0.144-0.738-0.725-1.13-1.453-0.986l-53.152,10.454c-0.741,0.144-1.126,0.725-0.982,1.462l15.817,80.454
            c0.156,0.732,0.724,1.123,1.465,0.98l53.152-10.454c0.728-0.144,1.126-0.725,0.97-1.456l-2.563-13.046
            C282.178,279.91,281.593,279.506,280.868,279.649z"/>
        <path d="M377.221,190.694l-15.605,3.068c-0.852,0.164-1.266,0.634-1.224,1.515l-1.221,54.291l-0.258,0.046
            l-24.847-49.16c-0.398-0.699-0.983-1.084-1.708-0.94l-10.61,2.083c-0.839,0.17-1.237,0.744-1.338,1.541l-3.911,54.82l-0.242,0.052
            l-22.19-49.701c-0.255-0.718-0.839-1.096-1.691-0.927l-15.732,3.082c-0.852,0.17-0.996,0.706-0.725,1.417l37.266,76.23
            c0.398,0.685,0.98,1.084,1.708,0.94l12.19-2.403c0.852-0.163,1.25-0.751,1.348-1.528l4.368-54.415l0.242-0.045l24.521,48.728
            c0.385,0.685,0.97,1.084,1.822,0.914l12.19-2.403c0.852-0.157,1.365-0.77,1.352-1.535l5.504-84.645
            C378.4,190.955,378.073,190.524,377.221,190.694z"/>
    </svg>
);

const InfoPanel: React.FC<{ regulations: string, actions: Action[], onExpand?: () => void, isExpanded?: boolean }> = ({ regulations, actions, onExpand, isExpanded }) => {
    const [tab, setTab] = useState<'regulations' | 'actions'>('regulations');

    return (
        <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-md ${isExpanded ? 'border-none shadow-none rounded-none' : ''}`}>
            <div className={`px-6 pt-6 pb-4 shrink-0 flex items-center justify-between bg-white z-10 ${isExpanded ? 'hidden' : ''}`}>
                <h3 className="font-bold text-slate-800 text-lg tracking-tight">Regole e Azioni</h3>
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

const NextRewardCard: React.FC<{ user: User, prizes: Prize[], compact?: boolean, onClick?: () => void }> = ({ user, prizes, compact = false, onClick }) => {
    const nextReward = prizes.find(p => p.pointsRequired > user.points);
    const containerPadding = compact ? 'p-5' : 'p-6';
    const titleSize = compact ? 'text-lg' : 'text-xl';
    
    if (!nextReward) {
        return (
            <div 
                onClick={onClick}
                className={`bg-white border border-slate-100 shadow-sm ${containerPadding} rounded-[2rem] relative overflow-hidden group hover:shadow-md transition-all duration-300 shrink-0 w-full cursor-pointer`}
            >
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">WOW! Quanti punti</h3>
                        <p className="text-slate-500 text-xs mt-1 font-medium">Hai l'imbarazzo della scelta, corri in salone!</p>
                    </div>
                    <div className="flex items-center justify-center pr-2">
                        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-indigo-600">
                            <path d="M7.2998 5H22L20 12H8.37675M21 16H9L7 3H4M4 8H2M5 11H2M6 14H2M10 20C10 20.5523 9.55228 21 9 21C8.44772 21 8 20.5523 8 20C8 19.4477 8.44772 19 9 19C9.55228 19 10 19.4477 10 20ZM21 20C21 20.5523 20.5523 21 20 21C19.4477 21 19 20.5523 19 20C19 19.4477 19.4477 19 20 19C20.5523 19 21 19.4477 21 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
                {/* Visual indicator for interactive area even when complete */}
                <div className="flex justify-center mt-3 md:hidden">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                        Sfoglia Premi
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                    </span>
                </div>
            </div>
        );
    }

    const pointsNeeded = nextReward.pointsRequired - user.points;
    const progress = Math.min((user.points / nextReward.pointsRequired) * 100, 100);

    return (
        <div 
            onClick={onClick}
            className={`rounded-[2rem] ${containerPadding} bg-white border border-slate-100 shadow-sm relative overflow-hidden transform transition-all hover:shadow-md hover:-translate-y-1 group shrink-0 w-full cursor-pointer`}
        >
            <div className="relative z-10">
                <div className={`flex justify-between items-start ${compact ? 'mb-3' : 'mb-4'}`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Premio più Vicino</p>
                        </div>
                        <h3 className={`${titleSize} font-extrabold leading-tight tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors`}>{nextReward.name}</h3>
                    </div>
                    {!compact && (
                        <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-500">
                                <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22H19.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
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
            
            {/* Pulsante visuale per mobile per indicare l'interattività */}
            <div className="flex justify-center mt-3 md:hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                    Sfoglia Premi
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                </span>
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
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0a9 9 0 0 1 18 0z" />
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
                        <div className={`font-bold text-xs sm:text-sm shrink-0 px-2.5 py-1 rounded-xl ${tx.pointsChange > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
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
            <div className="flex-1 overflow-y-auto custom-scrollbar scroll-mask-bottom pr-2 -mr-2">
                {activeTab === 'all' && renderTransactionList(allTransactions)}
                {activeTab === 'awarded' && renderTransactionList(awardedTransactions)}
                {activeTab === 'redeemed' && renderTransactionList(redeemedTransactions)}
            </div>
        </div>
    );
};

const BonusGrid: React.FC<{ user: User, heatingActions: HeatingAction[], compact?: boolean, onExpand?: () => void, disableAnimation?: boolean }> = ({ user, heatingActions, compact = false, onExpand, disableAnimation = false }) => {
    const completedIds = user.completedHeatingActions || [];
    const total = heatingActions.length;
    const completed = completedIds.length;
    const isFullyCompleted = total > 0 && completed === total;
    const shouldBreathe = total > 0 && completed < total && !disableAnimation;
    const percent = total > 0 ? (completed / total) * 100 : 0;
    
    if (compact) {
        return (
            <div 
                onClick={onExpand}
                className={`bg-white border ${isFullyCompleted ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-100'} ${shouldBreathe ? 'animate-breath' : ''} shadow-sm p-5 rounded-[2rem] transition-all duration-300 hover:shadow-md cursor-pointer shrink-0 relative overflow-hidden group w-full`}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <PrimiPassiIcon className={`h-8 w-8 ${isFullyCompleted ? 'text-emerald-600' : 'text-indigo-500'}`} />
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Primi Passi</h3>
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
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`bg-white h-full overflow-hidden flex flex-col ${onExpand ? 'p-0' : 'p-6 border border-slate-100 rounded-[2rem] shadow-sm'}`}>
            {!onExpand && (
                 <div className="flex items-center gap-3 mb-6 shrink-0">
                    <PrimiPassiIcon className={`h-12 w-12 ${isFullyCompleted ? 'text-emerald-600' : 'text-indigo-500'}`} />
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Primi Passi</h3>
                        <p className={`text-sm font-bold uppercase tracking-wide mt-0.5 ${isFullyCompleted ? 'text-emerald-600' : 'text-indigo-600 opacity-90'}`}>
                            {isFullyCompleted ? 'Tutte le azioni completate!' : `${completed} su ${total} Completati`}
                        </p>
                    </div>
                </div>
            )}
            
            <div className="flex-1 overflow-y-auto custom-scrollbar scroll-mask-bottom">
                <div className="mb-6 bg-indigo-50/50 text-indigo-900 text-xs p-3.5 rounded-2xl border border-indigo-100 flex gap-3 items-start leading-relaxed animate-fade-in shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 a9 9 0 0 1 18 0z" />
                    </svg>
                    <p className="font-medium">
                        Benvenut* ! Le azioni in questa sezione possono essere eseguite <span className="font-bold">UNA SOLA VOLTA</span>.
                    </p>
                </div>

                <div className="grid grid-cols-5 gap-2 shrink-0 p-1">
                    {heatingActions.map((action) => {
                        const isDone = completedIds.includes(action.id);
                        return (
                            <div key={action.id} className="flex flex-col items-center gap-1.5 group p-2 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all duration-300">
                                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 shadow-sm ${isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200' : 'bg-white border-slate-200 text-slate-300 group-hover:border-indigo-200 group-hover:text-indigo-400'}`}>
                                    {isDone ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <span className="font-bold text-xs sm:text-lg">{action.slot}</span>
                                    )}
                                </div>
                                <div className="flex flex-col items-center justify-center w-full min-0 mt-1">
                                    <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>+{action.points} pt</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center justify-center py-8 animate-pulse text-slate-400 gap-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em]">Dettagli Azioni</p>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 animate-bounce">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                    </svg>
                </div>
                
                <div className="mt-2 pt-6 border-t border-slate-100 pb-8">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                        Dettagli Azioni
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {heatingActions.map(action => {
                            const isDone = completedIds.includes(action.id);
                            return (
                                <div key={action.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all border ${isDone ? 'bg-emerald-50/30 border-emerald-100' : 'hover:bg-slate-50 border-transparent hover:border-slate-100'}`}>
                                    <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold rounded-lg mt-0.5 ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {isDone ? (
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        ) : action.slot}
                                    </span>
                                    <div className="min-w-0 w-full">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm font-bold ${isDone ? 'text-emerald-900' : 'text-slate-700'}`}>{action.name}</p>
                                            <div className="flex flex-col items-end gap-1 ml-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${isDone ? 'text-emerald-600 bg-white border-emerald-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>+{action.points} pt</span>
                                                {isDone && (
                                                    <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-tighter">Completata</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className={`text-xs leading-relaxed mt-0.5 ${isDone ? 'text-emerald-700/70' : 'text-slate-500'}`}>{action.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PrizesList: React.FC<{ user: User, prizes: Prize[], isMobileView?: boolean, onExpand?: () => void, isExpanded?: boolean }> = ({ user, prizes, isMobileView = false, onExpand, isExpanded }) => {
    const cardPadding = isMobileView ? 'p-3 rounded-2xl' : 'p-4 rounded-3xl';
    const iconPadding = isMobileView ? 'p-1.5 rounded-lg' : 'p-2 rounded-xl';
    const pointsSize = isMobileView ? 'text-base' : 'text-lg';
    const titleSize = isMobileView ? 'text-xs' : 'text-sm';
    const descSize = isMobileView ? 'text-[10px]' : 'text-[11px]';
    const mbHeader = isMobileView ? 'mb-1' : 'mb-2';
    const mbDesc = isMobileView ? 'mb-2' : 'mb-3';

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
                <div className={`grid gap-3 ${gridCols} pb-32`}>
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
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [regulations, setRegulations] = useState('');
    const [heatingActions, setHeatingActions] = useState<HeatingAction[]>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [activeTab, setActiveTab] = useState<'home' | 'prizes' | 'history' | 'bonus' | 'regulations'>('home');
    const [regulationsSubTab, setRegulationsSubTab] = useState<'regulation' | 'actions'>('regulation');
    
    const [expandedCard, setExpandedCard] = useState<'prizes' | 'history' | 'rules' | 'bonus' | null>(null);
    const [isExiting, setIsExiting] = useState(false);

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

    const handleNavigate = (newTab: 'home' | 'prizes' | 'history' | 'bonus' | 'regulations') => {
        setActiveTab(newTab);
    };

    const handleBack = () => {
        setIsExiting(true);
        setTimeout(() => {
            setActiveTab('home');
            setIsExiting(false);
        }, 300);
    };

    const handleNextObjectiveClick = () => {
        if (window.innerWidth >= 768) {
            handleExpand('prizes');
        } else {
            handleNavigate('prizes');
        }
    };

    return (
        <div className="h-full flex flex-col md:overflow-hidden relative bg-[#F2F2F7]">
            
            <div className="hidden md:grid h-full w-full p-4 lg:p-6 gap-4 lg:gap-6 max-w-[1920px] mx-auto overflow-hidden grid-cols-12 grid-rows-[auto_1fr] lg:grid-rows-1">
                
                <div className="col-span-12 lg:col-span-3 flex flex-row lg:flex-col gap-4 h-full min-h-0 overflow-visible lg:overflow-hidden">
                    
                     <div className="bg-indigo-500 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(99,102,241,0.25)] border border-indigo-400/50 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 shrink-0 flex-1 lg:flex-none lg:h-48">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
                        
                        <p className="text-indigo-100 font-bold text-[10px] uppercase tracking-widest mb-2 relative z-10">Il tuo saldo</p>
                        <h2 className="text-6xl font-extrabold mb-1 tracking-tighter text-white relative z-10 drop-shadow-sm">
                            <AnimatedCounter endValue={user.points} />
                        </h2>
                        <span className="text-indigo-100 text-xs font-medium relative z-10">punti totali</span>
                    </div>

                    {heatingActions.length > 0 && (
                        <div className="flex-1 lg:flex-none">
                           <BonusGrid user={user} heatingActions={heatingActions} compact={true} onExpand={() => handleExpand('bonus')} disableAnimation={true} />
                        </div>
                    )}

                    <div className="flex-1 lg:flex-none lg:flex-1 min-h-0">
                        <NextRewardCard user={user} prizes={prizes} compact={true} onClick={handleNextObjectiveClick} />
                    </div>
                </div>

                <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col h-full min-h-0">
                    <div className="flex-1 bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col relative">
                        <PrizesList user={user} prizes={prizes} isMobileView={false} onExpand={() => handleExpand('prizes')} />
                    </div>
                </div>

                <div className="hidden md:flex col-span-12 md:col-span-4 lg:col-span-3 flex-col gap-4 h-full min-h-0">
                    <div className="flex-1 min-h-0">
                        <HistoryView user={user} onExpand={() => handleExpand('history')} />
                    </div>
                    <div className="flex-1 min-h-0">
                        <InfoPanel regulations={regulations} actions={actions} onExpand={() => handleExpand('rules')} />
                    </div>
                </div>
            </div>

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
                <Modal title="Regole e Azioni" onClose={closeExpand} size="2xl">
                    <div className="h-[70vh]">
                        <InfoPanel regulations={regulations} actions={actions} isExpanded={true} />
                    </div>
                </Modal>
            )}
            
            {expandedCard === 'bonus' && (
                <Modal title="Primi Passi" onClose={closeExpand} size="3xl">
                    <div className="h-[70vh]">
                        <BonusGrid user={user} heatingActions={heatingActions} />
                    </div>
                </Modal>
            )}

            <div className={`md:hidden flex-1 bg-[#F2F2F7] flex flex-col overflow-hidden relative`}>
                {activeTab === 'home' && (
                    <div className="h-full flex flex-col px-5 pt-5 pb-32 pb-safe animate-fade-in gap-5 justify-center">
                        <div className="bg-indigo-500 rounded-[2rem] p-5 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden border border-indigo-400/50 shrink-0 min-h-[180px] flex flex-col items-center justify-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
                            
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <p className="text-indigo-100 font-bold text-[10px] uppercase tracking-widest mb-2 opacity-90">Il tuo saldo</p>
                                <h2 className="text-6xl font-extrabold mb-2 tracking-tighter text-white drop-shadow-sm">
                                    <AnimatedCounter endValue={user.points} />
                                </h2>
                                
                                <button 
                                    onClick={() => handleNavigate('history')}
                                    className="mt-1 text-[10px] font-bold text-indigo-600 bg-white px-4 py-2 rounded-full hover:bg-indigo-50 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 a9 9 0 0 1 18 0z" /></svg>
                                    Vedi Storico
                                </button>
                            </div>
                        </div>

                        {heatingActions.length > 0 && (
                            (() => {
                                const completedIds = user.completedHeatingActions || [];
                                const total = heatingActions.length;
                                const completed = completedIds.length;
                                const percent = total > 0 ? (completed / total) * 100 : 0;
                                const isBonusCompleted = total > 0 && completed === total;
                                const shouldBreatheBonus = total > 0 && completed < total;

                                return (
                                    <div 
                                        onClick={() => handleNavigate('bonus')} 
                                        className={`bg-white border p-4 rounded-[2rem] shadow-sm active:scale-95 transition-transform shrink-0 w-full group cursor-pointer ${isBonusCompleted ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-100'} ${shouldBreatheBonus ? 'animate-breath' : ''}`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-3">
                                                <PrimiPassiIcon className={`h-10 w-10 ${isBonusCompleted ? 'text-emerald-600' : 'text-indigo-500'}`} />
                                                <div className="flex flex-col">
                                                    <h3 className="font-bold text-slate-800 text-sm leading-none">Primi Passi</h3>
                                                    {isBonusCompleted && <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide mt-1">Completato</p>}
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
                                            </div>
                                        </div>
                                        
                                        <p className="text-center text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide group-hover:text-indigo-500 transition-colors flex items-center justify-center gap-1">
                                            Tocca per i dettagli
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1-1.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </p>
                                    </div>
                                );
                            })()
                        )}
                        <div className="shrink-0 w-full">
                            <NextRewardCard user={user} prizes={prizes} compact={true} onClick={handleNextObjectiveClick} />
                        </div>
                    </div>
                )}

                {activeTab === 'prizes' && (
                    <div className={`p-5 h-full flex flex-col pb-32 pb-safe ${isExiting ? 'animate-slide-out-left' : 'animate-fade-in'}`}>
                        <div className="flex items-center gap-3 mb-5 shrink-0">
                            <button onClick={handleBack} className="p-2.5 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Premi Disponibili</h3>
                        </div>
                        <div className="flex-1 min-h-0">
                            <div className="h-full bg-white rounded-[1.75rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col p-5">
                                <PrizesList user={user} prizes={prizes} isMobileView={true} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className={`p-5 h-full flex flex-col pb-32 pb-safe ${isExiting ? 'animate-slide-out-left' : 'animate-fade-in'}`}>
                        <div className="flex items-center gap-3 mb-5 shrink-0">
                            <button onClick={handleBack} className="p-2.5 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
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
                    <div className={`p-5 h-full flex flex-col pb-32 pb-safe ${isExiting ? 'animate-slide-out-left' : 'animate-fade-in'}`}>
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                            <button onClick={handleBack} className="p-2.5 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Primi Passi</h3>
                                <p className="text-sm text-slate-500 font-medium">Completa gli slot per punti extra</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-mask-bottom">
                             <BonusGrid user={user} heatingActions={heatingActions} />
                        </div>
                    </div>
                )}

                {activeTab === 'regulations' && (
                    <div className={`p-5 h-full flex flex-col pb-32 pb-safe ${isExiting ? 'animate-slide-out-left' : 'animate-fade-in'}`}>
                         <div className="flex items-center gap-3 mb-5 shrink-0">
                             <button onClick={handleBack} className="p-2.5 -ml-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                            </button>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Regole e Azioni</h3>
                        </div>

                        <div className="flex p-1 bg-slate-100 rounded-xl shrink-0 mb-6 border border-slate-200/50">
                            <button
                                onClick={() => setRegulationsSubTab('regulation')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${regulationsSubTab === 'regulation' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Regolamento
                            </button>
                            <button
                                onClick={() => setRegulationsSubTab('actions')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${regulationsSubTab === 'actions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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

            <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
                <div className="pointer-events-auto w-full max-w-[340px] bg-white/70 backdrop-blur-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-white/60 rounded-full h-[72px] flex items-center justify-evenly px-2 ring-1 ring-black/5">

                    <button 
                        onClick={() => handleNavigate('prizes')} 
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

                    <button 
                        onClick={() => handleNavigate('home')} 
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

                    <button 
                        onClick={() => handleNavigate('regulations')} 
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
                                <path d="m17 17.4l-1.9 1.9q-.275.275-.7.275t-.7-.275q-.275-.275-.7-.275t.275-.7l1.9-1.9l-1.9-1.9q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l1.9 1.9l1.9-1.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7L18.4 16l1.9 1.9q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275L17 17.4Zm-.65-9.225l3.55-3.55q.3-.3.7-.287t.7.312q.275.3.275.7t-.275.7l-4.225 4.25q-.3.3-.7.3t-.7-.3l-2.15-2.15q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l1.425 1.425ZM3 15h7q.425 0 .713.288T11 16q0 .425-.288.713T10 17H3q-.425 0-.713-.288T2 16q0-.425.288-.713T3 15Zm0-8h7q.425 0 .713.288T11 8q0 .425-.288.713T10 9H3q-.425 0-.713-.288T2 8q0-.425.288-.713T3 7Z" />
                            </svg>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wide transition-colors mt-1 duration-300 ${activeTab === 'regulations' ? 'text-indigo-600' : 'text-slate-400'}`}>Regole e Azioni</span>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
