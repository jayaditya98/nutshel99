import React, { useState, useRef, useEffect, useCallback } from 'react';

// A standardized button for the contextual toolbar
// FIX: Converted to forwardRef to allow passing refs, and made onClick optional to support use as a popover trigger.
export const ToolbarButton = React.forwardRef<
    HTMLButtonElement,
    {
        onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
        children: React.ReactNode;
        label: string;
        isActive?: boolean;
        disabled?: boolean;
    }
>(({ onClick, children, label, isActive = false, disabled = false }, ref) => (
    <button
        ref={ref}
        onClick={onClick}
        title={label}
        aria-label={label}
        disabled={disabled}
        className={`p-2 rounded-md ${isActive ? 'bg-nutshel-blue text-black' : 'hover:bg-white/10'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
    >
        {children}
    </button>
));
ToolbarButton.displayName = 'ToolbarButton';

// A vertical divider for separating sections in the toolbar
export const ToolbarDivider: React.FC = () => (
    <div className="border-l border-white/10 h-6 mx-2" />
);

// A generic popover component for toolbar menus
export const ToolbarPopover: React.FC<{
    // FIX: Changed React.ReactElement to React.ReactElement<any> to fix overload error on React.cloneElement.
    trigger: React.ReactElement<any>;
    children: React.ReactNode;
}> = ({ trigger, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const handleClose = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)
            ) {
                handleClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, handleClose]);

    return (
        <div className="relative">
            {React.cloneElement(trigger, { ref: triggerRef, onClick: () => setIsOpen(p => !p) })}
            {isOpen && (
                <div 
                    ref={popoverRef} 
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-nutshel-gray-dark border border-white/10 rounded-lg shadow-xl p-2 z-20"
                    onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) {
                            handleClose();
                        }
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
};