import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { exportSummaryToCSV, exportCustomersToCSV, exportRevenueDataToCSV } from '../../utils/exportUtils';
import { shopifyAPI } from '../../services/apiService';

const DashboardHeader = ({ summary, advancedMetrics, revenueTrends, revenueData, topCustomers, loading, onRefreshComplete }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowExportDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleRefresh = async () => {
        if (isRefreshing) return;
        
        setIsRefreshing(true);
        try {
            // Get the first store for this tenant
            const stores = await shopifyAPI.getStores(user.tenantId);
            if (stores.length > 0) {
                await shopifyAPI.syncStoreData(stores[0].id);
                if (onRefreshComplete) {
                    onRefreshComplete();
                }
            }
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleConnectStore = () => {
        navigate('/connect-store');
    };

    return (
        <header className="bg-white shadow-sm border-b border-black p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                    <h1 className="text-3xl font-bold text-black mb-2">
                        Welcome, {user?.name || 'User'}!
                    </h1>
                </div>
                
                <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                    <div className="flex justify-center items-center gap-4">
                        {/* Refresh Button with Icon */}
                        <button 
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium bg-black text-white border border-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={handleRefresh}
                            disabled={loading || isRefreshing}
                            title="Refresh data from Shopify"
                        >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                        
                        {/* Connect Store Button */}
                        <button 
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium bg-white text-black border border-black rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={handleConnectStore}
                            disabled={loading}
                            title="Connect different store"
                        >
                            Connect Store
                        </button>
                        
                        {/* Export Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                className="flex items-center justify-center px-4 py-2 text-sm font-medium bg-white text-black border border-black rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={() => setShowExportDropdown(!showExportDropdown)}
                                disabled={loading}
                                title="Export data options"
                            >
                                Export Data
                                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            {showExportDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-black rounded-md shadow-lg z-10">
                                    <div className="py-1">
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                                            style={{ backgroundColor: 'white', border: 'none', color: 'black', textAlign: 'center', fontWeight: 'bold'  }}
                                            onClick={() => {
                                                exportSummaryToCSV(summary, advancedMetrics, revenueTrends);
                                                setShowExportDropdown(false);
                                            }}
                                            disabled={loading}
                                        >
                                            Export Summary
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                                            style={{ backgroundColor: 'white', border: 'none', color: 'black', textAlign: 'center', fontWeight: 'bold' }}
                                            onClick={() => {
                                                exportRevenueDataToCSV(revenueData);
                                                setShowExportDropdown(false);
                                            }}
                                            disabled={loading || !revenueData}
                                        >
                                            Export Revenue Data
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                                            style={{ backgroundColor: 'white', border: 'none', color: 'black', textAlign: 'center', fontWeight: 'bold' }}
                                            onClick={() => {
                                                exportCustomersToCSV(topCustomers);
                                                setShowExportDropdown(false);
                                            }}
                                            disabled={loading || topCustomers.length === 0}
                                        >
                                            Export Customers
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button 
                            className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 transition-colors"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
