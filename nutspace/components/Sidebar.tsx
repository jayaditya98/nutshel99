import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import type { NavLinkItem } from '../types';
import { HomeIcon, CompassIcon, GridIcon, FolderIcon, FilmIcon, PenToolIcon, LayersIcon, PlusIcon, ChevronsLeftIcon, ChevronsRightIcon, ZapIcon, SettingsIcon, LogOutIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleProfileMenu = () => setIsProfileOpen(!isProfileOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNav: NavLinkItem[] = [
    { path: '/canvas', label: 'AI Canvas', icon: <PenToolIcon className="w-5 h-5" /> },
    { path: '/studios', label: 'Nutshel Studios', icon: <FilmIcon className="w-5 h-5" /> },
    { path: '/suite', label: 'Edit Images', icon: <LayersIcon className="w-5 h-5" /> },
  ];
  
  const secondaryNav: NavLinkItem[] = [
    { path: '/creations', label: 'All Creations', icon: <FolderIcon className="w-5 h-5" /> },
    { path: '/explore', label: 'Explore', icon: <CompassIcon className="w-5 h-5" /> },
  ];

  const handleCreateClick = () => {
    navigate('/creations', { state: { createNew: true } });
  };

  const NavItem: React.FC<{ item: NavLinkItem }> = ({ item }) => {
    const isActive = location.pathname.startsWith(item.path);
    return (
      <NavLink
        to={item.path}
        title={isCollapsed ? item.label : undefined}
        className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
          isActive
            ? 'bg-nutshel-accent text-black'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
        } ${isCollapsed ? 'justify-center' : 'space-x-3'} ${!isCollapsed ? 'hover:translate-x-0.5' : ''}`}
      >
        {item.icon}
        {!isCollapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  if (!user) return null;

  return (
    <div className={`bg-nutshel-gray flex-shrink-0 p-4 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div>
        <div className={`flex items-center mb-8 ${isCollapsed ? 'flex-col items-center space-y-4' : 'justify-between'}`}>
            <Link to="/dashboard" className="flex items-center gap-2 text-white opacity-90 hover:opacity-100" title="Dashboard">
                <HomeIcon className="w-7 h-7 text-nutshel-accent"/>
                {!isCollapsed && <span className="text-xl font-bold tracking-wider">NUTSPACE</span>}
            </Link>
            <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {isCollapsed ? <ChevronsRightIcon className="w-5 h-5" /> : <ChevronsLeftIcon className="w-5 h-5" />}
            </button>
        </div>
        
        <div className="space-y-4">
            <button onClick={handleCreateClick} className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 p-2.5 rounded-lg text-sm font-semibold border border-white/10 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5">
                <PlusIcon className="w-5 h-5" />
                {!isCollapsed && <span>Create</span>}
            </button>

            <nav className="space-y-2">
              {primaryNav.map(item => <NavItem key={item.path} item={item} />)}
            </nav>
            
            <div className="border-t border-white/10 my-4"></div>

            <nav className="space-y-2">
              {secondaryNav.map(item => <NavItem key={item.path} item={item} />)}
            </nav>
        </div>
      </div>

      <div className="space-y-2">
        <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center font-tasa transition-all duration-200 ease-in-out transform hover:-translate-y-0.5">
          {isCollapsed ? <ZapIcon className="w-5 h-5" /> : 'Get Nutshel Plus'}
        </button>

        <div className="border-t border-white/10 pt-2">
            <div className="relative" ref={profileRef}>
                <button onClick={toggleProfileMenu} className={`flex items-center w-full text-left overflow-hidden p-2 rounded-lg hover:bg-white/5 transition-colors ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
                    <div className="w-8 h-8 rounded-full bg-nutshel-accent flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                        {user.avatarUrl ? <img src={user.avatarUrl} alt="User avatar" className="w-full h-full rounded-full object-cover" /> : user.initials}
                    </div>
                    {!isCollapsed && <span className="text-sm font-semibold truncate">{user.name}</span>}
                </button>
                {isProfileOpen && !isCollapsed && (
                   <div className="absolute bottom-full left-0 mb-2 w-full bg-nutshel-gray-dark border border-white/10 rounded-lg shadow-xl z-10 text-sm">
                      <div className="p-2 border-b border-white/10">
                        <p className="font-semibold px-2">{user.name}</p>
                        <p className="text-gray-400 px-2 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                          <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-white/10">
                              <SettingsIcon className="w-4 h-4" />
                              <span>Profile Settings</span>
                          </Link>
                          <button onClick={logout} className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-white/10 text-red-400">
                              <LogOutIcon className="w-4 h-4" />
                              <span>Log Out</span>
                          </button>
                      </div>
                   </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;