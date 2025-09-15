import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { getPeakHoursChartData, getChartOptions } from '../../../utils/chartConfig';

const PeakHoursChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-black p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Peak Order Hours</h3>
                <div className="h-72 bg-gray-100 rounded animate-pulse"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-black p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Peak Order Hours</h3>
                <p className="text-gray-500 text-center py-8">No peak hours data available</p>
            </div>
        );
    }

    const chartData = getPeakHoursChartData(data);
    const options = {
        ...getChartOptions('Top 5 Order Hours'),
        plugins: {
            ...getChartOptions('Top 5 Order Hours').plugins,
            legend: { position: 'bottom' }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-black p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Peak Order Hours</h3>
            <div className="h-72">
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
};

export default PeakHoursChart;
