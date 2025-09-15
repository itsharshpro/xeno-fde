// src/utils/shopifyClient.js

import axios from "axios";

export const shopifyRequest = async (shopDomain, accessToken, endpoint) => {
  // Use a recent, stable API version
  const apiVersion = "2024-10";
  const url = `https://${shopDomain}/admin/api/${apiVersion}/${endpoint}`;

  console.log(`🚀 Making Shopify API request to: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    // Log the detailed error from Shopify
    console.error("❌ Shopify API Error Response:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request Error: No response received.", error.request);
    } else {
      console.error("Axios Error:", error.message);
    }
    // Re-throw the error so the controller's catch block can handle it
    throw error;
  }
};

// Enhanced function to fetch all data with pagination
export const shopifyRequestPaginated = async (shopDomain, accessToken, baseEndpoint) => {
  const apiVersion = "2024-10";
  let allData = [];
  let nextPageInfo = null;
  let hasNextPage = true;
  let pageCount = 0;
  const maxPages = 100; // Safety limit to prevent infinite loops

  try {
    while (hasNextPage && pageCount < maxPages) {
      pageCount++;
      
      // Build the endpoint with pagination parameters
      let endpoint = baseEndpoint;
      
      // Add limit parameter if not already present
      if (!endpoint.includes('limit=')) {
        const separator = endpoint.includes('?') ? '&' : '?';
        endpoint += `${separator}limit=250`; // Maximum allowed by Shopify
      }
      
      // Add page_info for subsequent requests
      if (nextPageInfo) {
        const separator = endpoint.includes('?') ? '&' : '?';
        endpoint += `${separator}page_info=${nextPageInfo}`;
      }

      const url = `https://${shopDomain}/admin/api/${apiVersion}/${endpoint}`;
      console.log(`🚀 Making paginated Shopify API request (page ${pageCount}): ${url}`);

      const response = await axios.get(url, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      
      // Determine the data type and extract records
      let records = [];
      let dataType = '';
      
      if (data.products) {
        records = data.products;
        dataType = 'products';
      } else if (data.customers) {
        records = data.customers;
        dataType = 'customers';
      } else if (data.orders) {
        records = data.orders;
        dataType = 'orders';
      }

      allData = allData.concat(records);
      console.log(`📦 Fetched ${records.length} ${dataType} (total so far: ${allData.length})`);

      // Check for pagination using Link header
      const linkHeader = response.headers.link;
      hasNextPage = false;
      nextPageInfo = null;

      if (linkHeader) {
        // Parse Link header for next page info
        const links = linkHeader.split(',');
        for (const link of links) {
          if (link.includes('rel="next"')) {
            const match = link.match(/page_info=([^&>]+)/);
            if (match) {
              nextPageInfo = match[1];
              hasNextPage = true;
            }
            break;
          }
        }
      }

      // Also check if we got fewer records than requested (alternative way to detect end)
      if (records.length < 250) {
        hasNextPage = false;
      }
    }

    if (pageCount >= maxPages) {
      console.warn(`⚠️ Reached maximum page limit (${maxPages}). There might be more data available.`);
    }

    console.log(`✅ Pagination complete. Total pages: ${pageCount}, Total records: ${allData.length}`);

    // Return data in the same format as the original function
    const result = {};
    if (baseEndpoint.includes('products')) {
      result.products = allData;
    } else if (baseEndpoint.includes('customers')) {
      result.customers = allData;
    } else if (baseEndpoint.includes('orders')) {
      result.orders = allData;
    }

    return result;

  } catch (error) {
    console.error("❌ Shopify Paginated API Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request Error: No response received.", error.request);
    } else {
      console.error("Axios Error:", error.message);
    }
    throw error;
  }
};