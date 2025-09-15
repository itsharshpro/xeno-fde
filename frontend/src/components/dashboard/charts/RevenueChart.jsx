import React from 'react';
import { Line } from 'react-chartjs-2';
import { getRevenueChartOptions } from '../../../utils/chartConfig';

const RevenueChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-black p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Revenue & Orders Timeline</h3>
                <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-black p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Revenue & Orders Timeline</h3>
            <div className="h-80">
                <Line 
                    data={data || { labels: [], datasets: [] }} 
                    options={getRevenueChartOptions()} 
                />
            </div>
        </div>
    );
};

export default RevenueChart;
