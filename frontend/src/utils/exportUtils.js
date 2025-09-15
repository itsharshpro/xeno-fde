// Export utilities for dashboard data
export const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportSummaryToCSV = (summary, advancedMetrics, revenueTrends) => {
    const summaryData = [
        { metric: 'Total Revenue', value: `$${summary?.totalRevenue?.toFixed(2) || '0.00'}` },
        { metric: 'Total Orders', value: summary?.totalOrders || 0 },
        { metric: 'Total Customers', value: summary?.totalCustomers || 0 },
        { metric: 'Total Products', value: summary?.totalProducts || 0 },
        { metric: 'Average Order Value', value: `$${advancedMetrics?.averageOrderValue?.toFixed(2) || '0.00'}` },
        { metric: 'Customer Retention Rate', value: `${advancedMetrics?.customerRetentionRate?.toFixed(1) || 0}%` },
        { metric: 'Revenue Growth', value: `${revenueTrends?.growth?.revenue || 0}%` },
        { metric: 'Order Growth', value: `${revenueTrends?.growth?.orders || 0}%` }
    ];
    
    exportToCSV(summaryData, `dashboard-summary-${new Date().toISOString().split('T')[0]}`);
};

export const exportCustomersToCSV = (customers) => {
    const customerData = customers.map((customer, index) => ({
        rank: index + 1,
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        email: customer.email || '',
        totalSpent: `$${customer.totalSpent?.toFixed(2) || '0.00'}`
    }));
    
    exportToCSV(customerData, `top-customers-${new Date().toISOString().split('T')[0]}`);
};

export const exportRevenueDataToCSV = (revenueData) => {
    if (!revenueData || !revenueData.labels) return;
    
    const data = revenueData.labels.map((date, index) => ({
        date,
        revenue: `$${revenueData.datasets[0]?.data[index]?.toFixed(2) || '0.00'}`,
        orders: revenueData.datasets[1]?.data[index] || 0
    }));
    
    exportToCSV(data, `revenue-data-${new Date().toISOString().split('T')[0]}`);
};
