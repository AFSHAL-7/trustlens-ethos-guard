import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showLogo, setShowLogo] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Staggered animations
    const timer1 = setTimeout(() => setShowLogo(true), 300);
    const timer2 = setTimeout(() => setShowTagline(true), 800);
    const timer3 = setTimeout(() => setShowContent(true), 1200);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/analyzer');
  };

  return (
    <div className="page-transition">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-12 md:py-24 flex flex-col items-center text-center">
          <div className={`mb-6 transform transition-all duration-700 ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <Logo size="lg" className="mx-auto" />
          </div>
          
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-trustlens-charcoal transition-all duration-700 ${
              showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            TrustLens
          </h1>
          
          <p 
            className={`text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl transition-all duration-700 ${
              showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Transparent AI-powered consent management for the ethical digital world
          </p>
          
          <div 
            className={`transition-all duration-700 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <Button 
              className="bg-trustlens-blue text-white text-lg px-8 py-6 rounded-2xl hover:bg-opacity-90 transition-all"
              onClick={handleGetStarted}
            >
              Get Started 
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* How it Works */}
        <section 
          className={`py-16 transition-all duration-700 ${
            showContent ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h2 className="text-3xl font-bold mb-12 text-center">How TrustLens Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card card-hover">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-6 mx-auto">
                <span className="text-trustlens-blue font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Upload Terms</h3>
              <p className="text-gray-600 text-center">
                Upload or paste the terms and conditions or permission requests you want analyzed.
              </p>
            </div>
            
            <div className="card card-hover">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-6 mx-auto">
                <span className="text-trustlens-blue font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">AI Analysis</h3>
              <p className="text-gray-600 text-center">
                Our advanced AI breaks down complex legal terms into simple language and identifies potential risks.
              </p>
            </div>
            
            <div className="card card-hover">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-6 mx-auto">
                <span className="text-trustlens-blue font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Make Decisions</h3>
              <p className="text-gray-600 text-center">
                Understand the implications and make informed decisions about your data consent.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          className={`py-16 transition-all duration-700 ${
            showContent ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="bg-gradient-to-r from-trustlens-charcoal to-trustlens-blue rounded-2xl p-8 md:p-12 shadow-soft-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-white">Key Features</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-trustlens-green flex items-center justify-center mt-0.5 mr-3">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-lg">Transparent AI-powered analysis</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-trustlens-green flex items-center justify-center mt-0.5 mr-3">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-lg">Simple, human-readable summaries</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-trustlens-green flex items-center justify-center mt-0.5 mr-3">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-lg">Risk detection and highlighting</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-trustlens-green flex items-center justify-center mt-0.5 mr-3">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white text-lg">Consent management history</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&h=400"
                  alt="TrustLens dashboard preview"
                  className="rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Take Control of Your Data?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start using TrustLens today and never blindly accept terms and conditions again.
          </p>
          <Button 
            className="bg-trustlens-green text-white text-lg px-8 py-6 rounded-2xl hover:bg-opacity-90 transition-all"
            onClick={handleGetStarted}
          >
            Analyze Your First Document
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Home;
