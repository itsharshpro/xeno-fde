// src/controllers/syncController.js

import { PrismaClient } from "@prisma/client";
import { shopifyRequest, shopifyRequestPaginated } from "../utils/shopifyClient.js";

const prisma = new PrismaClient();

const logSync = async (storeId, entity, status, message) => {
  await prisma.syncLog.create({
    data: { storeId, entity, status, message },
  });
};

// Sync Products
export const syncProducts = async (req, res) => {
  const { storeId } = req.body;
  let store;
  try {
    store = await prisma.shopifyStore.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ error: "Store not found" });

    console.log(`Starting product sync for store: ${store.shopDomain}`);
    const data = await shopifyRequestPaginated(store.shopDomain, store.accessToken, "products.json");
    
    if (!data.products || data.products.length === 0) {
      await logSync(storeId, "PRODUCTS", "SUCCESS", "Shopify store has no products to sync.");
      return res.json({ message: "Shopify store has no products to sync.", count: 0 });
    }

    console.log(`Processing ${data.products.length} products from Shopify...`);
    let processedCount = 0;

    for (const p of data.products) {
      await prisma.product.upsert({
        where: { shopifyId: p.id.toString() },
        update: { title: p.title, price: parseFloat(p.variants[0]?.price || 0) },
        create: { storeId, shopifyId: p.id.toString(), title: p.title, price: parseFloat(p.variants[0]?.price || 0), currency: "USD" },
      });
      processedCount++;
      
      // Log progress for large datasets
      if (processedCount % 50 === 0) {
        console.log(`Processed ${processedCount}/${data.products.length} products...`);
      }
    }

    await logSync(storeId, "PRODUCTS", "SUCCESS", `Synced ${data.products.length} products successfully with pagination.`);
    console.log(`Product sync completed: ${data.products.length} products processed`);
    res.json({ message: "Products synced successfully", count: data.products.length });
  } catch (error) {
    console.error("Product sync failed:", error);
    if (store) await logSync(storeId, "PRODUCTS", "FAILED", error.response?.data?.errors || "An unknown API error occurred.");
    res.status(500).json({ error: "Failed to sync products", details: error.response?.data || { message: error.message } });
  }
};

// Sync Customers
export const syncCustomers = async (req, res) => {
  const { storeId } = req.body;
  let store;
  try {
    store = await prisma.shopifyStore.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ error: "Store not found" });

    console.log(`Starting customer sync for store: ${store.shopDomain}`);
    const data = await shopifyRequestPaginated(store.shopDomain, store.accessToken, "customers.json");
    
    if (!data.customers || data.customers.length === 0) {
        await logSync(storeId, "CUSTOMERS", "SUCCESS", "Shopify store has no customers to sync.");
        return res.json({ message: "Shopify store has no customers to sync.", count: 0 });
    }

    console.log(`Processing ${data.customers.length} customers from Shopify...`);
    let processedCount = 0;

    for (const c of data.customers) {
      await prisma.customer.upsert({
        where: { shopifyId: c.id.toString() },
        update: { email: c.email, firstName: c.first_name, lastName: c.last_name },
        create: { storeId, shopifyId: c.id.toString(), email: c.email, firstName: c.first_name, lastName: c.last_name },
      });
      processedCount++;
      
      // Log progress for large datasets
      if (processedCount % 50 === 0) {
        console.log(`Processed ${processedCount}/${data.customers.length} customers...`);
      }
    }

    await logSync(storeId, "CUSTOMERS", "SUCCESS", `Synced ${data.customers.length} customers successfully with pagination.`);
    console.log(`Customer sync completed: ${data.customers.length} customers processed`);
    res.json({ message: "Customers synced successfully", count: data.customers.length });
  } catch (error) {
    console.error("Customer sync failed:", error);
    if (store) await logSync(storeId, "CUSTOMERS", "FAILED", error.response?.data?.errors || "An unknown API error occurred.");
    res.status(500).json({ error: "Failed to sync customers", details: error.response?.data || { message: error.message } });
  }
};

// Sync Orders
export const syncOrders = async (req, res) => {
  const { storeId } = req.body;
  let store;
  try {
    store = await prisma.shopifyStore.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ error: "Store not found" });

    console.log(`Starting order sync for store: ${store.shopDomain}`);
    const data = await shopifyRequestPaginated(store.shopDomain, store.accessToken, "orders.json?status=any");
    
    if (!data.orders || data.orders.length === 0) {
        await logSync(storeId, "ORDERS", "SUCCESS", "Shopify store has no orders to sync.");
        return res.json({ message: "Shopify store has no orders to sync.", count: 0 });
    }

    console.log(`Processing ${data.orders.length} orders from Shopify...`);
    let processedCount = 0;

    for (const o of data.orders) {
      // Find the internal customer ID based on the Shopify customer ID
      let internalCustomerId = null;
      if (o.customer) {
        const customer = await prisma.customer.findUnique({ where: { shopifyId: o.customer.id.toString() } });
        if (customer) {
          internalCustomerId = customer.id;
        }
      }

      await prisma.order.upsert({
        where: { shopifyId: o.id.toString() },
        update: { totalAmount: parseFloat(o.total_price || 0), currency: o.currency, customerId: internalCustomerId },
        create: { storeId, shopifyId: o.id.toString(), totalAmount: parseFloat(o.total_price || 0), currency: o.currency, customerId: internalCustomerId },
      });
      
      processedCount++;
      
      // Log progress for large datasets
      if (processedCount % 50 === 0) {
        console.log(`Processed ${processedCount}/${data.orders.length} orders...`);
      }
    }

    await logSync(storeId, "ORDERS", "SUCCESS", `Synced ${data.orders.length} orders successfully with pagination.`);
    console.log(`Order sync completed: ${data.orders.length} orders processed`);
    res.json({ message: "Orders synced successfully", count: data.orders.length });
  } catch (error) {
    console.error("Order sync failed:", error);
    if (store) await logSync(storeId, "ORDERS", "FAILED", error.response?.data?.errors || "An unknown API error occurred.");
    res.status(500).json({ error: "Failed to sync orders", details: error.response?.data || { message: error.message } });
  }
};

// Sync All Data (Products, Customers, Orders)
export const syncAll = async (req, res) => {
  const { storeId } = req.body;
  
  try {
    const store = await prisma.shopifyStore.findUnique({ where: { id: storeId } });
    if (!store) return res.status(404).json({ error: "Store not found" });

    console.log(`Starting full sync for store: ${store.shopDomain}`);
    
    const results = {
      products: { success: false, count: 0, message: "" },
      customers: { success: false, count: 0, message: "" },
      orders: { success: false, count: 0, message: "" }
    };

    // Sync Products
    try {
      console.log("Syncing products...");
      const productData = await shopifyRequestPaginated(store.shopDomain, store.accessToken, "products.json");
      
      if (productData.products && productData.products.length > 0) {
        for (const p of productData.products) {
          await prisma.product.upsert({
            where: { shopifyId: p.id.toString() },
            update: { title: p.title, price: parseFloat(p.variants[0]?.price || 0) },
            create: { storeId, shopifyId: p.id.toString(), title: p.title, price: parseFloat(p.variants[0]?.price || 0), currency: "USD" },
          });
        }
        results.products = { success: true, count: productData.products.length, message: "Products synced successfully" };
      } else {
        results.products = { success: true, count: 0, message: "No products found" };
      }
    } catch (error) {
      console.error("Products sync failed:", error);
      results.products = { success: false, count: 0, message: "Products sync failed" };
    }

    // Sync Customers
    try {
      console.log("Syncing customers...");
      const customerData = await shopifyRequestPaginated(store.shopDomain, store.accessToken, "customers.json");
      
      if (customerData.customers && customerData.customers.length > 0) {
        for (const c of customerData.customers) {
          await prisma.customer.upsert({
            where: { shopifyId: c.id.toString() },
            update: { email: c.email, firstName: c.first_name, lastName: c.last_name },
            create: { storeId, shopifyId: c.id.toString(), email: c.email, firstName: c.first_name, lastName: c.last_name },
          });
        }
        results.customers = { success: true, count: customerData.customers.length, message: "Customers synced successfully" };
      } else {
        results.customers = { success: true, count: 0, message: "No customers found" };
      }
    } catch (error) {
      console.error("Customers sync failed:", error);
      results.customers = { success: false, count: 0, message: "Customers sync failed" };
    }

    // Sync Orders
    try {
      console.log("Syncing orders...");
      const orderData = await shopifyRequestPaginated(store.shopDomain, store.accessToken, "orders.json?status=any");
      
      if (orderData.orders && orderData.orders.length > 0) {
        for (const o of orderData.orders) {
          let internalCustomerId = null;
          if (o.customer) {
            const customer = await prisma.customer.findUnique({ where: { shopifyId: o.customer.id.toString() } });
            if (customer) {
              internalCustomerId = customer.id;
            }
          }

          await prisma.order.upsert({
            where: { shopifyId: o.id.toString() },
            update: { totalAmount: parseFloat(o.total_price || 0), currency: o.currency, customerId: internalCustomerId },
            create: { storeId, shopifyId: o.id.toString(), totalAmount: parseFloat(o.total_price || 0), currency: o.currency, customerId: internalCustomerId },
          });
        }
        results.orders = { success: true, count: orderData.orders.length, message: "Orders synced successfully" };
      } else {
        results.orders = { success: true, count: 0, message: "No orders found" };
      }
    } catch (error) {
      console.error("Orders sync failed:", error);
      results.orders = { success: false, count: 0, message: "Orders sync failed" };
    }

    await logSync(storeId, "FULL_SYNC", "SUCCESS", `Full sync completed: Products(${results.products.count}), Customers(${results.customers.count}), Orders(${results.orders.count})`);
    console.log("Full sync completed");
    
    res.json({ 
      message: "Full sync completed", 
      results,
      totalSynced: results.products.count + results.customers.count + results.orders.count
    });
    
  } catch (error) {
    console.error("Full sync failed:", error);
    await logSync(storeId, "FULL_SYNC", "FAILED", error.message);
    res.status(500).json({ error: "Failed to sync store data", details: error.message });
  }
};

// Get Sync Logs for a specific store
export const getSyncLogs = async (req, res) => {
  try {
    const { storeId } = req.params;
    const logs = await prisma.syncLog.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to the last 50 logs
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sync logs" });
  }
};