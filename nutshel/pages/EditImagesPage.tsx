import React from 'react';

const editingTools = [
  {
    title: 'Image Upscale',
    description: 'Enhance and increase the resolution of any image with AI. Powered by Upscayl.',
    buttonText: 'Upscale Image'
  },
  {
    title: 'Remove background',
    description: 'Isolate the image subject on a transparent background with a single click. Powered by Hugging Face.',
    buttonText: 'Remove Background'
  },
  {
    title: 'Quick Editor',
    description: 'Quickly crop, flip, mirror, or apply professional filters to your images.',
    buttonText: 'Edit Image'
  },
  {
    title: 'Selective Editing',
    description: 'Intelligently change the background, swap objects, or erase unwanted elements from your photos.',
    buttonText: 'Start Editing'
  },
  {
    title: 'Expand Image',
    description: 'Expand the canvas of your image to mutiple aspect ratios and let AI fill in the new areas contextually.',
    buttonText: 'Extend Image'
  }
];

const EditImagesPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-24 animate-pageFadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">Edit Images</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            A collection of powerful, AI-driven tools to perfect your images and bring your creative visions to life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
          {editingTools.map((tool, index) => {
            // This logic centers the last row of items for a more balanced layout.
            // On medium screens, it centers the 5th item.
            // On large screens, it centers the last two items (4th and 5th).
            const alignmentClasses = 
              index < 3
                ? 'lg:col-span-2' // First row of 3 on large screens
                : index === 3
                ? 'lg:col-start-2 lg:col-span-2' // Start of the centered second row on large screens
                : 'md:col-span-2 lg:col-span-2'; // The final item, centered on md and completing the row on lg

            return (
              <div 
                key={tool.title}
                className={`bg-nutshel-gray border border-white/10 rounded-2xl p-8 flex flex-col opacity-0 animate-cardFadeIn transition-all duration-300 hover:-translate-y-1 hover:bg-white/5 hover:border-white/20 ${alignmentClasses}`}
                style={{ animationDelay: `${100 * index}ms` }}
              >
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold text-white">{tool.title}</h3>
                  <p className="mt-3 text-base text-gray-400">{tool.description}</p>
                </div>
                <button className="mt-8 w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-full transition-colors">
                  {tool.buttonText}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EditImagesPage;