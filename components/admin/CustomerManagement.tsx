
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { User, Action, Prize, PointTransaction, HeatingAction } from '../../types';
import { getCustomersPaginated, searchCustomers, createCustomer, updateUserPoints, getActions, deleteCustomer, getPrizes, getTransactionsForUser, reverseTransaction, assignPointsToMultipleUsers, getHeatingActions, assignHeatingAction, getCurrentUser } from '../../services/dataService';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';

// Shared Icons for Consistency
const Icons = {
    Search: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
    Filter: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>,
    Check: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>,
    Assign: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>, // Using Plus for Assign
    Redeem: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>,
    History: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 a9 9 0 0 1 18 0Z" /></svg>,
    Delete: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>,
};

const AssignPointsModal: React.FC<{ user: User, onClose: () => void, onUpdate: (user: User, message: string) => void }> = ({ user, onClose, onUpdate }) => {
    const [actions, setActions] = useState<Action[]>([]);
    const [heatingActions, setHeatingActions] = useState<HeatingAction[]>([]);
    const [activeTab, setActiveTab] = useState<'standard' | 'heating'>('standard');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchAllActions = async () => {
            setIsLoading(true);
            const [standardActions, allHeatingActions] = await Promise.all([
                getActions(),
                getHeatingActions()
            ]);
            setActions(standardActions.filter(a => a.isEnabled));
            setHeatingActions(allHeatingActions);
            setIsLoading(false);
        };
        fetchAllActions();
    }, [user.id]);

    const applyStandardAction = async (action: Action) => {
        setIsLoading(true);
        const description = action.description ? `${action.name} (${action.description})` : action.name;
        const currentAdmin = getCurrentUser();
        const updatedUser = await updateUserPoints(user.id, action.points, description, currentAdmin?.username);
        if (updatedUser) {
            onUpdate(updatedUser, `${action.points} punti assegnati per "${action.name}"`);
        }
        onClose();
    };

    const applyHeatingAction = async (action: HeatingAction) => {
        setIsLoading(true);
        const currentAdmin = getCurrentUser();
        const updatedUser = await assignHeatingAction(user.id, action, currentAdmin?.username);
        if (updatedUser) {
            onUpdate(updatedUser, `${action.points} punti Primi Passi assegnati per "${action.name}"`);
        }
        onClose();
    };
    
    const filteredStandardActions = actions.filter(action => 
        action.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredHeatingActions = heatingActions.filter(action =>
        action.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const completedHeatingIds = useMemo(() => new Set(user.completedHeatingActions || []), [user.completedHeatingActions]);

    const renderTabButton = (tabName: 'standard' | 'heating', label: string) => {
        const isActive = activeTab === tabName;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="text-gray-700 w-full relative">
            <div className="sticky top-0 bg-white z-10 pb-4 -mt-2">
                <div className="bg-slate-100 p-1 rounded-xl mb-4 flex space-x-1">
                    {renderTabButton('standard', 'Azioni Standard')}
                    {renderTabButton('heating', 'Primi Passi')}
                </div>
                
                <input
                    type="search"
                    placeholder="Cerca azione..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                />
            </div>
            
            <div className="space-y-2 pb-4">
                {isLoading && <p className="text-center p-4 text-slate-400">Caricamento...</p>}
                
                {activeTab === 'standard' && !isLoading && (
                    filteredStandardActions.length > 0 ? filteredStandardActions.map(action => (
                        <div key={action.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border border-slate-100 bg-white transition-all hover:border-indigo-200 hover:shadow-sm gap-3">
                            <div className="flex-grow min-w-0">
                                <p className="font-bold text-slate-800 break-words">{action.name}</p>
                                <p className="text-sm text-slate-500 break-words">{action.description || 'Nessuna descrizione'}</p>
                            </div>
                            <Button size="sm" onClick={() => applyStandardAction(action)} disabled={isLoading} className="shrink-0 w-full sm:w-auto">
                               + {action.points} Punti
                            </Button>
                        </div>
                    )) : <p className="text-center text-slate-500 py-8">Nessuna azione trovata.</p>
                )}

                {activeTab === 'heating' && !isLoading && (
                    <>
                        <div className="bg-indigo-50/50 text-indigo-800 text-sm p-4 rounded-xl mb-4 border border-indigo-100 leading-relaxed">
                            <p>Le azioni Primi Passi possono essere assegnate <strong>una sola volta</strong> per cliente.</p>
                        </div>
                        {filteredHeatingActions.length > 0 ? filteredHeatingActions.map(action => {
                            const isCompleted = completedHeatingIds.has(action.id);
                             return (
                                <div 
                                    key={action.id} 
                                    className={`relative flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border transition-all gap-3 ${isCompleted ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm'}`}
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className={`shrink-0 w-6 h-6 flex items-center justify-center font-bold rounded-full text-xs border-2 border-white shadow-sm ${isCompleted ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {action.slot}
                                        </div>
                                        <div>
                                            <p className={`font-bold break-words ${isCompleted ? 'text-slate-500' : 'text-slate-800'}`}>{action.name}</p>
                                            <p className="text-sm text-slate-500 break-words">{action.description || 'Azione unica'}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => applyHeatingAction(action)} disabled={isLoading || isCompleted} className="w-full sm:w-auto shrink-0" variant={isCompleted ? "secondary" : "primary"}>
                                       {isCompleted ? 'Assegnata' : `+ ${action.points} Punti`}
                                    </Button>
                                </div>
                            );
                        }) : <p className="text-center text-slate-500 py-8">Nessuna azione Primi Passi trovata.</p>}
                    </>
                )}
            </div>
        </div>
    );
};

const RedeemPrizeModal: React.FC<{ user: User, onClose: () => void, onUpdate: (user: User, message: string) => void }> = ({ user, onClose, onUpdate }) => {
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPrizes = async () => {
            setPrizes(await getPrizes());
            setIsLoading(false);
        }
        fetchPrizes();
    }, []);

    const handleRedeem = async (prize: Prize) => {
        setIsLoading(true);
        const description = `Riscatto: ${prize.name} (${prize.description})`;
        const currentAdmin = getCurrentUser();
        const updatedUser = await updateUserPoints(user.id, -prize.pointsRequired, description, currentAdmin?.username);
        if(updatedUser) {
            onUpdate(updatedUser, `Premio "${prize.name}" riscattato con successo!`);
        }
        onClose();
    };

    return (
        <div className="text-gray-700 w-full">
            <div className="space-y-2 pb-4">
                {isLoading ? <p className="text-center p-4 text-slate-400">Caricamento...</p> : prizes.map(prize => {
                    const canRedeem = user.points >= prize.pointsRequired;
                    return (
                        <div key={prize.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border transition-all gap-3 ${canRedeem ? 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm' : 'bg-slate-50 opacity-60 border-slate-200'}`}>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 break-words">{prize.name}</p>
                                <p className="text-sm text-slate-500 break-words">{prize.pointsRequired} punti</p>
                            </div>
                            <Button size="sm" onClick={() => handleRedeem(prize)} disabled={!canRedeem || isLoading} className="w-full sm:w-auto shrink-0">
                                Riscatta
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const HistoryModal: React.FC<{ user: User, onClose: () => void, onUpdate: (user: User, message: string) => void }> = ({ user, onClose, onUpdate }) => {
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'redeemed'>('all');
    const [txToReverse, setTxToReverse] = useState<PointTransaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        const userTransactions = await getTransactionsForUser(user.id);
        setTransactions(userTransactions);
        setIsLoading(false);
    }, [user.id]);
    
    useEffect(() => { fetchHistory(); }, [fetchHistory]);
    
    const assignedTransactions = transactions.filter(tx => tx.pointsChange >= 0);
    const redeemedTransactions = transactions.filter(tx => tx.pointsChange < 0);

    const handleConfirmReverse = async () => {
        if (txToReverse) {
            setIsLoading(true);
            const currentAdmin = getCurrentUser();
            const updatedUser = await reverseTransaction(txToReverse.id, currentAdmin?.username);
            if(updatedUser) onUpdate(updatedUser, 'Transazione stornata con successo.');
            await fetchHistory();
            setTxToReverse(null);
            setIsLoading(false);
        }
    };

    const renderTransactionHistory = (txs: PointTransaction[]) => {
        if (txs.length === 0) {
            return (
                 <div className="text-center text-slate-500 py-12 animate-fade-in">
                    <div className="mx-auto h-20 w-20 text-slate-200 flex items-center justify-center mb-2">
                       {Icons.History}
                    </div>
                    <p className="font-semibold text-slate-700">Nessuna transazione</p>
                </div>
            )
        }
        return (
            <div>
                 {/* Mobile Card View */}
                <div className="md:hidden space-y-3 pb-4">
                    {txs.map(tx => {
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

                        return (
                            <div key={tx.id} className={`p-4 rounded-2xl border ${tx.isReversed ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-grow min-w-0">
                                        <p className={`font-bold text-sm break-words ${tx.isReversed ? 'line-through' : 'text-slate-800'}`}>{name}</p>
                                        <p className={`text-xs ${tx.isReversed ? 'line-through' : 'text-slate-500'}`}>
                                            {new Date(tx.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`font-bold text-lg ${tx.isReversed ? 'line-through' : (tx.pointsChange >= 0 ? 'text-emerald-600' : 'text-red-500')}`}>
                                            {tx.pointsChange > 0 ? `+${tx.pointsChange}` : tx.pointsChange}
                                        </p>
                                        <p className={`text-[10px] font-mono ${tx.isReversed ? 'line-through' : 'text-slate-400'}`}>Saldo: {tx.balanceAfter}</p>
                                    </div>
                                </div>
                                {(description !== '-' || (!tx.isReversed && (tx.type === 'assignment' || tx.type === 'redemption'))) && (
                                    <div className="mt-3 pt-3 border-t border-slate-100/50 flex justify-between items-center gap-3">
                                        <p className={`text-xs text-slate-500 break-words ${tx.isReversed ? 'line-through' : ''}`}>{description}</p>
                                        {!tx.isReversed && (tx.type === 'assignment' || tx.type === 'redemption') && (
                                            <button onClick={() => setTxToReverse(tx)} className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0" title="Storna Transazione" disabled={isLoading}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm text-center table-auto">
                        <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0">
                            <tr>
                                <th className="p-4 font-semibold w-32 whitespace-nowrap border-b border-slate-200">Data</th>
                                <th className="p-4 font-semibold border-b border-slate-200">Nome</th>
                                <th className="p-4 font-semibold border-b border-slate-200">Descrizione</th>
                                <th className="p-4 font-semibold w-24 whitespace-nowrap border-b border-slate-200">Variazione</th>
                                <th className="p-4 font-semibold w-24 whitespace-nowrap border-b border-slate-200">Saldo</th>
                                <th className="p-4 font-semibold w-16 border-b border-slate-200">Azione</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {txs.map(tx => {
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

                                return (
                                    <tr key={tx.id} className={`border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors ${tx.isReversed ? 'bg-slate-50 text-slate-400' : 'bg-white'}`}>
                                        <td className={`p-4 whitespace-nowrap ${tx.isReversed ? 'line-through' : ''}`}>
                                            {new Date(tx.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className={`p-4 font-medium break-words max-w-[200px] ${tx.isReversed ? 'line-through' : ''}`}>{name}</td>
                                        <td className={`p-4 break-words max-w-[250px] text-slate-500 ${tx.isReversed ? 'line-through' : ''}`}>{description}</td>
                                        <td className={`p-4 font-bold whitespace-nowrap ${tx.isReversed ? 'line-through' : (tx.pointsChange >= 0 ? 'text-emerald-500' : 'text-red-500')}`}>
                                            {tx.pointsChange > 0 ? `+${tx.pointsChange}` : tx.pointsChange}
                                        </td>
                                        <td className={`p-4 font-mono whitespace-nowrap ${tx.isReversed ? 'line-through' : ''}`}>{tx.balanceAfter}</td>
                                        <td className="p-4">
                                            {!tx.isReversed && (tx.type === 'assignment' || tx.type === 'redemption') && (
                                                <button onClick={() => setTxToReverse(tx)} className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors mx-auto block" title="Storna Transazione" disabled={isLoading}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
    
    const renderTabButton = (tabName: 'all' | 'assigned' | 'redeemed', label: string) => {
        const isActive = activeTab === tabName;
        return (
            <button 
                onClick={() => setActiveTab(tabName)} 
                className={`flex-1 text-center transition-all duration-200 ${isActive ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'} py-2 px-1 text-xs sm:text-sm font-semibold rounded-lg`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="text-gray-700 w-full relative">
            <div className="sticky top-0 bg-white z-10 pb-4 -mt-2">
                <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 min-w-max">
                    {renderTabButton('all', 'Lista Movimenti')}
                    {renderTabButton('assigned', 'Punti Assegnati')}
                    {renderTabButton('redeemed', 'Premi Riscattati')}
                </div>
            </div>
            
            <div className="custom-scrollbar overflow-y-auto max-h-[60vh] scroll-mask-bottom pr-1">
                {isLoading ? <p className="text-center p-8 text-slate-400">Caricamento...</p> : (
                    activeTab === 'all' ? renderTransactionHistory(transactions) :
                    activeTab === 'assigned' ? renderTransactionHistory(assignedTransactions) : 
                    renderTransactionHistory(redeemedTransactions)
                )}
            </div>
            {txToReverse && (<Modal title="Conferma Storno" onClose={() => setTxToReverse(null)}><div className="text-gray-700"><p className="mb-4">Sei sicuro di voler stornare la transazione <span className="font-bold break-words">"{txToReverse.description}"</span>?<br/>Verrà creata una transazione correttiva.</p><div className="flex justify-end gap-3 mt-6"><Button onClick={() => setTxToReverse(null)} variant="secondary" disabled={isLoading}>Annulla</Button><Button onClick={handleConfirmReverse} variant="danger" disabled={isLoading}>Conferma Storno</Button></div></div></Modal>)}
        </div>
    )
};

const BulkAssignActionModal: React.FC<{
    onClose: () => void;
    onConfirm: (points: number, description: string) => Promise<void>;
    numSelected: number;
}> = ({ onClose, onConfirm, numSelected }) => {
     const [actions, setActions] = useState<Action[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchActions = async () => {
            const allActions = await getActions();
            setActions(allActions.filter(a => a.isEnabled));
            setIsLoading(false);
        };
        fetchActions();
    }, []);

    const handleConfirm = async () => {
        if (selectedAction) {
            setIsSubmitting(true);
            try {
                const description = selectedAction.description 
                    ? `${selectedAction.name} (${selectedAction.description})` 
                    : selectedAction.name;
                await onConfirm(selectedAction.points, description);
            } catch (error) {
                console.error("Bulk assign error:", error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="space-y-4 w-full">
            <p className="text-sm text-slate-600">
                Seleziona un'azione dall'elenco per assegnarla a <span className="font-bold text-slate-900">{numSelected} clienti</span> selezionati.
            </p>
            
            <div className="custom-scrollbar overflow-y-auto max-h-[50vh] scroll-mask-bottom space-y-2 pr-1 pb-4">
                {isLoading ? (
                    <p className="text-center p-4 text-slate-400">Caricamento azioni...</p>
                ) : actions.length > 0 ? (
                    actions.map(action => (
                        <div 
                            key={action.id} 
                            onClick={() => !isSubmitting && setSelectedAction(action)}
                            className={`flex justify-between items-center p-3 rounded-2xl border transition-all cursor-pointer ${
                                isSubmitting ? 'opacity-70 pointer-events-none' : ''
                            } ${
                                selectedAction?.id === action.id 
                                ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                                : 'bg-white border-slate-200 hover:border-indigo-200'
                            }`}
                        >
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 break-words">{action.name}</p>
                                <p className="text-xs text-slate-500 break-words">{action.description || 'Nessuna descrizione'}</p>
                            </div>
                            <span className="font-bold text-lg text-indigo-600 shrink-0 ml-4">+{action.points}</span>
                        </div>
                    ))
                ) : (
                     <p className="text-center text-slate-500 py-8">Nessuna azione disponibile.</p>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">Annulla</Button>
                <Button type="button" onClick={handleConfirm} disabled={isSubmitting || !selectedAction} className="w-full sm:w-auto">
                    {isSubmitting ? 'Assegnazione...' : 'Conferma e Assegna'}
                </Button>
            </div>
        </div>
    );
};

interface SortOption {
    label: string;
    field: string;
    direction: 'asc' | 'desc';
}

const sortOptions: SortOption[] = [
    { label: 'Recenti', field: 'creationDate', direction: 'desc' },
    { label: 'Vecchi', field: 'creationDate', direction: 'asc' },
    { label: 'A-Z Cognome', field: 'lastName', direction: 'asc' },
    { label: 'Z-A Cognome', field: 'lastName', direction: 'desc' },
    { label: 'A-Z User', field: 'username', direction: 'asc' },
    { label: 'Z-A User', field: 'username', direction: 'desc' },
    { label: 'Punti Alti', field: 'points', direction: 'desc' },
    { label: 'Punti Bassi', field: 'points', direction: 'asc' },
];

const CustomerManagement: React.FC<{onDataChange: () => void; showToast: (message: string, type?: 'success' | 'error') => void;}> = ({ onDataChange, showToast }) => {
    const [customers, setCustomers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalView, setModalView] = useState<'assign' | 'redeem' | 'history' | 'delete' | 'bulkAssign' | null>(null);
    const [showNewCredentials, setShowNewCredentials] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortOption>(sortOptions[0]);
    
    const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
    
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setIsSortDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchInitialCustomers = useCallback(async () => {
        setIsLoading(true);
        setIsSearching(false);
        setLastDoc(null);
        try {
            const { users, lastVisible } = await getCustomersPaginated(null, 50, sortConfig.field, sortConfig.direction);
            setCustomers(users);
            setLastDoc(lastVisible);
            setHasMore(!!lastVisible);
        } catch (err) {
            console.error(err);
            showToast('Errore nel caricamento clienti', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast, sortConfig]);

    useEffect(() => { 
        if (!searchTerm.trim()) {
            fetchInitialCustomers(); 
        } else {
            setIsSearching(true);
        }
    }, [fetchInitialCustomers, sortConfig]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchTerm.trim()) {
                if (isSearching) {
                    fetchInitialCustomers();
                }
                return;
            }

            setIsLoading(true);
            setIsSearching(true);
            setHasMore(false);

            try {
                let results = await searchCustomers(searchTerm);
                
                results.sort((a, b) => {
                    const fieldA = (a as any)[sortConfig.field];
                    const fieldB = (b as any)[sortConfig.field];
                    
                    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
                         if (fieldA.toLowerCase() < fieldB.toLowerCase()) return sortConfig.direction === 'asc' ? -1 : 1;
                         if (fieldA.toLowerCase() > fieldB.toLowerCase()) return sortConfig.direction === 'asc' ? 1 : -1;
                    } else {
                        if (fieldA < fieldB) return sortConfig.direction === 'asc' ? -1 : 1;
                        if (fieldA > fieldB) return sortConfig.direction === 'asc' ? 1 : -1;
                    }
                    return 0;
                });

                setCustomers(results);
            } catch (error) {
                console.error("Search error:", error);
                showToast("Errore durante la ricerca", "error");
                setCustomers([]);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, showToast, fetchInitialCustomers, isSearching, sortConfig]);

    const handleLoadMore = async () => {
        if (!lastDoc || isLoadingMore || isSearching) return;
        
        setIsLoadingMore(true);
        try {
            const { users, lastVisible } = await getCustomersPaginated(lastDoc, 50, sortConfig.field, sortConfig.direction);
            setCustomers(prev => [...prev, ...users]);
            setLastDoc(lastVisible);
            setHasMore(!!lastVisible);
        } catch (error) {
            console.error("Error loading more:", error);
            showToast('Errore caricamento altri clienti', 'error');
        } finally {
            setIsLoadingMore(false);
        }
    };
    
    const handleCreateCustomerRequest = () => {
        setIsCreateConfirmOpen(true);
    };
    
    const handleConfirmCreateCustomer = async () => {
        setIsCreating(true);
        try {
            const newUser = await createCustomer();
            setShowNewCredentials(newUser);
            if (!isSearching && sortConfig.field === 'creationDate' && sortConfig.direction === 'desc') {
                setCustomers(prev => [newUser, ...prev]);
            } else {
                fetchInitialCustomers();
            }
            onDataChange();
            showToast(`Cliente ${newUser.username} creato!`);
        } catch (error) {
            console.error("Failed to create customer:", error);
            showToast('Errore durante la creazione del cliente.', 'error');
        } finally {
            setIsCreateConfirmOpen(false);
            setIsCreating(false);
        }
    };
    
    const handleUpdateCustomer = (updatedUser: User, message: string) => {
        setCustomers(prev => prev.map(c => c.id === updatedUser.id ? updatedUser : c));
        if (selectedUser?.id === updatedUser.id) {
            setSelectedUser(updatedUser);
        }
        onDataChange();
        showToast(message);
    };

    const handleDeleteCustomer = async () => {
        if (selectedUser) {
            await deleteCustomer(selectedUser.id);
            setCustomers(prev => prev.filter(c => c.id !== selectedUser.id));
            const deletedName = selectedUser.firstName ? `${selectedUser.firstName} ${selectedUser.lastName}` : selectedUser.username;
            showToast(`Cliente ${deletedName} eliminato.`);
            closeModal();
            onDataChange();
        }
    };
    
    const handleToggleSelect = (customerId: string) => {
        setSelectedCustomerIds(prev =>
            prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
        );
    };

    const handleSelectAll = () => {
        if (selectedCustomerIds.length === customers.length) {
            setSelectedCustomerIds([]);
        } else {
            setSelectedCustomerIds(customers.map(c => c.id));
        }
    };

    const handleBulkAssign = async (points: number, description: string) => {
        const currentAdmin = getCurrentUser();
        await assignPointsToMultipleUsers(selectedCustomerIds, points, description, currentAdmin?.username);
        showToast(`${points} punti assegnati a ${selectedCustomerIds.length} clienti.`);
        const updatedIds = new Set(selectedCustomerIds);
        setCustomers(prev => prev.map(u => updatedIds.has(u.id) ? {...u, points: u.points + points} : u));
        
        onDataChange();
        setSelectedCustomerIds([]);
        closeModal();
    };

    const openModal = (view: 'assign' | 'redeem' | 'history' | 'delete' | 'bulkAssign', user: User | null = null) => {
        if(user) setSelectedUser(user);
        setModalView(view);
    };
    const closeModal = () => {
        setSelectedUser(null);
        setModalView(null);
    };

    const handleCopyNewCredentials = async () => {
        if (!showNewCredentials) return;
        const textToCopy = `Username: ${showNewCredentials.username}\nPassword: ${showNewCredentials.password}`;
        try {
            await navigator.clipboard.writeText(textToCopy);
            showToast('Credenziali copiate!', 'success');
        } catch (err) {
            console.error("Failed to copy new credentials: ", err);
            showToast("Errore durante la copia.", 'error');
        }
    };

    const getUserDisplayName = (user: User) => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        return fullName ? `${fullName} (${user.username})` : user.username;
    };

    return (
        <Card className="flex flex-col h-full w-full">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 lg:mb-4 shrink-0 relative z-30">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Elenco Clienti</h2>
                    <Button size="sm" onClick={handleCreateCustomerRequest} className="shadow-md lg:hidden">Nuovo</Button>
                </div>

                <div className="flex gap-2 w-full lg:w-auto lg:flex-1 lg:justify-end items-center">
                    <div className="relative flex-grow lg:flex-grow-0 lg:w-80 xl:w-96 transition-all duration-300">
                            <input 
                            type="search" 
                            placeholder="Cerca..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="form-input h-10 pr-10 w-full text-sm" 
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {isSearching && isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                Icons.Search
                            )}
                        </div>
                    </div>

                    <div className="relative" ref={sortDropdownRef}>
                        <button 
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                            className={`flex-shrink-0 h-10 w-10 bg-white border rounded-lg flex items-center justify-center text-slate-500 transition-colors shadow-sm active:scale-95 ${isSortDropdownOpen ? 'border-indigo-500 text-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200 hover:text-indigo-600 hover:border-indigo-200'}`}
                            title="Ordina e Filtra"
                        >
                            {Icons.Filter}
                        </button>
                        
                        {isSortDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50 origin-top-right animate-scale-in">
                                <div className="space-y-0.5">
                                    {sortOptions.map((option) => {
                                        const isSelected = sortConfig.field === option.field && sortConfig.direction === option.direction;
                                        return (
                                            <button
                                                key={`${option.field}-${option.direction}`}
                                                onClick={() => {
                                                    setSortConfig(option);
                                                    setIsSortDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between text-xs ${
                                                    isSelected 
                                                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                                                    : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <span>{option.label}</span>
                                                {isSelected && (
                                                    Icons.Check
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <Button onClick={handleCreateCustomerRequest} className="shadow-md hidden lg:flex shrink-0">Nuovo Cliente</Button>
                </div>
            </div>

            {selectedCustomerIds.length > 0 && (
                 <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 mb-4 flex items-center justify-between gap-4 animate-scale-in">
                    <span className="font-semibold text-sm text-indigo-800">{selectedCustomerIds.length} selezionati</span>
                    <div className="flex items-center gap-2">
                       <Button size="sm" onClick={() => openModal('bulkAssign')}>Assegna</Button>
                       <Button size="sm" variant="secondary" onClick={() => setSelectedCustomerIds([])}>Annulla</Button>
                    </div>
                </div>
            )}

            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar scroll-mask-bottom -mr-2 pr-2 pb-2">
                {isLoading && customers.length === 0 ? (<p className="text-center p-12 text-slate-400">Caricamento clienti...</p>) : (
                <>
                    <div className="lg:hidden space-y-3 pb-6">
                        {customers.map(customer => (
                            <div key={customer.id} className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${selectedCustomerIds.includes(customer.id) ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'}`}>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3 w-full">
                                            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={selectedCustomerIds.includes(customer.id)} onChange={() => handleToggleSelect(customer.id)} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-center mb-0.5">
                                                     <p className="font-bold text-slate-800 break-words text-base">{customer.firstName} {customer.lastName}</p>
                                                     <p className="font-bold text-indigo-600 text-lg whitespace-nowrap ml-2">{customer.points} <span className="text-[10px] font-normal text-slate-400 uppercase">pt</span></p>
                                                </div>
                                                <p className="text-xs text-slate-500 font-mono break-all bg-slate-50 inline-block px-1.5 py-0.5 rounded border border-slate-100">{customer.username}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    Dal {new Date(customer.creationDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-4 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/30">
                                    <button onClick={() => openModal('assign', customer)} className="flex flex-col items-center justify-center py-2.5 active:bg-slate-200 transition-colors group">
                                        {React.cloneElement(Icons.Assign as React.ReactElement<any>, { className: "w-3.5 h-3.5 text-slate-500 group-active:text-slate-900 mb-1 transition-colors" })}
                                        <span className="text-[9px] font-medium text-slate-500 group-active:text-slate-900 leading-none">Assegna</span>
                                    </button>
                                    
                                    <button onClick={() => openModal('redeem', customer)} className="flex flex-col items-center justify-center py-2.5 active:bg-slate-200 transition-colors group">
                                        {React.cloneElement(Icons.Redeem as React.ReactElement<any>, { className: "w-3.5 h-3.5 text-slate-500 group-active:text-slate-900 mb-1 transition-colors" })}
                                        <span className="text-[9px] font-medium text-slate-500 group-active:text-slate-900 leading-none">Riscatta</span>
                                    </button>

                                    <button onClick={() => openModal('history', customer)} className="flex flex-col items-center justify-center py-2.5 active:bg-slate-200 transition-colors group">
                                         {React.cloneElement(Icons.History as React.ReactElement<any>, { className: "w-3.5 h-3.5 text-slate-500 group-active:text-slate-900 mb-1 transition-colors" })}
                                        <span className="text-[9px] font-medium text-slate-500 group-active:text-slate-900 leading-none">Storico</span>
                                    </button>

                                    <button onClick={() => openModal('delete', customer)} className="flex flex-col items-center justify-center py-2.5 active:bg-slate-200 transition-colors group">
                                         {React.cloneElement(Icons.Delete as React.ReactElement<any>, { className: "w-3.5 h-3.5 text-slate-500 group-active:text-red-600 mb-1 transition-colors" })}
                                        <span className="text-[9px] font-medium text-slate-500 group-active:text-red-600 leading-none">Elimina</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                
                    <div className="hidden lg:block rounded-xl border border-slate-200 overflow-visible mb-6">
                        <table className="w-full text-center text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-4 w-8 border-b border-slate-200 text-center"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" onChange={handleSelectAll} checked={customers.length > 0 && selectedCustomerIds.length === customers.length} /></th>
                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 text-center">Username</th>
                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 text-center">Cognome</th>
                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 text-center">Nome</th>
                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 text-center">Punti</th>
                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 text-center">Data</th>
                                    <th className="p-4 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 w-48 text-center">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {customers.map(customer => (
                                    <tr key={customer.id} className={`transition-colors duration-200 ${selectedCustomerIds.includes(customer.id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                                        <td className="p-4 text-center"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={selectedCustomerIds.includes(customer.id)} onChange={() => handleToggleSelect(customer.id)} /></td>
                                        <td className="p-4 font-mono text-xs text-slate-600 break-all text-center">{customer.username}</td>
                                        <td className="p-4 font-medium text-slate-800 text-center">{customer.lastName || '-'}</td>
                                        <td className="p-4 font-medium text-slate-800 text-center">{customer.firstName || '-'}</td>
                                        <td className="p-4 font-bold text-indigo-600 text-center">{customer.points}</td>
                                        <td className="p-4 text-xs text-slate-500 whitespace-nowrap text-center">
                                            {new Date(customer.creationDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-60 lg:group-hover:opacity-100 transition-opacity">
                                                <Button size="md" variant="secondary" className="py-2 px-4 text-sm font-medium" onClick={() => openModal('assign', customer)}>Assegna</Button>
                                                <Button size="md" variant="secondary" className="py-2 px-4 text-sm font-medium" onClick={() => openModal('redeem', customer)}>Riscatta</Button>
                                                <button onClick={() => openModal('history', customer)} className="p-2.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Storico">
                                                    {Icons.History}
                                                </button>
                                                 <button onClick={() => openModal('delete', customer)} className="p-2.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Elimina">
                                                    {Icons.Delete}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {!isSearching && hasMore && (
                        <div className="p-4 text-center border-t border-slate-200">
                            <Button onClick={handleLoadMore} disabled={isLoadingMore} variant="secondary" size="sm" className="shadow-none border-dashed border-slate-300">
                                {isLoadingMore ? 'Caricamento...' : 'Carica altri'}
                            </Button>
                        </div>
                    )}
                </>
                )}
            </div>

            {modalView === 'assign' && selectedUser && (
                <Modal 
                    title={
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Assegna Punti a</span>
                            <span className="text-indigo-600 font-extrabold">{selectedUser.firstName} {selectedUser.lastName}</span>
                            <span className="text-slate-400 font-medium text-sm bg-slate-100 px-2 py-0.5 rounded-md font-mono">({selectedUser.username})</span>
                        </div>
                    } 
                    onClose={closeModal} 
                    size="2xl" 
                    className="h-[600px] sm:h-[700px]"
                >
                    <AssignPointsModal user={selectedUser} onClose={closeModal} onUpdate={handleUpdateCustomer} />
                </Modal>
            )}

            {modalView === 'redeem' && selectedUser && (
                <Modal 
                    title={
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Riscatta Premio per</span>
                            <span className="text-indigo-600 font-extrabold">{selectedUser.firstName} {selectedUser.lastName}</span>
                            <span className="text-slate-400 font-medium text-sm bg-slate-100 px-2 py-0.5 rounded-md font-mono">({selectedUser.username})</span>
                        </div>
                    }
                    onClose={closeModal} 
                    size="2xl" 
                    className="h-[600px] sm:h-[700px]"
                >
                    <RedeemPrizeModal user={selectedUser} onClose={closeModal} onUpdate={handleUpdateCustomer} />
                </Modal>
            )}

            {modalView === 'history' && selectedUser && (
                <Modal 
                    title={
                         <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Storico:</span>
                            <span className="text-indigo-600 font-extrabold">{selectedUser.firstName} {selectedUser.lastName}</span>
                            <span className="text-slate-400 font-medium text-sm bg-slate-100 px-2 py-0.5 rounded-md font-mono">({selectedUser.username})</span>
                        </div>
                    }
                    onClose={closeModal} 
                    size="2xl" 
                    className="h-[600px] sm:h-[700px]"
                >
                    <HistoryModal user={selectedUser} onClose={closeModal} onUpdate={handleUpdateCustomer} />
                </Modal>
            )}
            
            {modalView === 'bulkAssign' && (
                <Modal title="Assegnazione Multipla" onClose={closeModal} size="lg">
                    <BulkAssignActionModal 
                        numSelected={selectedCustomerIds.length} 
                        onClose={closeModal} 
                        onConfirm={handleBulkAssign} 
                    />
                </Modal>
            )}

            {modalView === 'delete' && selectedUser && (
                <Modal title="Elimina Cliente" onClose={closeModal} size="md">
                    <div className="text-gray-700 w-full">
                        <p className="mb-4 break-words">Sei sicuro di voler eliminare l'utente <span className="font-bold">{selectedUser.username}</span>?</p>
                        <p className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                            Attenzione: Questa azione eliminerà anche tutto lo storico punti e non può essere annullata.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                            <Button variant="secondary" onClick={closeModal} className="w-full sm:w-auto">Annulla</Button>
                            <Button variant="danger" onClick={handleDeleteCustomer} className="w-full sm:w-auto">Conferma Eliminazione</Button>
                        </div>
                    </div>
                </Modal>
            )}
            
            {showNewCredentials && (
                <Modal title="Nuovo Cliente Creato" onClose={() => setShowNewCredentials(null)} size="lg">
                    <div className="text-center space-y-4 w-full">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                            <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            </div>
                            <p className="text-emerald-900 font-semibold mb-4">Cliente creato con successo!</p>
                            <div className="text-left bg-white p-4 rounded-xl border border-emerald-100 shadow-sm space-y-3 overflow-hidden">
                                <p className="truncate flex justify-between items-center"><span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Username</span> <span className="font-mono text-lg font-bold text-slate-800 select-all">{showNewCredentials.username}</span></p>
                                <div className="border-t border-emerald-50"></div>
                                <p className="break-all flex justify-between items-center"><span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Password</span> <span className="font-mono text-lg font-bold text-indigo-600 select-all">{showNewCredentials.password}</span></p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500">Condividi queste credenziali con il cliente. Potrà cambiarle al primo accesso.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-slate-100">
                            <Button onClick={handleCopyNewCredentials} variant="secondary" className="w-full sm:w-auto">Copia Credenziali</Button>
                            <Button onClick={() => setShowNewCredentials(null)} className="w-full sm:w-auto">Chiudi</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {isCreateConfirmOpen && (
                 <Modal title="Nuovo Cliente" onClose={() => setIsCreateConfirmOpen(false)} size="md">
                    <div className="flex flex-col items-center text-center w-full py-6 px-2">
                        <div className="bg-indigo-50 p-4 rounded-full mb-5 ring-1 ring-indigo-100">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Confermi la creazione?</h3>
                        <p className="text-slate-500 text-sm max-w-xs mb-8 leading-relaxed">
                            Verrà creato un nuovo profilo cliente con Username e Password generati automaticamente.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full border-t border-slate-100 pt-6">
                            <Button variant="secondary" onClick={() => setIsCreateConfirmOpen(false)} disabled={isCreating} className="w-full sm:w-auto min-w-[120px]">
                                Annulla
                            </Button>
                            <Button onClick={handleConfirmCreateCustomer} disabled={isCreating} className="w-full sm:w-auto min-w-[140px] shadow-lg shadow-indigo-200/50">
                                {isCreating ? 'Creazione...' : 'Crea Cliente'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </Card>
    );
};

export default CustomerManagement;
