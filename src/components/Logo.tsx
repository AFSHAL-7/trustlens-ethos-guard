
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
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img 
        src="/lovable-uploads/d38a1a89-1273-40ff-85f8-ea44bf7a7b80.png" 
        alt="TrustLens Logo" 
        className="absolute inset-0 object-contain z-10"
      />
    </div>
  );
};

export default Logo;
