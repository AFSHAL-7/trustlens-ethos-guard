
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, BarChart3, Users, ArrowRight, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import { Skeleton } from '@/components/ui/skeleton';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: platformStats, isLoading: statsLoading } = usePlatformStats();

  const features = [
    {
      icon: <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "Document Analysis",
      description: "Upload privacy policies and terms of service for comprehensive AI-powered analysis."
    },
    {
      icon: <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "Risk Assessment",
      description: "Get detailed risk scores and recommendations for consent decisions."
    },
    {
      icon: <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "Analytics Dashboard",
      description: "Track your privacy analysis history and consent patterns over time."
    },
    {
      icon: <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "User Management",
      description: "Manage user accounts and access controls with comprehensive admin tools."
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    return num.toString();
  };

  const stats = [
    { 
      icon: <CheckCircle className="h-5 w-5" />, 
      label: "Analyses Completed", 
      value: statsLoading ? null : formatNumber(platformStats?.totalAnalyses || 0)
    },
    { 
      icon: <AlertTriangle className="h-5 w-5" />, 
      label: "Risk Issues Found", 
      value: statsLoading ? null : formatNumber(platformStats?.totalRiskIssues || 0)
    },
    { 
      icon: <Lock className="h-5 w-5" />, 
      label: "Users Protected", 
      value: statsLoading ? null : formatNumber(platformStats?.totalUsers || 0)
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2">
              AI-Powered
              <span className="text-primary block mt-2">Consent Analysis</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Analyze privacy policies and terms of service with advanced AI to make informed consent decisions and protect your digital rights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              {user ? (
                <Button 
                  size="lg" 
                  className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto group w-full sm:w-auto"
                  onClick={() => navigate('/analyzer')}
                >
                  Start Analysis
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto group w-full sm:w-auto"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto w-full sm:w-auto"
                    onClick={() => navigate('/analyzer')}
                  >
                    Try Demo
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto px-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30">
                  <div className="text-primary">{stat.icon}</div>
                  <div className="text-center">
                    {stat.value === null ? (
                      <Skeleton className="h-6 w-16 mb-1 mx-auto" />
                    ) : (
                      <div className="font-semibold text-foreground text-xl sm:text-2xl">{stat.value}</div>
                    )}
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-16 animate-fade-in px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Powerful Features for Privacy Protection
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to understand and analyze digital consent documents with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover animate-fade-in bg-card border-border" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-base sm:text-lg md:text-xl text-foreground">{feature.title}</CardTitle>
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
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Card className="bg-muted/50 border-border animate-fade-in">
            <CardContent className="py-8 sm:py-10 md:py-12 px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                Ready to Protect Your Privacy?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust Open Lens to analyze their digital consent documents and make informed privacy decisions.
              </p>
              <Button 
                size="lg" 
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto group w-full sm:w-auto"
                onClick={() => navigate(user ? '/analyzer' : '/auth')}
              >
                {user ? 'Start Analysis' : 'Sign Up Now'}
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
