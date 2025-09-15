import React from 'react';

const MetricCard = ({ title, value, trend, loading }) => (
    <div className="bg-white rounded-lg shadow-sm border border-black p-6">
        <h3 className="text-lg font-semibold text-black mb-3">{title}</h3>
        {loading ? (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
        ) : (
            <>
                <p className="text-3xl font-bold text-black mb-2">{value}</p>
                {trend && (
                    <span className={`text-sm font-medium flex items-center ${
                        trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                    </span>
                )}
            </>
        )}
    </div>
);

const MetricCards = ({ summary, advancedMetrics, revenueTrends, loading }) => {
    const metrics = [
        {
            title: 'Total Revenue',
            value: `$${summary?.totalRevenue?.toFixed(2) || '0.00'}`,
            trend: revenueTrends ? {
                value: revenueTrends.growth.revenue,
                isPositive: revenueTrends.growth.revenue >= 0
            } : null
        },
        {
            title: 'Total Orders',
            value: summary?.totalOrders || '0',
            trend: revenueTrends ? {
                value: revenueTrends.growth.orders,
                isPositive: revenueTrends.growth.orders >= 0
            } : null
        },
        {
            title: 'Total Customers',
            value: summary?.totalCustomers || '0',
            trend: revenueTrends ? {
                value: revenueTrends.growth.customers,
                isPositive: revenueTrends.growth.customers >= 0
            } : null
        },
        {
            title: 'Average Order Value',
            value: `$${advancedMetrics?.averageOrderValue?.toFixed(2) || '0.00'}`
        },
        {
            title: 'Customer Retention',
            value: `${advancedMetrics?.customerRetentionRate?.toFixed(1) || '0'}%`
        },
        {
            title: 'Total Products',
            value: summary?.totalProducts || '0'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {metrics.map((metric, index) => (
                <MetricCard
                    key={index}
                    title={metric.title}
                    value={metric.value}
                    trend={metric.trend}
                    loading={loading}
                />
            ))}
        </div>
    );
};

export default MetricCards;
