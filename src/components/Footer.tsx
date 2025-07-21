
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-4 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-2 md:mb-0">
            <p className="text-sm text-gray-600">
              © 2025 Afshal from XOANON. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-600 hover:text-trustlens-blue transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-trustlens-blue transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-trustlens-blue transition-colors duration-300">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
