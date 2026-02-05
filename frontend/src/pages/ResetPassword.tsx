import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        return;
      }
      
      try {
        await axios.get(`http://localhost:5001/api/auth/reset-password/${token}`);
      } catch (error) {
        setIsValidToken(false);
        toast({
          title: t('common.error'),
          description: "Invalid or expired reset token. Please request a new password reset.",
          variant: "destructive" as any,
        });
      }
    };
    
    validateToken();
  }, [token, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: "Passwords do not match.",
        variant: "destructive" as any,
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: t('common.error'),
        description: "Password must be at least 6 characters long.",
        variant: "destructive" as any,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the reset password API endpoint
      await authAPI.resetPassword(token as string, password);
      
      setIsSuccess(true);
      toast({
        title: t('common.success'),
        description: t('reset.successMessage'),
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || "Failed to reset password. Please try again.",
        variant: "destructive" as any,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-trust flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              {t('reset.invalid')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              {t('reset.invalidMessage')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('reset.requestNew')}
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={() => navigate('/forgot-password')}
              className="w-full"
            >
              {t('reset.requestNew')}
            </Button>
            
            <Button 
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full"
            >
              {t('reset.back')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-trust flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-prosperity rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-prosperity">
              {t('reset.success')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              {t('reset.successMessage')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('reset.login')}
            </p>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              {t('reset.login')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-trust flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-prosperity rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-prosperity">
            {t('reset.title')}
          </CardTitle>
          <CardDescription>
            {t('reset.subtitle')}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('reset.newPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('reset.newPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('reset.confirmPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('reset.confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('reset.button')}
            </Button>
            
            <Button 
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full"
            >
              {t('reset.back')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;