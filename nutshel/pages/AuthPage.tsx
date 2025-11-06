import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Logo, GoogleIcon } from '../components/Icons';

interface AuthPageProps {
  isLogin: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ isLogin: initialIsLogin }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(initialIsLogin);
    setError(null);
    setMessage(null);
  }, [initialIsLogin]);

  const handleAuthAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    let response;
    if (isLogin) {
        response = await supabase.auth.signInWithPassword({ email, password });
    } else {
        response = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: window.location.origin,
            }
        });
    }
    
    setLoading(false);
    if (response.error) {
        setError(response.error.message);
    } else {
        if (!isLogin && response.data.user) {
            setMessage('Success! Please check your email to verify your account.');
        }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
        setError(error.message);
        setLoading(false);
    }
  };
  
  const baseButtonClasses = "w-full py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-nutshel-gray-dark disabled:opacity-50";
  const dynamicButtonClasses = isLogin
    ? "bg-white text-black hover:bg-gray-200 focus:ring-white transition-colors"
    : "bg-nutshel-blue text-black hover:opacity-90 focus:ring-nutshel-blue transition-opacity";


  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-pageFadeIn">
      <div className="w-full max-w-md bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
                <Logo className="w-8 h-8 text-white" />
                <span className="text-white font-bold text-3xl">nutshel</span>
            </Link>
            <h2 className="text-2xl font-semibold text-white">
              {isLogin ? 'Welcome Back!' : 'Create an Account'}
            </h2>
            <p className="text-gray-400">
              {isLogin ? 'Log in to continue your creative journey.' : 'Start creating boldly today.'}
            </p>
        </div>

        <form onSubmit={handleAuthAction} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-300">Full Name</label>
              <input 
                type="text" 
                id="fullname" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-nutshel-blue focus:border-nutshel-blue form-input-custom"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-nutshel-blue focus:border-nutshel-blue form-input-custom"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-nutshel-blue focus:border-nutshel-blue form-input-custom"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm text-center">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`${baseButtonClasses} ${dynamicButtonClasses}`}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-white/20"></div>
        </div>

        <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-4 border border-white/20 rounded-full shadow-sm text-sm font-medium text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-nutshel-gray-dark focus:ring-white disabled:opacity-50"
        >
            <GoogleIcon className="w-5 h-5" />
            Sign {isLogin ? 'in' : 'up'} with Google
        </button>

        <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Link
                  to={isLogin ? '/signup' : '/login'}
                  className="font-medium text-nutshel-blue hover:underline ml-1"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;