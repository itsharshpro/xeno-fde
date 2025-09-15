// src/controllers/metricsController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// This middleware will fetch the store for a given tenant
// We assume the frontend will know the tenantId
export const getStoreForTenant = async (req, res, next) => {
    // CONSISTENCY FIX: Get tenantId from the logged-in user, not URL params
    const tenantId = req.user.tenantId;
    
    try {
        const store = await prisma.shopifyStore.findFirst({
            where: { tenantId: tenantId },
        });

        if (!store) {
            return res.status(404).json({ error: "No Shopify store found for this tenant." });
        }

        req.store = store;
        next();
    } catch (error) {
        res.status(500).json({ error: "Failed to verify store for tenant." });
    }
};


// GET /metrics/:tenantId/summary
export const getMetricsSummary = async (req, res) => {
    try {
        const storeId = req.store.id;
        const { startDate, endDate } = req.query;

        // Build date filter for orders and customers
        let dateFilter = {};
        if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate + 'T23:59:59.999Z');
            dateFilter = {
                createdAt: {
                    gte: startDateTime,
                    lte: endDateTime
                }
            };
        }

        // Products count (not time-dependent, so no date filter)
        const totalProducts = await prisma.product.count({ where: { storeId } });
        
        // Customers and orders with date filtering
        const totalCustomers = await prisma.customer.count({ 
            where: { storeId, ...dateFilter } 
        });
        const totalOrders = await prisma.order.count({ 
            where: { storeId, ...dateFilter } 
        });

        const revenue = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { storeId, ...dateFilter },
        });

        res.json({
            totalProducts,
            totalCustomers,
            totalOrders,
            totalRevenue: revenue._sum.totalAmount || 0,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch metrics summary." });
    }
};

// GET /metrics/:tenantId/orders-by-date
// src/controllers/metricsController.js

// ... keep all other code the same ...

export const getOrdersByDate = async (req, res) => {
    try {
        const storeId = req.store.id;

        // --- NEW LOGIC: Calculate the date for 7 days ago ---
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const orders = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: {
                    gte: sevenDaysAgo, // Fetch all orders from the last 7 days
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        
        const revenueByDay = orders.reduce((acc, order) => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += order.totalAmount;
            return acc;
        }, {});

        const series = Object.keys(revenueByDay).map(date => ({
            date: date,
            revenue: revenueByDay[date],
        }));

        res.json(series);
    } catch (error) {
        console.error("Error fetching orders by date:", error);
        res.status(500).json({ error: "Failed to fetch orders by date." });
    }
};


// ... keep getTopCustomers the same ...
// GET /metrics/:tenantId/top-customers
export const getTopCustomers = async (req, res) => {
    try {
        const storeId = req.store.id;
        const { startDate, endDate } = req.query;

        // Build date filter for orders
        let dateFilter = { storeId, customerId: { not: null } };
        if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate + 'T23:59:59.999Z');
            dateFilter.createdAt = {
                gte: startDateTime,
                lte: endDateTime
            };
        }

        const topCustomers = await prisma.order.groupBy({
            by: ['customerId'],
            where: dateFilter,
            _sum: { totalAmount: true },
            orderBy: { _sum: { totalAmount: 'desc' } },
            take: 5,
        });

        // Fetch customer details for the top customer IDs
        const customerIds = topCustomers.map(c => c.customerId);
        const customers = await prisma.customer.findMany({
            where: { id: { in: customerIds } },
        });

        const customerMap = customers.reduce((acc, c) => {
            acc[c.id] = c;
            return acc;
        }, {});

        const result = topCustomers.map(c => ({
            ...customerMap[c.customerId],
            totalSpent: c._sum.totalAmount,
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch top customers." });
    }
};
// Add this new function to the end of your metricsController.js
export const getRevenueOverTime = async (req, res) => {
    try {
        const storeId = req.store.id;
        const { startDate, endDate } = req.query;
        
        let result;
        if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate + 'T23:59:59.999Z'); // Include the full end date
            
            result = await prisma.$queryRaw`
                SELECT 
                    DATE("createdAt") as date, 
                    SUM("totalAmount") as revenue,
                    COUNT(*) as orders
                FROM "Order"
                WHERE "storeId" = ${storeId} AND "createdAt" >= ${startDateTime} AND "createdAt" <= ${endDateTime}
                GROUP BY DATE("createdAt")
                ORDER BY date ASC;
            `;
        } else {
            result = await prisma.$queryRaw`
                SELECT 
                    DATE("createdAt") as date, 
                    SUM("totalAmount") as revenue,
                    COUNT(*) as orders
                FROM "Order"
                WHERE "storeId" = ${storeId}
                GROUP BY DATE("createdAt")
                ORDER BY date ASC;
            `;
        }

        const series = result.map(group => ({
            date: new Date(group.date).toISOString().split('T')[0],
            revenue: Number(group.revenue) || 0,
            orders: Number(group.orders) || 0,
        }));

        res.json(series);
    } catch (error) {
        console.error("Error fetching revenue over time:", error);
        res.status(500).json({ error: "Failed to fetch revenue data." });
    }
};

// Advanced Business Metrics
export const getAdvancedMetrics = async (req, res) => {
    try {
        const storeId = req.store.id;
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate + 'T23:59:59.999Z'); // Include the full end date
            dateFilter = {
                createdAt: {
                    gte: startDateTime,
                    lte: endDateTime
                }
            };
        }

        // Average Order Value
        const orderStats = await prisma.order.aggregate({
            where: { storeId, ...dateFilter },
            _avg: { totalAmount: true },
            _count: true,
            _sum: { totalAmount: true }
        });

        // Customer Growth Over Time
        let customerGrowth;
        if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate + 'T23:59:59.999Z');
            
            customerGrowth = await prisma.$queryRaw`
                SELECT 
                    DATE("createdAt") as date,
                    COUNT(*) as new_customers
                FROM "Customer"
                WHERE "storeId" = ${storeId} AND "createdAt" >= ${startDateTime} AND "createdAt" <= ${endDateTime}
                GROUP BY DATE("createdAt")
                ORDER BY date ASC;
            `;
        } else {
            customerGrowth = await prisma.$queryRaw`
                SELECT 
                    DATE("createdAt") as date,
                    COUNT(*) as new_customers
                FROM "Customer"
                WHERE "storeId" = ${storeId}
                GROUP BY DATE("createdAt")
                ORDER BY date ASC;
            `;
        }

        // Peak Order Hours
        let peakHours;
        if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate + 'T23:59:59.999Z');
            
            peakHours = await prisma.$queryRaw`
                SELECT 
                    EXTRACT(HOUR FROM "createdAt") as hour,
                    COUNT(*) as order_count
                FROM "Order"
                WHERE "storeId" = ${storeId} AND "createdAt" >= ${startDateTime} AND "createdAt" <= ${endDateTime}
                GROUP BY EXTRACT(HOUR FROM "createdAt")
                ORDER BY order_count DESC
                LIMIT 5;
            `;
        } else {
            peakHours = await prisma.$queryRaw`
                SELECT 
                    EXTRACT(HOUR FROM "createdAt") as hour,
                    COUNT(*) as order_count
                FROM "Order"
                WHERE "storeId" = ${storeId}
                GROUP BY EXTRACT(HOUR FROM "createdAt")
                ORDER BY order_count DESC
                LIMIT 5;
            `;
        }

        // Customer Retention Rate (customers with multiple orders)
        let retentionData;
        if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate + 'T23:59:59.999Z');
            
            retentionData = await prisma.$queryRaw`
                SELECT 
                    COUNT(CASE WHEN order_count > 1 THEN 1 END) as repeat_customers,
                    COUNT(*) as total_customers
                FROM (
                    SELECT "customerId", COUNT(*) as order_count
                    FROM "Order"
                    WHERE "storeId" = ${storeId} AND "customerId" IS NOT NULL AND "createdAt" >= ${startDateTime} AND "createdAt" <= ${endDateTime}
                    GROUP BY "customerId"
                ) customer_orders;
            `;
        } else {
            retentionData = await prisma.$queryRaw`
                SELECT 
                    COUNT(CASE WHEN order_count > 1 THEN 1 END) as repeat_customers,
                    COUNT(*) as total_customers
                FROM (
                    SELECT "customerId", COUNT(*) as order_count
                    FROM "Order"
                    WHERE "storeId" = ${storeId} AND "customerId" IS NOT NULL
                    GROUP BY "customerId"
                ) customer_orders;
            `;
        }

        const retentionRate = retentionData[0]?.total_customers > 0 
            ? (Number(retentionData[0].repeat_customers) / Number(retentionData[0].total_customers) * 100).toFixed(2)
            : 0;

        res.json({
            averageOrderValue: orderStats._avg.totalAmount || 0,
            totalOrders: orderStats._count || 0,
            totalRevenue: orderStats._sum.totalAmount || 0,
            customerRetentionRate: parseFloat(retentionRate),
            customerGrowth: customerGrowth.map(g => ({
                date: new Date(g.date).toISOString().split('T')[0],
                newCustomers: Number(g.new_customers)
            })),
            peakOrderHours: peakHours.map(h => ({
                hour: Number(h.hour),
                orderCount: Number(h.order_count)
            }))
        });
    } catch (error) {
        console.error("Error fetching advanced metrics:", error);
        res.status(500).json({ error: "Failed to fetch advanced metrics." });
    }
};

// Revenue Trends with Period Comparison
export const getRevenueTrends = async (req, res) => {
    try {
        const storeId = req.store.id;
        const { startDate, endDate } = req.query;
        
        let currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd;

        if (startDate && endDate) {
            // Use the selected date range
            currentPeriodStart = new Date(startDate);
            currentPeriodEnd = new Date(endDate + 'T23:59:59.999Z');
            
            // Calculate equivalent previous period
            const periodDuration = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
            previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1); // Day before current period
            previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDuration);
        } else {
            // Default to current month vs previous month
            const currentMonth = new Date();
            currentPeriodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            currentPeriodEnd = new Date();
            
            previousPeriodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
            previousPeriodEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
        }

        const [currentPeriodData, previousPeriodData, currentCustomers, previousCustomers] = await Promise.all([
            // Current period orders
            prisma.order.aggregate({
                where: {
                    storeId,
                    createdAt: { 
                        gte: currentPeriodStart,
                        lte: currentPeriodEnd 
                    }
                },
                _sum: { totalAmount: true },
                _count: true
            }),
            // Previous period orders
            prisma.order.aggregate({
                where: {
                    storeId,
                    createdAt: {
                        gte: previousPeriodStart,
                        lte: previousPeriodEnd
                    }
                },
                _sum: { totalAmount: true },
                _count: true
            }),
            // Current period customers
            prisma.customer.count({
                where: {
                    storeId,
                    createdAt: {
                        gte: currentPeriodStart,
                        lte: currentPeriodEnd
                    }
                }
            }),
            // Previous period customers
            prisma.customer.count({
                where: {
                    storeId,
                    createdAt: {
                        gte: previousPeriodStart,
                        lte: previousPeriodEnd
                    }
                }
            })
        ]);

        const currentRevenue = currentPeriodData._sum.totalAmount || 0;
        const previousRevenue = previousPeriodData._sum.totalAmount || 0;
        const revenueGrowth = previousRevenue > 0 
            ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(2)
            : 0;

        const currentOrders = currentPeriodData._count || 0;
        const previousOrders = previousPeriodData._count || 0;
        const orderGrowth = previousOrders > 0 
            ? ((currentOrders - previousOrders) / previousOrders * 100).toFixed(2)
            : 0;

        const customerGrowth = previousCustomers > 0 
            ? ((currentCustomers - previousCustomers) / previousCustomers * 100).toFixed(2)
            : 0;

        res.json({
            currentPeriod: {
                revenue: currentRevenue,
                orders: currentOrders,
                customers: currentCustomers
            },
            previousPeriod: {
                revenue: previousRevenue,
                orders: previousOrders,
                customers: previousCustomers
            },
            growth: {
                revenue: parseFloat(revenueGrowth),
                orders: parseFloat(orderGrowth),
                customers: parseFloat(customerGrowth)
            }
        });
    } catch (error) {
        console.error("Error fetching revenue trends:", error);
        res.status(500).json({ error: "Failed to fetch revenue trends." });
    }
};