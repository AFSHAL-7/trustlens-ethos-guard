
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, BarChart3, Users, ArrowRight, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Document Analysis",
      description: "Upload privacy policies and terms of service for comprehensive AI-powered analysis."
    },
    {
      icon: <Shield className="h-8 w-8 text-accent" />,
      title: "Risk Assessment",
      description: "Get detailed risk scores and recommendations for consent decisions."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-secondary" />,
      title: "Analytics Dashboard",
      description: "Track your privacy analysis history and consent patterns over time."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "User Management",
      description: "Manage user accounts and access controls with comprehensive admin tools."
    }
  ];

  const stats = [
    { icon: <CheckCircle className="h-5 w-5" />, label: "Analyses Completed", value: "10,000+" },
    { icon: <AlertTriangle className="h-5 w-5" />, label: "Risk Issues Found", value: "2,500+" },
    { icon: <Lock className="h-5 w-5" />, label: "Privacy Protected", value: "100%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-green-50/50 dark:from-gray-900/50 dark:via-background dark:to-gray-800/50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              AI-Powered
              <span className="text-primary block">Consent Analysis</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Analyze privacy policies and terms of service with advanced AI to make informed consent decisions and protect your digital rights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <Button 
                  size="lg" 
                  className="btn-primary text-lg px-8 py-4 h-auto group"
                  onClick={() => navigate('/analyzer')}
                >
                  Start Analysis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="btn-primary text-lg px-8 py-4 h-auto group"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-4 h-auto"
                    onClick={() => navigate('/analyzer')}
                  >
                    Try Demo
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto px-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center justify-center gap-2 text-muted-foreground">
                  {stat.icon}
                  <div className="text-center sm:text-left">
                    <div className="font-semibold text-foreground text-lg sm:text-base">{stat.value}</div>
                    <div className="text-xs sm:text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powerful Features for Privacy Protection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to understand and analyze digital consent documents with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover animate-fade-in border-border/50" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg md:text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-muted-foreground text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 animate-fade-in">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Protect Your Privacy?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust TrustLens to analyze their digital consent documents and make informed privacy decisions.
              </p>
              <Button 
                size="lg" 
                className="btn-primary text-lg px-8 py-4 h-auto group"
                onClick={() => navigate(user ? '/analyzer' : '/auth')}
              >
                {user ? 'Start Analysis' : 'Sign Up Now'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
