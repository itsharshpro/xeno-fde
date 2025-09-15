import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="w-full max-w-md p-10 bg-white border border-black rounded-lg">
                <h2 className="text-5xl mb-6 font-bold text-black mb-2 text-center">Login</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full px-3 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full px-3 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                        />
                    </div>
                    
                    {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-black text-white border border-black font-semibold rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                            setFormData({
                                email: 'hello2@gmail.com',
                                password: 'hello123'
                            });
                        }}
                        className="w-full mt-1 py-3 px-4 bg-gray-100 text-black border border-gray-300 font-semibold rounded-md hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                    >
                        Login with Demo Account
                    </button>
                </form>
                
                <p className="mt-6 text-center text-black">
                    No account?{' '}
                    <Link to="/register" className="text-black hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
