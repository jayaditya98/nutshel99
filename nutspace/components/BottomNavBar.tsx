import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, CompassIcon, FolderIcon, PlusIcon, SettingsIcon } from './Icons';
import type { NavLinkItem } from '../types';

const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: Omit<NavLinkItem, 'label'>[] = [
    { path: '/dashboard', icon: <HomeIcon className="w-6 h-6" /> },
    { path: '/explore', icon: <CompassIcon className="w-6 h-6" /> },
    { path: '/creations', icon: <FolderIcon className="w-6 h-6" /> },
    { path: '/settings', icon: <SettingsIcon className="w-6 h-6" /> },
  ];

  const handleCreateClick = () => {
    navigate('/creations', { state: { createNew: true } });
  };

  const NavItem: React.FC<{ item: Omit<NavLinkItem, 'label'> }> = ({ item }) => {
    const isActive = location.pathname.startsWith(item.path);
    return (
      <NavLink
        to={item.path}
        className={`flex-1 flex flex-col items-center justify-center p-2 transition-colors duration-200 ${
          isActive ? 'text-nutshel-accent' : 'text-gray-400 hover:text-white'
        }`}
      >
        {item.icon}
      </NavLink>
    );
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-nutshel-gray border-t border-white/10 z-40 flex items-stretch justify-around">
      <NavItem item={navItems[0]} />
      <NavItem item={navItems[1]} />
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={handleCreateClick}
          className="w-14 h-14 -mt-6 bg-nutshel-accent rounded-full flex items-center justify-center text-black shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Create new project"
        >
          <PlusIcon className="w-7 h-7" />
        </button>
      </div>
      <NavItem item={navItems[2]} />
      <NavItem item={navItems[3]} />
    </div>
  );
};

export default BottomNavBar;