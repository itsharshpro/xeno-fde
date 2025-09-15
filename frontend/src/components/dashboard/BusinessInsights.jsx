import React from 'react';

const BusinessInsights = ({ advancedMetrics, revenueTrends, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-black p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Business Insights</h3>
                <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const insights = [
        {
            label: 'Revenue Growth',
            value: revenueTrends ? `${revenueTrends.growth.revenue}%` : 'N/A',
            isPositive: revenueTrends?.growth.revenue >= 0
        },
        {
            label: 'Order Growth',
            value: revenueTrends ? `${revenueTrends.growth.orders}%` : 'N/A',
            isPositive: revenueTrends?.growth.orders >= 0
        },
        {
            label: 'Avg Order Value',
            value: advancedMetrics ? `$${advancedMetrics.averageOrderValue.toFixed(2)}` : '$0.00',
            isPositive: null
        },
        {
            label: 'Customer Retention',
            value: advancedMetrics ? `${advancedMetrics.customerRetentionRate.toFixed(1)}%` : '0%',
            isPositive: null
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-black p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Business Insights</h3>
            <div className="space-y-4">
                {insights.map((insight, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                        <span className="text-sm text-black">{insight.label}:</span>
                        <span className={`text-sm font-semibold ${
                            insight.isPositive === true ? 'text-green-600' : 
                            insight.isPositive === false ? 'text-red-600' : 'text-black'
                        }`}>
                            {insight.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusinessInsights;
