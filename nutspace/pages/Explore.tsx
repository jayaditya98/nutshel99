

import React from 'react';
import { GridIcon, SearchIcon } from '../components/Icons';
import { AnimatedItem } from '../components/AnimatedItem';

const categories = ["Cinematic", "Commercial", "Photography", "Styling", "Ads", "Architecture", "Graphic", "Interior"];
const imageSeeds = ["explore1", "explore2", "explore3", "explore4", "explore5", "explore6", "explore7", "explore8", "explore9", "explore10", "explore11", "explore12"];

const Explore: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState('Items');
    const [activeCategory, setActiveCategory] = React.useState('Cinematic');

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header className="space-y-4 text-center">
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    Explore
                </h1>
                <div className="flex justify-center space-x-2 md:space-x-4 overflow-x-auto p-2">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
                                activeCategory === cat 
                                ? 'bg-nutshel-accent text-black' 
                                : 'bg-nutshel-gray text-gray-300 hover:bg-white/10'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <div className="border-b border-white/10">
                <div className="flex space-x-8 px-4">
                    {['Items', 'Boards', 'Contributors'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 text-sm font-semibold transition-colors ${
                                activeTab === tab
                                ? 'text-white border-b-2 border-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {imageSeeds.map((seed, index) => (
                    <AnimatedItem key={seed} delay={index * 50}>
                        <div className="relative group break-inside-avoid">
                            <img 
                                className="rounded-lg w-full h-auto block" 
                                src={`https://picsum.photos/seed/${seed}/${[400,600,800][index%3]}/${[400,600,800][(index+1)%3]}`}
                                alt={`Exploration image ${index + 1}`} 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center gap-2">
                                <button className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors" title="Find Similar">
                                    <SearchIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </AnimatedItem>
                ))}
            </div>
        </div>
    );
};

export default Explore;