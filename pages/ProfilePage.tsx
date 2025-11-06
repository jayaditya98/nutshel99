import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        // If no user, redirect to login
        navigate('/login');
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="py-20 sm:py-24 animate-pageFadeIn">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Your Profile</h1>
          <p className="mt-4 text-lg text-gray-400">Manage your account settings.</p>
        </div>

        <div className="mt-12 bg-nutshel-gray border border-white/10 rounded-xl p-8">
          {user && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="mt-8 w-full bg-red-500 text-white hover:bg-red-600 transition-colors py-3 rounded-full font-semibold"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;