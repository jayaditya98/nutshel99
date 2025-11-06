
import React from 'react';
import { Link } from 'react-router-dom';
import { features } from '../constants';
import { Logo } from './Icons';

const Footer: React.FC = () => {
    return (
        <footer className="bg-nutshel-gray-dark border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2">
                             <Logo className="w-7 h-7 text-white" />
                             <span className="text-white font-bold text-2xl">nutshel</span>
                        </Link>
                        <p className="mt-4 text-sm text-gray-400">Your one stop destination for all creative work.</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Features</h3>
                        <ul className="mt-4 space-y-2">
                            {features.slice(0, 5).map(feature => (
                                <li key={feature.name}>
                                    <Link to="/features" className="text-base text-gray-400 hover:text-white">{feature.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Explore</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/explore" className="text-base text-gray-400 hover:text-white">Gallery</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Nutshel For</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#" className="text-base text-gray-400 hover:text-white">Brands</a></li>
                            <li><a href="#" className="text-base text-gray-400 hover:text-white">Freelancers</a></li>
                            <li><a href="#" className="text-base text-gray-400 hover:text-white">Agencies</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="text-base text-gray-400 hover:text-white">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Nutshel. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;