import React from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { Link } from 'react-router-dom';
import { AnimatedItem } from '../components/AnimatedItem';

const GradientHeading: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
        {children}
    </h1>
);

const StudioFeatureCard: React.FC<{ title: string; imageUrl: string }> = ({ title, imageUrl }) => (
    <div className="group h-full">
        <div 
          className="relative rounded-xl overflow-hidden aspect-video bg-cover bg-center group transition-all duration-300 ease-in-out border border-white/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-nutshel-accent/20 hover:border-white/20"
        >
          <img src={imageUrl} alt={title} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all flex items-center justify-center">
             <svg className="w-12 h-12 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
          </div>
        </div>
        <h3 className="text-lg font-bold mt-3">{title}</h3>
    </div>
);

const SuiteToolCard: React.FC<{ title: string; description: string; }> = ({ title, description }) => (
    <div className="bg-nutshel-gray rounded-xl p-6 transition-all duration-300 ease-in-out border border-white/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-nutshel-accent/20 hover:border-white/20 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
      <Link to="/suite" className="text-sm font-semibold text-nutshel-accent mt-4 inline-block hover:underline">Learn more →</Link>
    </div>
);

const Dashboard: React.FC = () => {
  const { projects } = useProjects();
  const recentProjects = projects.slice(0, 4);
  const studioFeatures = [
    { title: "Product Photoshoots", imageUrl: "https://picsum.photos/seed/product_photography/800/450" },
    { title: "Model Shoots", imageUrl: "https://picsum.photos/seed/fashion_model/800/450" },
    { title: "Clone Shoots", imageUrl: "https://picsum.photos/seed/style_transfer/800/450" },
    { title: "Image Composer", imageUrl: "https://picsum.photos/seed/digital_composition/800/450" }
  ];
  const suiteTools = [
      { title: "Image Upscale", description: "Increase image resolution with AI." },
      { title: "Background Removal", description: "Isolate subjects with one click." },
      { title: "Extend Image", description: "Expand your canvas contextually." }
  ];


  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      <header className="space-y-4">
        <GradientHeading>Welcome to your Nutspace</GradientHeading>
        <p className="text-gray-300 text-lg">Your central hub for creating, managing, and exploring AI-powered visuals.</p>
      </header>

       <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Recently Used</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProjects.map((project, index) => (
            <AnimatedItem key={project.id} delay={index * 100}>
              <Link to={`/project/${project.id}`} className="block bg-nutshel-gray rounded-xl p-4 transition-all duration-300 ease-in-out border border-white/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-nutshel-accent/20 hover:border-white/20 h-full">
                <div className="h-24 bg-cover bg-center rounded-md mb-3" style={{ backgroundImage: `url(https://picsum.photos/seed/${project.bannerSeed}/400/200)` }}></div>
                <h3 className="font-bold truncate">{project.name}</h3>
                <p className="text-sm text-gray-400">{project.generations.length} assets</p>
              </Link>
            </AnimatedItem>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Explore Nutshel Studios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studioFeatures.map((feature, index) => (
            <AnimatedItem key={feature.title} delay={index * 100}>
              <Link to="/studios" className="h-full block">
                <StudioFeatureCard title={feature.title} imageUrl={feature.imageUrl} />
              </Link>
            </AnimatedItem>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">From Edit Images</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {suiteTools.map((tool, index) => (
              <AnimatedItem key={tool.title} delay={index * 100}>
                <SuiteToolCard title={tool.title} description={tool.description} />
              </AnimatedItem>
            ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;