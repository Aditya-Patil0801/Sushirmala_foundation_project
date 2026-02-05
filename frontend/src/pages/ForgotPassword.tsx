import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Call the forgot password API endpoint
      await authAPI.forgotPassword(email);
      
      setIsSubmitted(true);
      toast({
        title: t('common.success'),
        description: t('forgot.instructions'),
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || "Failed to process request. Please try again.",
        variant: "destructive" as any,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-trust flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-prosperity rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-prosperity">
              {t('forgot.checkEmail')}
            </CardTitle>
            <CardDescription>
              {t('forgot.emailSent')} {email}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {t('forgot.instructions')}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              {t('forgot.noEmail')}
            </p>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="w-full"
              variant="outline"
            >
              {t('forgot.resend')}
            </Button>
            
            <Button 
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full"
            >
              {t('forgot.back')}
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
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-prosperity">
            {t('forgot.title')}
          </CardTitle>
          <CardDescription>
            {t('forgot.subtitle')}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              {isLoading ? t('common.loading') : t('forgot.button')}
            </Button>
            
            <Button 
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full"
            >
              {t('forgot.back')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;