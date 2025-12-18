import React, { useState } from 'react';
import { User } from '../../types';
import { updateUser } from '../../services/dataService';
import Button from '../shared/Button';
import Card from '../shared/Card';
import { APP_TITLE } from '../../constants';

interface InitialSetupProps {
    user: User;
    onComplete: (user: User) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ user, onComplete, showToast }) => {
    const [firstName, setFirstName] = useState(user.firstName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        setIsLoading(true);
        try {
            const updatedUserData: User = {
                ...user,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                isInitialLogin: false,
            };
            
            // By not including 'password', it won't be changed in Firestore due to merge:true
            const updatedUser = await updateUser(updatedUserData);
            showToast('Setup completato con successo!', 'success');
            onComplete(updatedUser);

        } catch (err) {
            console.error(err);
            setError('Si è verificato un errore durante l\'aggiornamento.');
            showToast('Errore durante il salvataggio.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-[#f2f2f7]">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8 animate-fade-in-slide-up">
                    <h1 className="text-3xl font-bold text-gray-800">Benvenuto/a in {APP_TITLE}!</h1>
                    <p className="text-gray-500 mt-2">Completa la configurazione del tuo account.</p>
                </div>
                <Card className="animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center text-sm">{error}</p>}
                        
                        <p className="text-sm text-gray-600">Il tuo username è: <strong className="font-mono p-1.5 bg-gray-100 rounded-md text-indigo-600 text-xs">{user.username}</strong></p>
                        <p className="text-sm text-gray-500">Usa la password che ti è stata fornita per i futuri accessi.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                             <div>
                                <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="firstName">
                                    Nome
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="form-input"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="lastName">
                                    Cognome
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="form-input"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <Button type="submit" fullWidth disabled={isLoading} size="lg">
                                {isLoading ? 'Salvataggio...' : 'Completa e Accedi'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default InitialSetup;