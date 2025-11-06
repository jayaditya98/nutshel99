import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EditIcon, GridIcon } from '../components/Icons';
import { AnimatedItem } from '../components/AnimatedItem';

const studios = [
  {
    title: 'Product Photoshoots',
    description: 'Generate professional, high-resolution product photos in any style or setting imaginable.',
    imageSeed: 'product_photography'
  },
  {
    title: 'Model Shoots',
    description: 'Create realistic model shoots with customizable models, poses, and apparel without a camera.',
    imageSeed: 'fashion_model'
  },
  {
    title: 'Clone Shoots',
    description: 'Transfer styles, poses, and compositions from one image to another with incredible accuracy.',
    imageSeed: 'style_transfer'
  },
  {
    title: 'Image Composer',
    description: 'Combine multiple elements, characters, and backgrounds to create entirely new, coherent scenes.',
    imageSeed: 'digital_composition'
  }
];

const allGenerations = [
  'studio_gen_1', 'studio_gen_2', 'studio_gen_3', 'studio_gen_4', 'studio_gen_5',
  'studio_gen_6', 'studio_gen_7', 'studio_gen_8', 'studio_gen_9', 'studio_gen_10'
];

const StudioCard: React.FC<{ title: string; description: string; imageSeed: string }> = ({ title, description, imageSeed }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bg-nutshel-gray rounded-2xl border border-white/10 flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-nutshel-accent/20 hover:border-white/20 cursor-pointer overflow-hidden h-full">
      <div className="aspect-video relative bg-white/5">
        {isLoading && (
          <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
        )}
        <img
          src={`https://picsum.photos/seed/${imageSeed}/600/338`}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-base font-bold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
};


const NutshelStudios: React.FC = () => {
  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="space-y-2 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          Nutshel Studios
        </h1>
        <p className="text-gray-300 text-lg">Your personal AI-powered photography studio. No camera required.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {studios.map((studio, index) => (
          <AnimatedItem key={studio.title} delay={index * 100}>
            <Link 
              to={studio.title === 'Product Photoshoots' ? '/product-photoshoots' : '/canvas'} 
              state={{ studioTitle: studio.title }}
            >
              <StudioCard title={studio.title} description={studio.description} imageSeed={studio.imageSeed} />
            </Link>
          </AnimatedItem>
        ))}
      </div>
      
      <section className="space-y-6">
        <header>
            <h2 className="text-3xl font-semibold">All generations</h2>
            <p className="text-gray-400 mt-1">A library of all images and assets generated in the studios.</p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {allGenerations.map((genSeed, index) => (
                <AnimatedItem key={index} delay={index * 50}>
                    <div className="relative aspect-square bg-nutshel-gray rounded-lg overflow-hidden group border border-white/10 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-white/20">
                    <img 
                            src={`https://picsum.photos/seed/${genSeed}/400/400`} 
                            alt={`Generated asset ${index + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center gap-2">
                            <Link to="/canvas" state={{ imageSeed: genSeed, imageName: `Generated asset ${index + 1}` }} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors" title="Edit in Canvas">
                                <EditIcon className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </AnimatedItem>
            ))}
        </div>
      </section>
    </div>
  );
};

export default NutshelStudios;