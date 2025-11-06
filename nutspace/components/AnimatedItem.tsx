import React, { useState, useEffect, useRef, RefObject } from 'react';

const useScrollAnimation = <T extends HTMLElement>(options?: { threshold?: number; rootMargin?: string; triggerOnce?: boolean }): [RefObject<T>, boolean] => {
    const elementRef = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (options?.triggerOnce && elementRef.current) {
                        observer.unobserve(elementRef.current);
                    }
                }
            },
            {
                threshold: options?.threshold || 0.1,
                rootMargin: options?.rootMargin || '0px',
            }
        );

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [options]);

    return [elementRef, isVisible];
};

interface AnimatedItemProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, className, delay = 0 }) => {
    const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ triggerOnce: true });

    return (
        <div
            ref={ref}
            className={`scroll-fade-in ${isVisible ? 'is-visible' : ''} ${className || ''}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};
