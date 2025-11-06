
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'default', ...props }) => {
  const baseClasses = 'font-semibold rounded-full transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-nutshel-gray-dark disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-nutshel-blue hover:opacity-90 text-black focus:ring-nutshel-blue',
    secondary: 'bg-white/10 hover:bg-white/20 text-white focus:ring-white/50',
    ghost: 'bg-transparent text-white/70 hover:text-white',
  };

  const sizeClasses = {
    default: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
    icon: 'h-12 w-12 flex items-center justify-center',
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
