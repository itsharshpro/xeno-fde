import React from 'react';
import { Line } from 'react-chartjs-2';
import { getCustomerGrowthChartData, getChartOptions } from '../../../utils/chartConfig';

const CustomerGrowthChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-black p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Customer Growth</h3>
                <div className="h-72 bg-gray-100 rounded animate-pulse"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-black p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Customer Growth</h3>
                <p className="text-gray-500 text-center py-8">No customer growth data available</p>
            </div>
        );
    }

    const chartData = getCustomerGrowthChartData(data);
    const options = getChartOptions('New Customers per Day', false);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-black p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Customer Growth</h3>
            <div className="h-72">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default CustomerGrowthChart;
