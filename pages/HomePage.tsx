import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useForm, ValidationError } from '@formspree/react';
import { features, problemsAndSolutions, faqData, socialProofBrands } from '../constants';
import { ArrowDownIcon, CheckIcon, ChevronDownIcon, BrandLogoPlaceholder } from '../components/Icons';
import Footer from '../components/Footer';

// --- Hero Section ---
const HeroSection = ({ isDesktop }: { isDesktop: boolean }) => {
    const [scrollStyle, setScrollStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const scrollRange = 500; // The effect will happen over the first 500px of scroll
            
            const progress = Math.min(1, scrollY / scrollRange);
            const scale = 1 - progress * 0.4; // Scales down from 1 to 0.6
            const opacity = 1 - progress; // Fades out linearly

            setScrollStyle({
                transform: `scale(${scale})`,
                opacity: opacity,
                zIndex: 10, // A fixed z-index for the hero text
                willChange: 'transform, opacity', // Performance optimization
                pointerEvents: progress >= 1 ? 'none' : 'auto',
            });
        };

        if (isDesktop) {
            window.addEventListener('scroll', handleScroll);
            handleScroll(); // Initial call
        } else {
            setScrollStyle({}); // Clear styles if not desktop
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isDesktop]);

    const handleScrollDown = () => {
        const nextSection = document.getElementById('solutions-section');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        // This outer div now acts as a spacer, reserving the viewport height for the hero area.
        <div className="relative h-screen">
            {/* The content is now conditionally fixed for desktop, and relative for mobile/tablet to allow normal scrolling. */}
            <div 
                className={`${isDesktop ? 'fixed' : 'relative h-full'} inset-0 flex flex-col items-center justify-center text-center px-4`} 
                style={isDesktop ? scrollStyle : {}}
            >
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white opacity-0 animate-heroFadeIn">
                    The Playground for Creativity
                </h1>
                <p 
                    className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300 opacity-0 animate-heroFadeIn"
                    style={{ animationDelay: '0.2s' }}
                >
                    Your one stop destination for all creative work. Dream, Create, Repeat.
                </p>
                <Link 
                    to="/signup" 
                    className="mt-8 inline-block bg-nutshel-blue text-black font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-heroFadeIn"
                    style={{ animationDelay: '0.6s' }}
                >
                    Try for free
                </Link>
            </div>
             {/* Functional and centered scroll-down button */}
             <button
                onClick={handleScrollDown}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 p-2 rounded-full focus:outline-none"
                aria-label="Scroll to next section"
            >
                <ArrowDownIcon className="w-8 h-8 text-gray-500 animate-bounce" />
            </button>
        </div>
    );
};


// --- Problem & Solutions Section ---
const ProblemSolutionsSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);
    const currentSolution = problemsAndSolutions[activeIndex];

    useEffect(() => {
        const intervalId = setInterval(() => {
            setActiveIndex(currentIndex => (currentIndex + 1) % problemsAndSolutions.length);
        }, 3500);

        return () => clearInterval(intervalId);
    }, [activeIndex]);

    return (
        <div className="bg-nutshel-gray min-h-screen flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-6xl mx-auto">
                <div className="relative text-center mb-20 py-4">
                    <h2 className="relative z-10 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                        Stop Juggling. Start <span className="text-nutshel-blue">Creating.</span>
                    </h2>
                    <p className="relative z-10 mt-3 text-base text-gray-400 max-w-2xl mx-auto">Nutshel solves the biggest headaches for modern creators.</p>
                </div>
                
                {/* Desktop View */}
                <div className="hidden lg:block relative">
                    <div className="absolute -top-28 left-0 right-0 px-4 md:px-8 lg:px-12 flex justify-between pointer-events-none">
                        <div className="flex flex-col items-center">
                            <p className="text-base font-semibold text-red-500 mb-1">your problems</p>
                            <img 
                                src="https://i.postimg.cc/t49mKfg2/Untitled-design-4-Background-Removed.png" 
                                alt="Doodle arrow pointing to problems" 
                                className="h-28" 
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-base font-semibold text-green-500 mb-1">our solutions</p>
                            <img 
                                src="https://i.postimg.cc/xC85fVrx/Untitled-design-3-Background-Removed.png" 
                                alt="Doodle arrow pointing to solutions" 
                                className="h-28" 
                            />
                        </div>
                    </div>
                    
                    <div className="bg-nutshel-gray-dark border border-white/10">
                        <div className="grid grid-cols-1 lg:grid-cols-5 items-stretch">
                            <div className="lg:col-span-2 grid grid-rows-6 h-full">
                                {problemsAndSolutions.map((item, index) => (
                                    <button
                                        key={item.problem}
                                        onClick={() => setActiveIndex(index)}
                                        className={`w-full h-full flex items-center text-left text-lg font-semibold transition-colors duration-300 px-6 md:px-10 py-4 lg:py-0 ${
                                            activeIndex === index
                                                ? 'bg-white/10 text-white'
                                                : 'text-gray-600 hover:text-gray-400'
                                        }`}
                                    >
                                        {item.problem}
                                    </button>
                                ))}
                            </div>

                            <div className="lg:col-span-3 min-h-[200px] lg:min-h-[250px] flex items-center px-6 md:px-10 bg-white/10">
                                {currentSolution && (
                                    <p 
                                        key={currentSolution.problem}
                                        className="text-xl text-gray-300 animate-fadeIn"
                                    >
                                        {currentSolution.solution}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile/Tablet Accordion View */}
                <div className="lg:hidden w-full max-w-2xl mx-auto space-y-2">
                    {problemsAndSolutions.map((item, index) => (
                        <div key={item.problem} className="bg-nutshel-gray-dark border border-white/10 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setOpenAccordionIndex(openAccordionIndex === index ? null : index)}
                                className="w-full flex justify-between items-center p-5 text-left"
                                aria-expanded={openAccordionIndex === index}
                                aria-controls={`solution-${index}`}
                            >
                                <span className="text-base sm:text-lg font-semibold text-white">{item.problem}</span>
                                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${openAccordionIndex === index ? 'rotate-180' : ''}`} />
                            </button>
                            {openAccordionIndex === index && (
                                <div id={`solution-${index}`} className="px-5 pb-5 animate-fadeIn">
                                    <p className="text-gray-300">{item.solution}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- Features Section ---
const FeaturesSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.15 }
        );

        const currentRef = sectionRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div ref={sectionRef} className="min-h-screen flex flex-col justify-center items-center bg-nutshel-gray-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><br></br><br></br>
                <div className="text-center mb-20">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">Everything You Need. All in One Place.</h2>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">Discover a seamless creative workflow with our powerful features.</p>
                </div>
                <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <Link
                            to={feature.path}
                            key={feature.name}
                            className={`block bg-black/20 p-6 rounded-lg border border-white/10 transition-all duration-300 hover:bg-white/5 hover:border-white/20 hover:-translate-y-1 ${isVisible ? 'opacity-100 animate-cardFadeIn' : 'opacity-0'}`}
                            style={{ animationDelay: `${100 * index}ms` }}
                        >
                            <h3 className="text-xl font-semibold text-white">{feature.name}</h3>
                            <p className="mt-2 text-gray-400">{feature.description}</p>
                        </Link>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Link to="/features" className="text-nutshel-blue font-semibold hover:underline">
                        Explore all features &rarr;
                    </Link>
                </div><br></br>
            </div>
        </div>
    );
};


// --- Social Proof Section ---
const SocialProofSection = () => (
    <div className="py-24 sm:py-32 overflow-hidden bg-nutshel-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-semibold text-gray-400">
                Brands that Love Nutshel
            </h2>
            <div className="relative mt-12">
                <div className="flex animate-marquee-infinite space-x-12">
                     {socialProofBrands.concat(socialProofBrands).map((brand, index) => (
                        <div key={index} className="flex-shrink-0">
                            <BrandLogoPlaceholder name={brand} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <style>{`
            @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
            .animate-marquee-infinite { animation: marquee 30s linear infinite; }
        `}</style>
    </div>
);

// --- FAQ Section ---
type FaqItemProps = { faq: { question: string, answer: string } };

// FIX: Corrected typo in type annotation from FqItemProps to FaqItemProps.
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

const FAQSection = () => (
    <div className="py-24 sm:py-32 bg-nutshel-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">Frequently Asked Questions</h2>
                <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">Find quick answers to common questions about Nutshel.</p>
            </div>
            <div className="max-w-3xl mx-auto">
                {faqData.map((faq, index) => <FaqItem key={index} faq={faq} />)}
            </div>
        </div>
    </div>
);

// --- Contact Us Section ---
const ContactUsSection = () => {
    const [state, handleSubmit] = useForm("mblppjpk");

    if (state.succeeded) {
        return (
            <div className="py-24 sm:py-32 bg-nutshel-gray">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12 items-center">
                        <div className="text-center lg:text-left">
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                                Thank You!
                            </h2>
                            <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto lg:mx-0">
                                Your message has been sent successfully. Our team will get back to you as soon as possible.
                            </p>
                        </div>
                        <div className="w-full max-w-lg mx-auto lg:mx-0">
                            <div className="bg-nutshel-gray-dark border border-white/10 rounded-2xl p-8 min-h-[440px] flex items-center justify-center">
                                <CheckIcon className="w-24 h-24 text-green-500 animate-draw-check" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-24 sm:py-32 bg-nutshel-gray">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12 items-center">
                    {/* Left Column: Text */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                            Get in Touch
                        </h2>
                        <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto lg:mx-0">
                            Have a question, feedback, or a partnership inquiry? Fill out the form and our team will get back to you as soon as possible.
                        </p>
                    </div>

                    {/* Right Column: Form */}
                    <div className="w-full max-w-lg mx-auto lg:mx-0">
                        <form onSubmit={handleSubmit} className="space-y-6 bg-nutshel-gray-dark border border-white/10 rounded-2xl p-8">
                            <div>
                                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-300">Full Name</label>
                                <input
                                    type="text"
                                    id="contact-name"
                                    name="name"
                                    required
                                    className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-nutshel-blue focus:border-nutshel-blue form-input-custom"
                                />
                                <ValidationError 
                                    prefix="Name" 
                                    field="name"
                                    errors={state.errors}
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-300">Email Address</label>
                                <input
                                    type="email"
                                    id="contact-email"
                                    name="email"
                                    required
                                    className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-nutshel-blue focus:border-nutshel-blue form-input-custom"
                                />
                                <ValidationError 
                                    prefix="Email" 
                                    field="email"
                                    errors={state.errors}
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-300">Message</label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    rows={4}
                                    className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-nutshel-blue focus:border-nutshel-blue form-input-custom"
                                />
                                <ValidationError 
                                    prefix="Message" 
                                    field="message"
                                    errors={state.errors}
                                    className="text-red-500 text-sm mt-1"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={state.submitting}
                                className="w-full py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-black bg-nutshel-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-nutshel-gray-dark focus:ring-nutshel-blue transition-all duration-300 ease-in-out shadow-[0_0_10px_rgba(251,191,36,0.2)] hover:shadow-[0_0_18px_rgba(251,191,36,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                {state.submitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};


const HomePage: React.FC = () => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const handleWheelScroll = (event: WheelEvent) => {
            // Check if the user is at the top of the page and scrolling down
            if (window.scrollY === 0 && event.deltaY > 0) {
                // Prevent the default scroll behavior to enable custom snapping
                event.preventDefault();
                
                const nextSection = document.getElementById('solutions-section');
                if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };
        
        if (isDesktop) {
            // Add the event listener with passive: false to allow preventDefault
            window.addEventListener('wheel', handleWheelScroll, { passive: false });
        }

        // Cleanup: remove the event listener when the component unmounts or view changes
        return () => {
            window.removeEventListener('wheel', handleWheelScroll);
        };
    }, [isDesktop]);

    return (
        <div className="mt-[-5rem] isolate">
            <style>{`
                .grid-background-vignette {
                    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
                    background-size: 4rem 4rem;
                    mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, black 30%, transparent 60%);
                    -webkit-mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, black 30%, transparent 60%);
                }
                @keyframes heroFadeIn {
                    from { opacity: 0; transform: translateY(1rem); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-heroFadeIn {
                    animation: heroFadeIn 1s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(1rem); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
                @keyframes draw-check {
                    from { stroke-dashoffset: 50; }
                    to { stroke-dashoffset: 0; }
                }
                .animate-draw-check path {
                    stroke-dasharray: 50;
                    stroke-dashoffset: 50;
                    animation: draw-check 0.5s ease-out forwards 0.2s;
                }
            `}</style>
            <div className="fixed inset-0 -z-10 grid-background-vignette"></div>
            <HeroSection isDesktop={isDesktop} />
            
            {/* 
              On mobile and tablet, the scroll effects are disabled, and this becomes a standard
              content flow. On desktop, the z-index and sticky positioning create the scroll-over effect.
            */}
            <div className={isDesktop ? "relative z-20" : ""}>
                <div className={isDesktop ? "relative" : ""}>
                    <div id="solutions-section" className={isDesktop ? "sticky top-0 h-screen z-30" : ""}>
                        <ProblemSolutionsSection />
                    </div>

                    <div className={isDesktop ? "relative z-40" : ""}>
                        <FeaturesSection />
                        <SocialProofSection />
                        <FAQSection />
                        <ContactUsSection />
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;