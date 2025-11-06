import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('shivank.goura@example.com');
    const [password, setPassword] = useState('password123');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd validate credentials here
        login({ name: 'Shivank Goura', email });
        navigate('/dashboard');
    };

    return (
        <div className="flex items-center justify-center h-screen bg-nutshel-gray-dark">
            <div className="w-full max-w-md p-8 space-y-8 bg-nutshel-gray rounded-2xl border border-white/10 shadow-xl">
                <div>
                    <h2 className="text-3xl font-bold text-center text-white">Welcome Back</h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Sign in to your Nutspace
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-white/20 bg-white/5 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-nutshel-accent focus:border-nutshel-accent focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password-2" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-white/20 bg-white/5 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-nutshel-accent focus:border-nutshel-accent focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-nutshel-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-nutshel-gray focus:ring-nutshel-accent transition-opacity"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
