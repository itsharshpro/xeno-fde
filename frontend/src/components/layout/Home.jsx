import React, { useState, useEffect, useCallback } from 'react';
import { shopifyAPI } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth';
import Dashboard from '../dashboard/Dashboard';
import ConnectStore from '../dashboard/ConnectStore';
import LoadingSpinner from '../common/LoadingSpinner';

const Home = () => {
    const [hasStore, setHasStore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const checkStoreStatus = useCallback(async () => {
        if (!user?.tenantId) return;
        
        setIsLoading(true);
        try {
            const stores = await shopifyAPI.getStores(user.tenantId);
            setHasStore(stores.length > 0);
        } catch (error) {
            console.error("Error checking store status", error);
            setHasStore(false);
        } finally {
            setIsLoading(false);
        }
    }, [user?.tenantId]);

    useEffect(() => {
        checkStoreStatus();
    }, [checkStoreStatus]);

    if (isLoading) {
        return <LoadingSpinner message="Checking store connection..." />;
    }

    return hasStore ? (
        <Dashboard />
    ) : (
        <ConnectStore onConnectSuccess={checkStoreStatus} />
    );
};

export default Home;
