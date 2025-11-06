import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfileSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatarUrl);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, avatarUrl: avatar });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
  };
  
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-gray-300 text-lg mt-2">Manage your account details.</p>
      </header>
      
      <form onSubmit={handleSaveChanges} className="space-y-8 bg-nutshel-gray p-8 rounded-2xl border border-white/10">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-nutshel-accent flex items-center justify-center text-black font-bold text-4xl">
               {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover"/>
              ) : (
                user.initials
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white/20 hover:bg-white/30 rounded-full p-2"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg py-2 px-4 focus:ring-nutshel-accent focus:border-nutshel-accent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg py-2 px-4 focus:ring-nutshel-accent focus:border-nutshel-accent"
            />
          </div>
        </div>
        
        <div className="flex justify-end items-center gap-4">
          {isSaved && <span className="text-sm text-green-400">Changes saved successfully!</span>}
          <button type="submit" className="bg-nutshel-accent text-black font-semibold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;