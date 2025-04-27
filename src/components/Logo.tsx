
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-trustlens-blue rounded-full opacity-20 animate-pulse-slow"></div>
      <svg 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="relative z-10"
      >
        <path 
          d="M32 4C16.536 4 4 16.536 4 32C4 47.464 16.536 60 32 60C47.464 60 60 47.464 60 32C60 16.536 47.464 4 32 4Z" 
          stroke="#007BFF" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M32 20C25.373 20 20 25.373 20 32C20 38.627 25.373 44 32 44C38.627 44 44 38.627 44 32C44 25.373 38.627 20 32 20Z" 
          stroke="#003566" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M32 28C29.791 28 28 29.791 28 32C28 34.209 29.791 36 32 36C34.209 36 36 34.209 36 32C36 29.791 34.209 28 32 28Z" 
          fill="#28A745" 
        />
      </svg>
    </div>
  );
};

export default Logo;
