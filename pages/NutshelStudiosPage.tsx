import React from 'react';

const studioFeatures = [
  {
    title: 'Product Photoshoots',
    description: 'Generate professional, high-resolution product photos in any style or setting imaginable.',
    imageUrl: 'https://images.unsplash.com/photo-1596854273338-cbf078ec7071?q=80&w=2070&auto=format&fit=crop'
  },
  {
    title: 'Model Shoots',
    description: 'Create realistic model shoots with customizable models, poses, and apparel without a camera.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436a0976f2?q=80&w=2070&auto=format&fit=crop'
  },
  {
    title: 'Clone Shoots',
    description: 'Transfer styles, poses, and compositions from one image to another with incredible accuracy.',
    imageUrl: 'https://images.unsplash.com/photo-1551522435-a131bf538a74?q=80&w=2070&auto=format&fit=crop'
  },
  {
    title: 'Image Composer',
    description: 'Combine multiple elements, characters, and backgrounds to create entirely new, coherent scenes.',
    imageUrl: 'https://images.unsplash.com/photo-1561524383-9363556c4912?q=80&w=1974&auto=format&fit=crop'
  }
];

const NutshelStudiosPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-24 animate-pageFadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">Nutshel Studios</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            Your personal AI-powered photography studio. No camera required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {studioFeatures.map((feature, index) => (
            <div 
              key={feature.title}
              className="relative group bg-nutshel-gray border border-white/10 rounded-2xl p-8 flex flex-col justify-end min-h-[400px] overflow-hidden opacity-0 animate-cardFadeIn"
              style={{ animationDelay: `${100 * index}ms` }}
            >
              <img src={feature.imageUrl} alt={feature.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-base text-gray-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutshelStudiosPage;
