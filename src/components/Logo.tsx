
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "h-6 w-auto", // Smaller size for navbar
    md: "h-12 w-auto", // Medium size for general use
    lg: "h-24 w-auto"  // Larger size for hero sections
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <span className={`font-bold text-primary ${
        size === 'sm' ? 'text-lg' : 
        size === 'md' ? 'text-2xl' : 
        'text-4xl'
      }`}>
        Open Lens
      </span>
    </div>
  );
};

export default Logo;
