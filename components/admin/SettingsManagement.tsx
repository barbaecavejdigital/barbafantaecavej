
import React, { useState, useEffect, useCallback } from 'react';
import { Action, Prize, HeatingAction } from '../../types';
import {
    getActions,
    createOrUpdateAction,
    deleteAction,
    getPrizes,
    createOrUpdatePrize,
    deletePrize,
    getRegulations,
    saveRegulations,
    getHeatingActions,
    createOrUpdateHeatingAction,
} from '../../services/dataService';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Modal from '../shared/Modal';

// Shared Icons for consistency
const Icons = {
    Pencil: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>,
    Trash: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>,
    Plus: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
    Bolt: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
    Gift: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>
};

interface SettingsManagementProps {
    onDataChange: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    view?: 'actions' | 'prizes' | 'regulations' | 'heating' | 'all';
}

const ToggleSwitch: React.FC<{ isEnabled: boolean; onToggle: () => void }> = ({ isEnabled, onToggle }) => (
    <button
        type="button"
        onClick={onToggle}
        className={`${
            isEnabled ? 'bg-indigo-500' : 'bg-slate-300'
        } relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        role="switch"
        aria-checked={isEnabled}
        aria-label="Abilita/Disabilita"
    >
        <span
            aria-hidden="true"
            className={`${
                isEnabled ? 'translate-x-4' : 'translate-x-0'
            } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const ActionFormModal: React.FC<{
    action: Action | null;
    onClose: () => void;
    onSave: (action: Partial<Action>) => void;
}> = ({ action, onClose, onSave }) => {
    const [name, setName] = useState(action?.name || '');
    const [points, setPoints] = useState(action?.points?.toString() || '');
    const [description, setDescription] = useState(action?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: action?.id, name, points: Number(points) || 0, description });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                    <label htmlFor="actionName" className="block text-sm font-bold text-slate-800 mb-2">
                        Nome Azione <span className="text-red-500">*</span>
                    </label>
                    <input id="actionName" type="text" value={name} onChange={e => setName(e.target.value)} required className="form-input font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400" placeholder="Es. Taglio Uomo" />
                </div>
                <div>
                     <label htmlFor="actionPoints" className="block text-sm font-bold text-slate-800 mb-2">
                        Punti <span className="text-red-500">*</span>
                    </label>
                    <input id="actionPoints" type="text" inputMode="numeric" value={points} onChange={e => setPoints(e.target.value.replace(/\D/g, ''))} required className="form-input font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400" placeholder="20" />
                </div>
                <div className="sm:col-span-3">
                    <label htmlFor="actionDescription" className="block text-sm font-bold text-slate-800 mb-2">Descrizione</label>
                    <input id="actionDescription" type="text" value={description} onChange={e => setDescription(e.target.value)} required className="form-input font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400" placeholder="Breve descrizione dell'azione..." />
                    <p className="text-xs text-slate-500 font-medium mt-1.5 ml-1">Questa descrizione apparirà nel riepilogo per il cliente.</p>
                </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                <Button type="button" variant="secondary" onClick={onClose} size="lg">Annulla</Button>
                <Button type="submit" size="lg" className="min-w-[140px]">Salva Azione</Button>
            </div>
        </form>
    );
};

const PrizeFormModal: React.FC<{
    prize: Prize | null;
    onClose: () => void;
    onSave: (prize: Omit<Prize, 'id'> & { id?: string }) => void;
}> = ({ prize, onClose, onSave }) => {
    const [name, setName] = useState(prize?.name || '');
    const [pointsRequired, setPointsRequired] = useState(prize?.pointsRequired?.toString() || '');
    const [description, setDescription] = useState(prize?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: prize?.id, name, pointsRequired: Number(pointsRequired) || 0, description });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                    <label htmlFor="prizeName" className="block text-sm font-bold text-slate-800 mb-2">
                        Nome Premio <span className="text-red-500">*</span>
                    </label>
                    <input id="prizeName" type="text" value={name} onChange={e => setName(e.target.value)} required className="form-input font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400" placeholder="Es. Caffè Gratuito" />
                </div>
                <div>
                    <label htmlFor="prizePoints" className="block text-sm font-bold text-slate-800 mb-2">
                        Costo Punti <span className="text-red-500">*</span>
                    </label>
                    <input id="prizePoints" type="text" inputMode="numeric" value={pointsRequired} onChange={e => setPointsRequired(e.target.value.replace(/\D/g, ''))} required className="form-input font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400" placeholder="100" />
                </div>
                <div className="sm:col-span-3">
                    <label htmlFor="prizeDescription" className="block text-sm font-bold text-slate-800 mb-2">Descrizione</label>
                    <input id="prizeDescription" type="text" value={description} onChange={e => setDescription(e.target.value)} required className="form-input font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400" placeholder="Dettagli del premio..." />
                </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                <Button type="button" variant="secondary" onClick={onClose} size="lg">Annulla</Button>
                <Button type="submit" size="lg" className="min-w-[140px]">Salva Premio</Button>
            </div>
        </form>
    );
};

const HeatingActionFormModal: React.FC<{
    action: HeatingAction;
    onClose: () => void;
    onSave: (action: Partial<HeatingAction>) => void;
}> = ({ action, onClose, onSave }) => {
     const [name, setName] = useState(action.name);
    const [points, setPoints] = useState(action.points.toString());
    const [description, setDescription] = useState(action.description);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: action.id, name, points: Number(points) || 0, description });
        onClose();
    };
    
    return (
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-xl text-sm font-medium border border-indigo-100 text-indigo-900 flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                 <p>Stai modificando l'azione per lo <span className="font-bold">Slot #{action.slot}</span>. Le modifiche saranno visibili a tutti i nuovi clienti.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <div className="sm:col-span-2">
                    <label htmlFor="actionName" className="block text-sm font-bold text-slate-800 mb-2">Nome Azione <span className="text-red-500">*</span></label>
                    <input id="actionName" type="text" value={name} onChange={e => setName(e.target.value)} required className="form-input font-medium text-slate-900" />
                </div>
                <div>
                    <label htmlFor="actionPoints" className="block text-sm font-bold text-slate-800 mb-2">Punti <span className="text-red-500">*</span></label>
                    <input id="actionPoints" type="text" inputMode="numeric" value={points} onChange={e => setPoints(e.target.value.replace(/\D/g, ''))} required className="form-input font-bold text-slate-900" />
                </div>
                <div className="sm:col-span-3">
                    <label htmlFor="actionDescription" className="block text-sm font-bold text-slate-800 mb-2">Descrizione</label>
                    <input id="actionDescription" type="text" value={description} onChange={e => setDescription(e.target.value)} required className="form-input font-medium text-slate-900" />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                <Button type="button" variant="secondary" onClick={onClose} size="lg">Annulla</Button>
                <Button type="submit" size="lg" className="min-w-[140px]">Salva Modifiche</Button>
            </div>
        </form>
    );
};

const SettingsManagement: React.FC<SettingsManagementProps> = ({ onDataChange, showToast, view = 'all' }) => {
    const [actions, setActions] = useState<Action[]>([]);
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [heatingActions, setHeatingActions] = useState<HeatingAction[]>([]);
    const [regulations, setRegulations] = useState('');
    const [originalRegulations, setOriginalRegulations] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const [modalView, setModalView] = useState<'editAction' | 'newAction' | 'editPrize' | 'newPrize' | 'editHeating' | null>(null);
    const [selectedItem, setSelectedItem] = useState<Action | Prize | HeatingAction | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'action' | 'prize', id: string, name: string } | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [actionsData, prizesData, regulationsData, heatingActionsData] = await Promise.all([
                getActions(), getPrizes(), getRegulations(), getHeatingActions()
            ]);
            setActions(actionsData);
            setPrizes(prizesData);
            setRegulations(regulationsData);
            setOriginalRegulations(regulationsData);
            setHeatingActions(heatingActionsData);
        } catch (error) {
            console.error("Failed to load settings data:", error);
            showToast("Errore nel caricamento delle impostazioni.", 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveAction = async (actionData: Partial<Action>) => {
        try {
            await createOrUpdateAction(actionData);
            showToast('Azione salvata con successo.');
            onDataChange();
            fetchData();
        } catch (error) {
            showToast('Errore nel salvataggio dell\'azione.', 'error');
        }
    };
    
    const handleSaveHeatingAction = async (actionData: Partial<HeatingAction>) => {
        try {
            await createOrUpdateHeatingAction(actionData);
            showToast('Azione Primi Passi salvata.');
            onDataChange();
            fetchData();
        } catch (error) {
            showToast('Errore nel salvataggio dell\'azione.', 'error');
        }
    };

    const handleToggleAction = async (action: Action) => {
        const updatedAction = { ...action, isEnabled: !action.isEnabled };
        try {
            await createOrUpdateAction(updatedAction);
            showToast(`Azione "${action.name}" ${updatedAction.isEnabled ? 'abilitata' : 'disabilitata'}.`);
            setActions(prevActions => 
                prevActions.map(a => a.id === action.id ? updatedAction : a)
            );
            onDataChange();
        } catch (error) {
            showToast('Errore durante l\'aggiornamento dell\'azione.', 'error');
            console.error("Failed to toggle action:", error);
        }
    };

    const handleSavePrize = async (prizeData: Omit<Prize, 'id'> & { id?: string }) => {
        try {
            await createOrUpdatePrize(prizeData);
            showToast('Premio salvato con successo.');
            onDataChange();
            fetchData();
        } catch (error) {
            showToast('Errore nel salvataggio del premio.', 'error');
        }
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (itemToDelete.type === 'action') {
                await deleteAction(itemToDelete.id);
                showToast('Azione eliminata con successo.');
            } else {
                await deletePrize(itemToDelete.id);
                showToast('Premio eliminato con successo.');
            }
            onDataChange();
            fetchData();
        } catch (error) {
            showToast('Errore durante l\'eliminazione.', 'error');
        } finally {
            setItemToDelete(null);
        }
    };

    const handleSaveRegulations = async () => {
        try {
            await saveRegulations(regulations);
            setOriginalRegulations(regulations);
            showToast('Regolamento salvato con successo.');
        } catch (error) {
            showToast('Errore nel salvataggio del regolamento.', 'error');
        }
    };

    const openModal = (view: 'editAction' | 'newAction' | 'editPrize' | 'newPrize' | 'editHeating', item: Action | Prize | HeatingAction | null = null) => {
        setSelectedItem(item);
        setModalView(view);
    };
    const closeModal = () => {
        setModalView(null);
        setSelectedItem(null);
    };

    if(isLoading) {
        return <Card className="flex items-center justify-center py-20 h-full"><p className="text-slate-500 font-medium">Caricamento impostazioni...</p></Card>
    }

    const actionsSection = (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Azioni che danno punti</h3>
                <Button size="sm" onClick={() => openModal('newAction')}>
                    {Icons.Plus} Aggiungi
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
                {actions.map(action => (
                    <div key={action.id} className={`p-4 bg-white border rounded-xl flex items-center gap-3 transition-all shadow-sm group relative overflow-hidden ${action.isEnabled ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-100 bg-slate-50 opacity-75'}`}>
                        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${action.isEnabled ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {Icons.Bolt}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="font-bold text-slate-800 truncate text-sm">{action.name}</p>
                            <p className="text-xs text-slate-500 truncate leading-relaxed">{action.description || 'Nessuna descrizione'}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-1">
                            <div className={`text-right hidden sm:block mr-1`}>
                                <span className={`font-bold text-sm ${action.isEnabled ? 'text-indigo-600' : 'text-slate-400'}`}>+{action.points}</span>
                            </div>
                            
                            <div className="h-6 w-px bg-slate-100 mx-1 hidden sm:block"></div>

                            <ToggleSwitch isEnabled={action.isEnabled} onToggle={() => handleToggleAction(action)} />
                            
                            <div className="flex gap-1 ml-1">
                                <button onClick={() => openModal('editAction', action)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Modifica">
                                     {Icons.Pencil}
                                </button>
                                <button onClick={() => setItemToDelete({type: 'action', id: action.id, name: action.name})} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Elimina">
                                    {Icons.Trash}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {actions.length === 0 && (
                <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                    <p className="font-semibold text-slate-600 text-sm">Nessuna azione definita</p>
                </div>
            )}
        </section>
    );
    
    const heatingSection = (
        <section>
            <div className="mb-4">
                 <h3 className="text-lg font-bold text-slate-800 tracking-tight">Primi Passi</h3>
                 <div className="mt-3 bg-indigo-50 text-indigo-900 text-xs p-3 rounded-xl border border-indigo-100 flex gap-3 items-start leading-relaxed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="opacity-90">10 azioni uniche per incentivare i nuovi clienti. Non possono essere eliminate, ma solo modificate.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
                 {heatingActions.map(action => (
                    <div key={action.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-indigo-300 transition-colors shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm border border-indigo-100">
                            {action.slot}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="font-bold text-slate-800 truncate text-sm">{action.name}</p>
                            <p className="text-xs text-slate-500 truncate leading-relaxed">{action.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-1">
                             <div className="text-right hidden sm:block mr-2">
                                <span className="font-bold text-sm text-indigo-600">+{action.points}</span>
                            </div>
                             <div className="h-6 w-px bg-slate-100 mx-1 hidden sm:block"></div>
                            <button onClick={() => openModal('editHeating', action)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Modifica">
                                {Icons.Pencil}
                            </button>
                        </div>
                    </div>
                 ))}
            </div>
        </section>
    );

    const prizesSection = (
         <section>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Premi Riscattabili</h3>
                <Button size="sm" onClick={() => openModal('newPrize')}>
                     {Icons.Plus} Aggiungi
                </Button>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
                {prizes.map(prize => (
                    <div key={prize.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:border-indigo-300 transition-colors shadow-sm group">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm border border-indigo-100">
                             {Icons.Gift}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="font-bold text-slate-900 truncate text-sm">{prize.name}</p>
                            <p className="text-xs text-slate-500 truncate leading-relaxed">{prize.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-1">
                            <div className="text-right hidden sm:block mr-2">
                                <span className="font-bold text-sm text-indigo-600">{prize.pointsRequired} pt</span>
                            </div>
                            <div className="h-6 w-px bg-slate-100 mx-1 hidden sm:block"></div>
                            <div className="flex gap-1">
                                <button onClick={() => openModal('editPrize', prize)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Modifica">
                                     {Icons.Pencil}
                                </button>
                                <button onClick={() => setItemToDelete({type: 'prize', id: prize.id, name: prize.name})} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Elimina">
                                    {Icons.Trash}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {prizes.length === 0 && (
                 <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                    <p className="font-semibold text-slate-600 text-sm">Nessun premio definito</p>
                </div>
            )}
        </section>
    );

    const regulationsSection = (
         <div className="flex flex-col h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4 shrink-0 tracking-tight">Regolamento Programma</h3>
            <div className="flex-1 min-h-0 relative">
                <textarea
                    value={regulations}
                    onChange={(e) => setRegulations(e.target.value)}
                    className="form-input w-full h-full resize-none p-4 leading-relaxed text-sm absolute inset-0 rounded-2xl border-slate-200 focus:border-indigo-500 scroll-mask-bottom"
                    placeholder="Inserisci qui il regolamento..."
                />
            </div>
            <div className="pt-4 shrink-0 bg-[#F2F2F7] lg:bg-white z-10">
                <Button fullWidth onClick={handleSaveRegulations} disabled={regulations === originalRegulations}>Salva Regolamento</Button>
            </div>
        </div>
    );
    
    const modals = (
        <>
            {(modalView === 'newAction' || modalView === 'editAction') && (
                <Modal title={modalView === 'newAction' ? 'Nuova Azione' : 'Modifica Azione'} onClose={closeModal} size="xl">
                    <ActionFormModal action={selectedItem as Action | null} onClose={closeModal} onSave={handleSaveAction} />
                </Modal>
            )}

            {(modalView === 'newPrize' || modalView === 'editPrize') && (
                <Modal title={modalView === 'newPrize' ? 'Nuovo Premio' : 'Modifica Premio'} onClose={closeModal} size="xl">
                    <PrizeFormModal prize={selectedItem as Prize | null} onClose={closeModal} onSave={handleSavePrize} />
                </Modal>
            )}

            {modalView === 'editHeating' && selectedItem && (
                <Modal title={`Modifica Azione Slot #${(selectedItem as HeatingAction).slot}`} onClose={closeModal} size="xl">
                    <HeatingActionFormModal action={selectedItem as HeatingAction} onClose={closeModal} onSave={handleSaveHeatingAction} />
                </Modal>
            )}

            {itemToDelete && (
                <Modal title="Conferma Eliminazione" onClose={() => setItemToDelete(null)} size="md">
                    <div className="text-slate-700">
                        <p className="text-lg mb-2">Sei sicuro di voler eliminare <span className="font-bold">"{itemToDelete.name}"</span>?</p>
                        <p className="text-sm text-slate-500">Questa azione non può essere annullata.</p>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setItemToDelete(null)}>Annulla</Button>
                            <Button variant="danger" onClick={handleConfirmDelete}>Conferma Elimina</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );

    if (view === 'actions') {
        return (
            <Card className="flex flex-col h-full w-full">
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-mask-bottom pr-1 pb-2">
                    {actionsSection}
                </div>
                {modals}
            </Card>
        );
    }
    if (view === 'prizes') {
        return (
            <Card className="flex flex-col h-full w-full">
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-mask-bottom pr-1 pb-2">
                    {prizesSection}
                </div>
                {modals}
            </Card>
        );
    }
    if (view === 'heating') {
        return (
            <Card className="flex flex-col h-full w-full">
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-mask-bottom pr-1 pb-2">
                    {heatingSection}
                </div>
                {modals}
            </Card>
        );
    }
    if (view === 'regulations') {
        return (
            <Card className="flex flex-col h-full w-full overflow-hidden">
                 {regulationsSection}
                 {modals}
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-full w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 shrink-0 tracking-tight">Impostazioni</h2>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-mask-bottom pr-2 pb-2">
                <div className="space-y-10">
                    {actionsSection}
                    <div className="border-b border-slate-100"></div>
                    {heatingSection}
                    <div className="border-b border-slate-100"></div>
                    {prizesSection}
                    <div className="border-b border-slate-100"></div>
                    {regulationsSection}
                </div>
            </div>
            
            {modals}
        </Card>
    );
};

export default SettingsManagement;
