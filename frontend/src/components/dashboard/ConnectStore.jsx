import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopifyAPI, authAPI } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth';

const ConnectStore = ({ onConnectSuccess }) => {
    const [formData, setFormData] = useState({
        shopDomain: '',
        accessToken: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await shopifyAPI.connectStore({
                shopDomain: formData.shopDomain,
                accessToken: formData.accessToken
            });
            
            // Note: Sync operations would be handled by the backend automatically
            // or through separate API calls if needed
            
            if (onConnectSuccess) {
                onConnectSuccess();
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Failed to connect store. Please check your credentials.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemo = async () => {
        setIsDemoLoading(true);
        setError('');

        try {
            const result = await login('hello@gmail.com', 'hello123');
            if (result.success) {
                navigate('/');
            } else {
                setError('Demo account not available. Please contact support.');
            }
        } catch (err) {
            setError('Failed to access demo. Please try again later.');
            console.error(err);
        } finally {
            setIsDemoLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="w-full max-w-md p-10 bg-white border border-black rounded-lg">
                <h2 className="text-3xl font-bold text-black mb-2 text-center">Connect Your Shopify Store</h2>
                <p className="text-black mb-8 text-center">Enter your store details to begin syncing data.</p>
                
                {/* Demo Section */}
                <div className="bg-gray-50 border border-black p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-black mb-2 text-center">Try Demo Dashboard</h3>
                    <p className="text-sm text-black mb-3">
                        See how the dashboard works with sample data before connecting your store.
                    </p>
                    <button
                        onClick={handleDemo}
                        disabled={isDemoLoading || isLoading}
                        className="w-full py-2 px-4 bg-white text-black border border-black font-semibold rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isDemoLoading ? 'Loading Demo...' : 'View Demo Dashboard'}
                    </button>
                </div>

                <div className="text-center mb-6">
                    <span className="text-black">OR</span>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="shopDomain" className="block text-sm font-semibold text-black mb-2">
                            Shop Domain
                        </label>
                        <input
                            id="shopDomain"
                            name="shopDomain"
                            type="text"
                            value={formData.shopDomain}
                            onChange={handleChange}
                            placeholder="example.myshopify.com"
                            required
                            disabled={isLoading || isDemoLoading}
                            className="w-full px-3 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="accessToken" className="block text-sm font-semibold text-black mb-2">
                            Admin API Access Token
                        </label>
                        <input
                            id="accessToken"
                            name="accessToken"
                            type="password"
                            value={formData.accessToken}
                            onChange={handleChange}
                            placeholder="shpat_..."
                            required
                            disabled={isLoading || isDemoLoading}
                            className="w-full px-3 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                        />
                    </div>
                    
                    {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}
                    
                    <button
                        type="submit"
                        disabled={isLoading || isDemoLoading}
                        className="w-full py-3 px-4 bg-black text-white border border-black font-semibold rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Connecting & Syncing...' : 'Connect and Sync'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConnectStore;
