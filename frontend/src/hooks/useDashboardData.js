import { useState, useEffect, useCallback } from 'react';
import { metricsAPI } from '../services/apiService';
import { useAuth } from './useAuth';

export const useDashboardData = (startDate, endDate) => {
    const { user } = useAuth();
    const [data, setData] = useState({
        summary: null,
        revenueData: null,
        topCustomers: [],
        advancedMetrics: null,
        revenueTrends: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatRevenueData = useCallback((revenueRes) => {
        return {
            labels: revenueRes.map(d => d.date),
            datasets: [
                {
                    label: 'Daily Revenue ($)',
                    data: revenueRes.map(d => d.revenue),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Orders Count',
                    data: revenueRes.map(d => d.orders),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    yAxisID: 'y1',
                    type: 'line'
                }
            ]
        };
    }, []);

    const fetchData = useCallback(async () => {
        if (!user?.tenantId) return;

        setLoading(true);
        setError(null);

        const dateParams = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };

        try {
            const [summaryRes, revenueRes, topCustomersRes, advancedRes, trendsRes] = await Promise.all([
                metricsAPI.getSummary(user.tenantId, dateParams),
                metricsAPI.getRevenueOverTime(user.tenantId, dateParams),
                metricsAPI.getTopCustomers(user.tenantId, dateParams),
                metricsAPI.getAdvancedMetrics(user.tenantId, dateParams),
                metricsAPI.getRevenueTrends(user.tenantId, dateParams)
            ]);

            setData({
                summary: summaryRes,
                revenueData: formatRevenueData(revenueRes),
                topCustomers: topCustomersRes,
                advancedMetrics: advancedRes,
                revenueTrends: trendsRes
            });
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    }, [user?.tenantId, startDate, endDate, formatRevenueData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        ...data,
        loading,
        error,
        refetch: fetchData
    };
};
