import React, { useState } from 'react';
import { pricingTiers, faqData } from '../constants';
import { CheckIcon, ChevronDownIcon } from '../components/Icons';

type FaqItemProps = { faq: { question: string, answer: string } };

// FIX: Explicitly typed `FaqItem` as a `React.FC` to correctly handle the `key` prop, which is managed by React and not passed to the component.
const FaqItem: React.FC<FaqItemProps> = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-6 text-left px-2 rounded-md transition-colors hover:bg-white/5">
                <span className="text-lg font-medium">{faq.question}</span>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <p className="pb-6 text-gray-400 px-2">{faq.answer}</p>}
        </div>
    )
}

const PricingPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-24 animate-pageFadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Flexible Plans for Every Creator</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
                Choose the plan that fits your creative needs. No hidden fees, cancel anytime.
            </p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-nutshel-gray border ${tier.popular ? 'border-nutshel-blue' : 'border-white/10'} rounded-2xl p-8 flex flex-col transition-transform duration-300 hover:-translate-y-2`}
            >
              {tier.popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-nutshel-blue text-black text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>}
              <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
              {tier.credits && <p className="mt-2 text-sm text-gray-400">{tier.credits}</p>}
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-400">{tier.period}</span>
              </div>
              <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-nutshel-blue flex-shrink-0 mr-2 mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`mt-10 w-full py-3 rounded-full font-semibold transition-colors ${tier.popular ? 'bg-nutshel-blue text-black hover:opacity-90' : 'bg-white/10 hover:bg-white/20'}`}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

         <div className="mt-24">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight">Common Questions</h2>
                <div className="mt-12">
                    {faqData.map((faq, index) => <FaqItem key={index} faq={faq} />)}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;