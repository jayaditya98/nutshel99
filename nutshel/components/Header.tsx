import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { navLinks, features } from '../constants';
import { Logo, MenuIcon, CloseIcon, ChevronDownIcon, UserIcon } from './Icons';

interface HeaderProps {
    session: Session | null;
}

const Header: React.FC<HeaderProps> = ({ session }) => {
    const [isFeaturesOpen, setFeaturesOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const featuresRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (featuresRef.current && !featuresRef.current.contains(event.target as Node)) {
                setFeaturesOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogoClick = () => {
        if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    const activeLinkStyle = { color: 'white' };
    const inactiveLinkClassName = "text-white/70 hover:text-white transition-colors";

    return (
        <header>
            {/* Desktop/Tablet Navbar */}
            <nav className="hidden md:flex fixed top-4 left-0 right-0 z-50 justify-center px-4">
                <div className="flex items-center justify-between w-full max-w-[850px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-lg lg:px-3 py-1.5">
                    {/* Left: Logo */}
                    <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 flex-shrink-0 pl-3">
                        <Logo className="w-8 h-auto text-white" />
                        <span className="text-white font-bold text-xl hidden lg:inline">nutshel</span>
                    </Link>

                    {/* Center: Nav Links */}
                    <div className="flex items-center font-medium text-base">
                        <div 
                            ref={featuresRef}
                            className="relative"
                            onMouseEnter={() => setFeaturesOpen(true)}
                            onMouseLeave={() => setFeaturesOpen(false)}
                        >
                            <NavLink 
                                to="/features" 
                                className={`${inactiveLinkClassName} flex items-center gap-1.5 md:px-3 lg:px-4 py-2`}
                                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            >
                                Features <ChevronDownIcon className="w-4 h-4 text-white/50" />
                            </NavLink>
                            {isFeaturesOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl pt-4 px-2 pb-2">
                                    {features.map((feature) => (
                                        <Link 
                                            key={feature.name} 
                                            to={feature.path || '/features'} 
                                            onClick={() => setFeaturesOpen(false)}
                                            className="block px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white rounded-md text-sm transition-colors duration-200"
                                        >
                                            {feature.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        {navLinks.filter(l => l.name !== 'Features').map(link => (
                            <NavLink 
                                key={link.name} 
                                to={link.path} 
                                className={`${inactiveLinkClassName} md:px-3 lg:px-4 py-2`}
                                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right: Auth Buttons */}
                    <div className="flex items-center md:gap-1 lg:gap-2 text-base">
                        {session ? (
                             <Link to="/profile" className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 mr-2">
                                <UserIcon className="w-6 h-6" />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className={`${inactiveLinkClassName} font-medium md:px-3 lg:px-4 py-2`}>Log in</Link>
                                <Link to="/signup" className="bg-nutshel-blue text-black hover:opacity-90 transition-opacity md:px-3 lg:px-4 py-1.5 rounded-full font-semibold">Sign up</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            
            {/* Mobile Navbar */}
            <nav className="md:hidden fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center justify-between p-4 bg-nutshel-gray-dark/80 backdrop-blur-lg">
                     <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2">
                         <Logo className="w-7 h-auto text-white" />
                         <span className="text-white font-bold text-xl">nutshel</span>
                    </Link>
                    <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="text-white z-50">
                        {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                    </button>
                </div>
                 {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 top-0 bg-nutshel-gray-dark pt-24 flex flex-col items-center gap-8"
                        onClick={(e) => { if (e.target === e.currentTarget) setMobileMenuOpen(false); }}
                    >
                        {navLinks.map(link => (
                            <NavLink 
                                key={link.name} 
                                to={link.path} 
                                className="text-white/80 hover:text-white transition-colors text-2xl font-medium"
                                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        <div className="absolute bottom-16 flex flex-col items-center gap-4 w-full px-8">
                            {session ? (
                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="bg-nutshel-blue text-black hover:opacity-90 transition-opacity w-full text-center py-3 rounded-full text-lg font-semibold flex items-center justify-center gap-2">
                                    <UserIcon className="w-5 h-5" />
                                    My Profile
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-white transition-colors w-full text-center text-lg border border-white/20 py-3 rounded-full">Log In</Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="bg-nutshel-blue text-black hover:opacity-90 transition-opacity w-full text-center py-3 rounded-full text-lg font-semibold">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;