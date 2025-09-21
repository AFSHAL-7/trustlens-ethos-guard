import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Loader2, Shield, CheckCircle } from 'lucide-react';
import Logo from '@/components/Logo';

const PasswordReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const checkTokenAndSession = async () => {
      setIsChecking(true);
      try {
        // Check if we have the reset token in the URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (type === 'recovery' && accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            toast.error('Invalid or expired reset link');
            navigate('/auth');
            return;
          }

          if (data.session) {
            setIsValidToken(true);
            toast.success('Reset link verified! Please enter your new password.');
          }
        } else {
          toast.error('Invalid reset link');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error checking reset token:', error);
        toast.error('An error occurred while verifying the reset link');
        navigate('/auth');
      } finally {
        setIsChecking(false);
      }
    };

    checkTokenAndSession();
  }, [searchParams, navigate]);

  const validateForm = () => {
    if (!formData.password) {
      toast.error('Please enter a new password');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('Password update error:', error);
        toast.error(error.message || 'Failed to update password');
        return;
      }

      toast.success('Password updated successfully!');
      
      // Sign out the user so they can log in with the new password
      await supabase.auth.signOut();
      
      navigate('/auth', { 
        replace: true,
        state: { 
          message: 'Password updated successfully! Please sign in with your new password.' 
        }
      });

    } catch (error: any) {
      console.error('Unexpected password reset error:', error);
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

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-blue-50/50 dark:from-gray-900 dark:via-background dark:to-gray-900/50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Verifying reset link...</span>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-blue-50/50 dark:from-gray-900 dark:via-background dark:to-gray-900/50 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4 space-y-4">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-destructive">
                Invalid Reset Link
              </CardTitle>
              <p className="text-muted-foreground">
                The password reset link is invalid or has expired.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
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
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle className="text-2xl font-bold text-foreground">
                Reset Password
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-base">
              Enter your new password below
            </p>
            <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handlePasswordReset} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                New Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your new password (min 6 characters)"
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
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm New Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your new password"
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
                  Updating password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Your password will be securely updated</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;