
import React from 'react';

const Step: React.FC<{ number: string; title: string; description: string }> = ({ number, title, description }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-nutshel-blue text-black font-bold text-xl">
        {number}
      </div>
    </div>
    <div className="ml-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-gray-400">{description}</p>
    </div>
  </div>
);

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">How It Works</h2>
        <p className="text-lg text-gray-400 mt-2">Get professional results in just a few clicks.</p>
      </div>
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-12">
        <Step
          number="1"
          title="Upload Image"
          description="Start with any photo. Our AI works with various qualities, from phone snapshots to professional headshots."
        />
        <Step
          number="2"
          title="Customize Your Shoot"
          description="Select from a library of professional poses, lighting styles, and camera angles to match your creative vision."
        />
        <Step
          number="3"
          title="Generate & Download"
          description="Our AI generates a gallery of high-resolution, studio-quality images, ready for you to download and use."
        />
      </div>
    </section>
  );
};
