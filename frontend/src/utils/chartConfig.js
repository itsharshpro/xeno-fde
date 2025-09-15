import { CHART_COLORS } from '../constants/api';

export const getRevenueChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    scales: {
        x: {
            display: true,
            title: {
                display: true,
                text: 'Date'
            }
        },
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
                display: true,
                text: 'Revenue ($)'
            }
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
                display: true,
                text: 'Orders Count'
            },
            grid: {
                drawOnChartArea: false,
            },
        }
    },
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Revenue and Orders Over Time'
        }
    }
});

export const getCustomerGrowthChartData = (customerGrowth) => ({
    labels: customerGrowth.map(d => d.date),
    datasets: [{
        label: 'New Customers',
        data: customerGrowth.map(d => d.newCustomers),
        backgroundColor: CHART_COLORS.SUCCESS,
        borderColor: CHART_COLORS.SUCCESS_BORDER,
        borderWidth: 2,
        fill: false,
        tension: 0.4
    }]
});

export const getPeakHoursChartData = (peakOrderHours) => ({
    labels: peakOrderHours.map(h => `${h.hour}:00`),
    datasets: [{
        label: 'Orders',
        data: peakOrderHours.map(h => h.orderCount),
        backgroundColor: CHART_COLORS.CHART_PALETTE
    }]
});

export const getChartOptions = (title, showLegend = true) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { 
            display: showLegend,
            position: showLegend ? 'bottom' : 'top'
        },
        title: { 
            display: true, 
            text: title 
        }
    }
});
