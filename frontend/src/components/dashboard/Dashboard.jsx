import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

import { useDashboardData } from '../../hooks/useDashboardData';
import DashboardHeader from './DashboardHeader';
import DateFilter from './DateFilter';
import MetricCards from './MetricCards';
import RevenueChart from './charts/RevenueChart';
import CustomerGrowthChart from './charts/CustomerGrowthChart';
import PeakHoursChart from './charts/PeakHoursChart';
import TopCustomersList from './TopCustomersList';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

const Dashboard = () => {
    const [startDate, setStartDate] = useState(
        new Date(new Date().setDate(new Date().getDate() - 30))
    );
    const [endDate, setEndDate] = useState(new Date());

    const {
        summary,
        revenueData,
        topCustomers,
        advancedMetrics,
        revenueTrends,
        loading,
        error,
        refetch
    } = useDashboardData(startDate, endDate);

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-sm border border-black p-8 max-w-md w-full">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading dashboard</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader
                summary={summary}
                advancedMetrics={advancedMetrics}
                revenueTrends={revenueTrends}
                revenueData={revenueData}
                topCustomers={topCustomers}
                loading={loading}
                onRefreshComplete={refetch}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <DateFilter
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />

                <MetricCards
                    summary={summary}
                    advancedMetrics={advancedMetrics}
                    revenueTrends={revenueTrends}
                    loading={loading}
                />

                {/* Revenue Chart - Full Width */}
                <div className="mb-6">
                    <RevenueChart data={revenueData} loading={loading} />
                </div>

                {/* Other Charts - Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <CustomerGrowthChart
                        data={advancedMetrics?.customerGrowth}
                        loading={loading}
                    />

                    <PeakHoursChart
                        data={advancedMetrics?.peakOrderHours}
                        loading={loading}
                    />

                    <TopCustomersList customers={topCustomers} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
