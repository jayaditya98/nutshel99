import React from 'react';

const AICanvasPage: React.FC = () => {
    return (
        <div className="py-20 sm:py-24 animate-pageFadeIn">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="rainbow-text text-xl font-bold mb-4 tracking-widest uppercase">Coming Soon</p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">AI Canvas: The Flagship Feature</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-400">
                        Tell AI to edit your media generations—add text, logos, and image layers—using smart layers and an integrated agent chat.
                    </p>
                </div>

                <div className="mt-16 bg-nutshel-gray border border-white/10 rounded-2xl p-4 md:p-8 aspect-[16/10] flex flex-col gap-4">
                    {/* Header/Properties Bar */}
                    <div className="bg-black/20 border border-white/10 rounded-lg h-14 flex items-center justify-between px-4">
                        <p className="text-sm text-gray-300">Properties Bar</p>
                        <button className="bg-nutshel-blue text-black px-4 py-2 rounded-md text-sm font-semibold">Download</button>
                    </div>

                    <div className="flex-grow flex gap-4 min-h-0">
                        {/* Left Sidebar */}
                        <div className="w-1/6 bg-black/20 border border-white/10 rounded-lg p-4 flex flex-col gap-2">
                           <p className="text-sm text-gray-300 mb-2">Tools</p>
                           {['Design', 'Board', 'Palette', 'Shapes', 'Text', 'Custom'].map(tool => (
                               <div key={tool} className="h-10 bg-white/5 rounded-md"></div>
                           ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="w-4/6 flex flex-col gap-4">
                            <div className="flex-grow bg-black/20 border border-white/10 rounded-lg p-4 flex items-center justify-center">
                                <p className="text-gray-500">Canvas</p>
                            </div>
                            <div className="h-20 bg-black/20 border border-white/10 rounded-lg flex items-center justify-center px-4 gap-4">
                                <p className="text-sm text-gray-400 flex-grow">Generate an image of a car</p>
                                <div className="flex gap-2">
                                    {['Upscale', 'Magic Expand', 'File Upload', 'Remove BG'].map(action => (
                                        <div key={action} className="w-10 h-10 bg-white/5 rounded-full" title={action}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-1/6 bg-black/20 border border-white/10 rounded-lg p-4 flex flex-col">
                            <p className="text-sm text-gray-300 mb-2">Nut Agent</p>
                            <div className="flex-grow bg-white/5 rounded-md"></div>
                            <div className="mt-2 h-10 bg-white/5 rounded-md flex items-center px-2">
                                <p className="text-xs text-gray-500">AI Chat...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AICanvasPage;