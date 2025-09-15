import React from 'react';

const TopCustomersList = ({ customers, loading }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-black p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-black mb-4">Top 5 Customers by Spend</h3>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-black p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-black mb-4">Top 5 Customers by Spend</h3>
            {customers.length > 0 ? (
                <div className="space-y-3">
                    {customers.map((customer, index) => (
                        <div key={customer.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 text-black border border-black rounded-full text-sm font-medium">
                                #{index + 1}
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full text-black font-medium">
                                {(customer.firstName?.charAt(0) || '')}{(customer.lastName?.charAt(0) || '')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-black truncate">
                                    {customer.firstName} {customer.lastName}
                                </p>
                                <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                            </div>
                            <div className="text-sm font-semibold text-black">
                                ${customer.totalSpent.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-8">No customer spending data to display.</p>
            )}
        </div>
    );
};

export default TopCustomersList;
