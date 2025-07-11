import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (activeTab === 'signup') {
      if (!formData.fullName.trim()) {
        toast.error('Please enter your full name');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first');
      return;
    }

    setResendLoading(true);
    console.log('Resending confirmation email to:', formData.email);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Resend error:', error);
        toast.error(error.message || 'Failed to resend confirmation email');
        return;
      }

      toast.success('Confirmation email sent! Check your inbox and spam folder.', {
        duration: 5000
      });
    } catch (error: any) {
      console.error('Unexpected resend error:', error);
      toast.error('Failed to resend confirmation email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    console.log('Starting signup process for:', formData.email);

    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log('Using redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName.trim()
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
          setActiveTab('signin');
        } else if (error.message.includes('Password')) {
          toast.error('Password requirements not met. Please use a stronger password.');
        } else {
          toast.error(error.message || 'Failed to create account');
        }
        return;
      }

      console.log('Signup response:', data);

      if (data.user && !data.session) {
        setEmailSent(true);
        toast.success('Account created! Please check your email to verify your account.', {
          duration: 8000,
          description: 'Check your inbox and spam folder for the confirmation email from Supabase'
        });
        
        // Show helpful message
        toast.info('Email not received? Check your spam folder or click "Resend Email" below.', {
          duration: 6000
        });
        
        setActiveTab('signin');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '', fullName: '' }));
      } else if (data.session) {
        toast.success('Account created and logged in successfully!');
        navigate('/', { replace: true });
      }

    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    console.log('Starting signin process for:', formData.email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (error) {
        console.error('Sign in error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password, or email not verified yet.', {
            duration: 6000,
            description: 'If you just signed up, please verify your email first',
            action: {
              label: 'Resend Email',
              onClick: handleResendConfirmation
            }
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email before signing in.', {
            duration: 6000,
            action: {
              label: 'Resend Email',
              onClick: handleResendConfirmation
            }
          });
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a moment and try again.');
        } else {
          toast.error(error.message || 'Failed to sign in');
        }
        return;
      }

      console.log('Sign in successful:', data);
      toast.success('Signed in successfully!');
      
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setEmailSent(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetForm();
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-blue-50/50 dark:from-gray-900 dark:via-background dark:to-gray-900/50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-blue-50/50 dark:from-gray-900 dark:via-background dark:to-gray-900/50 p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-2xl border-0 animate-scale-in bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4 space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-foreground">
              Welcome to TrustLens
            </CardTitle>
            <p className="text-muted-foreground text-base">
              AI-powered consent analysis platform
            </p>
            <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-6 mt-8 animate-fade-in">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Email Verification Required</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  After signing up, please check your email and click the confirmation link before signing in.
                </p>
              </div>

              {/* Email troubleshooting section */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 mb-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Email Not Received?</span>
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 space-y-1">
                  <p>• Check your spam/junk folder</p>
                  <p>• Make sure you entered the correct email</p>
                  <p>• Try the resend button below</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading || !formData.email}
                  className="mt-2 w-full"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-3 w-3" />
                      Resend Confirmation Email
                    </>
                  )}
                </Button>
              </div>
              
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="signin-email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12 bg-background border-border focus:border-primary transition-all duration-200"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 bg-background border-border focus:border-primary transition-all duration-200"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6 mt-8 animate-fade-in">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Email Confirmation Required</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  After signup, we'll send a confirmation email. Please check your inbox and spam folder.
                </p>
              </div>
              
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="signup-name"
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10 h-12 bg-background border-border focus:border-primary transition-all duration-200"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="signup-email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12 bg-background border-border focus:border-primary transition-all duration-200"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password (min 6 characters)"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-12 bg-background border-border focus:border-primary transition-all duration-200"
                      minLength={6}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="signup-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 h-12 bg-background border-border focus:border-primary transition-all duration-200"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 disabled:opacity-50" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
