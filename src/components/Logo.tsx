
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
      <img 
        src="/lovable-uploads/d38a1a89-1273-40ff-85f8-ea44bf7a7b80.png" 
        alt="TrustLens Logo" 
        className={`${sizeClasses[size]} object-contain`}
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
};

export default Logo;
