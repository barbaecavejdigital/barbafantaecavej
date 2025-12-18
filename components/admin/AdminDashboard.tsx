
import React, { useState, useCallback } from 'react';
import CustomerManagement from './CustomerManagement';
import SettingsManagement from './SettingsManagement';
import AdminOverview from './AdminOverview';
import { User } from '../../types';

interface AdminDashboardProps {
    user: User;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, showToast }) => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState<'customers' | 'actions' | 'heating' | 'prizes' | 'regulations'>('customers');

    const handleDataChange = useCallback(() => {
        setRefreshKey(prevKey => prevKey + 1);
    }, []);
    
    const renderTabButton = (tabName: 'customers' | 'actions' | 'heating' | 'prizes' | 'regulations', label: string) => {
        const isActive = activeTab === tabName;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`
                    flex-none snap-center py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap
                    ${isActive
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-700'
                    }
                `}
                aria-current={isActive ? 'page' : undefined}
            >
                {label}
            </button>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'customers':
                return (
                    <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8 h-full">
                        {/* Mobile Stats - Reduced visual weight */}
                        <div className="lg:hidden space-y-2 mb-2 flex-shrink-0">
                            <AdminOverview refreshKey={refreshKey} show="stats-mobile" />
                        </div>
                        
                        {/* Mobile: CustomerManagement takes remaining height. Desktop: Grid layout */}
                        <div className="flex-1 min-h-0 lg:h-full lg:block lg:col-span-2">
                            <CustomerManagement onDataChange={handleDataChange} showToast={showToast} />
                        </div>
                        
                        <div className="hidden lg:block lg:col-span-1 h-full min-h-0">
                            <AdminOverview refreshKey={refreshKey} show="stats-desktop" />
                        </div>
                    </div>
                );
            case 'actions':
                return <SettingsManagement onDataChange={handleDataChange} showToast={showToast} view="actions" />;
            case 'heating':
                return <SettingsManagement onDataChange={handleDataChange} showToast={showToast} view="heating" />;
            case 'prizes':
                return <SettingsManagement onDataChange={handleDataChange} showToast={showToast} view="prizes" />;
            case 'regulations':
                return <SettingsManagement onDataChange={handleDataChange} showToast={showToast} view="regulations" />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[#F2F2F7]">
            {/* Header Area - FIXED */}
            <div className="p-4 sm:p-6 lg:p-8 pb-0 flex-shrink-0 z-20 bg-[#F2F2F7]">
                <header className="mb-2 sm:mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight hidden sm:block">Panoramica</h1>
                        <p className="text-slate-500 mt-1 hidden sm:block">Gestisci clienti, punti e configurazioni.</p>
                    </div>
                </header>

                <div className="sticky top-0 z-10 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {/* Segmented Control Container */}
                    <div className="bg-slate-200/60 p-1 rounded-xl flex space-x-1 overflow-x-auto hide-scrollbar snap-x">
                        {renderTabButton('customers', 'Clienti')}
                        {renderTabButton('actions', 'Azioni')}
                        {renderTabButton('heating', 'Riscaldamento')}
                        {renderTabButton('prizes', 'Premi')}
                        {renderTabButton('regulations', 'Regole')}
                    </div>
                </div>
            </div>

            {/* Content Area - FIXED CONTAINER, children handle scroll */}
            <div className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 pt-0 pb-[90px] lg:pb-12 relative overflow-hidden flex flex-col">
                 <div className="h-full w-full animate-slide-up max-w-[1920px] mx-auto flex flex-col">
                    {renderTabContent()}
                 </div>
            </div>

            {/* Mobile Bottom Sliding Panel - FIXED OVERLAY */}
            <div className="lg:hidden">
                <AdminOverview refreshKey={refreshKey} show="recent" isStickyFooter={true} />
            </div>
        </div>
    );
};

export default AdminDashboard;
