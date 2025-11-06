
import React, { useState } from 'react';

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-white"
      >
        <span>{question}</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-nutshel-blue' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-400 pr-6">
          {children}
        </div>
      )}
    </div>
  );
};

export const Faq: React.FC = () => {
  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">Frequently Asked Questions</h2>
      </div>
      <div className="max-w-3xl mx-auto">
        <FaqItem question="How does the AI work?">
          <p>Our application uses a state-of-the-art generative AI model (`gemini-2.5-flash-image`). When you upload an image, the AI analyzes the subject's features. It then uses your selected pose, lighting, and style prompts to create a brand new, high-quality image that matches your criteria while retaining the likeness of the original subject.</p>
        </FaqItem>
        <FaqItem question="What happens to my uploaded photos?">
          <p>We prioritize your privacy. Your uploaded images are processed securely and are only used to generate your requested photos. They are not stored long-term on our servers or used for any other purpose. All processing is automated.</p>
        </FaqItem>
        <FaqItem question="Can I use the generated images for commercial purposes?">
          <p>Yes, the images you generate are yours to use for personal and commercial projects, such as advertising, e-commerce listings, and social media marketing. You own the copyright to the final generated images.</p>
        </FaqItem>
        <FaqItem question="What kind of images work best?">
          <p>For the best results, use a clear, well-lit photo where the subject's face is clearly visible. While our AI can handle lower-quality images, starting with a better source image will generally yield more accurate and detailed results.</p>
        </FaqItem>
      </div>
    </section>
  );
};
