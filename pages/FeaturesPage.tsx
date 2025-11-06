import React from 'react';
import { Link } from 'react-router-dom';
import { features } from '../constants';

const FeaturesPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-24 animate-pageFadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              A Powerful Suite of Creative Tools
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
                From initial idea to final export, Nutshel provides everything you need to create stunning visuals without the hassle.
            </p>
        </div>

        <div className="mt-20 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Link 
              to={feature.path}
              key={feature.name}
              className="bg-nutshel-gray border border-white/10 rounded-xl p-8 flex flex-col items-start opacity-0 animate-cardFadeIn transition-all duration-300 hover:bg-white/5 hover:border-white/20 hover:-translate-y-1"
              style={{ animationDelay: `${100 * index}ms` }}
            >
              <div className="p-3 rounded-full bg-nutshel-blue/10 border border-nutshel-blue/20">
                <svg className="w-6 h-6 text-nutshel-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">{feature.name}</h3>
              <p className="mt-2 text-base text-gray-400">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;