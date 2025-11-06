import React from 'react';
import { UserIcon } from '../components/Icons';

const WorkspacePage: React.FC = () => {
    return (
        <div className="py-20 sm:py-24 animate-pageFadeIn">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="flex justify-center items-center mb-6">
                        <div className="p-4 bg-nutshel-blue/10 rounded-full border border-nutshel-blue/20">
                            <UserIcon className="w-10 h-10 text-nutshel-blue" />
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Welcome to Your Workspace</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
                        This is your personal creative hub. All your projects and assets will live here.
                    </p>
                    <p className="mt-2 text-md text-gray-500">(This page is a temporary placeholder - more features coming soon!)</p>
                </div>

                <div className="mt-16 bg-nutshel-gray border border-white/10 rounded-2xl p-8 aspect-[16/9] flex items-center justify-center">
                    <p className="text-2xl text-gray-600 font-semibold">Your projects will appear here.</p>
                </div>
            </div>
        </div>
    );
};

export default WorkspacePage;