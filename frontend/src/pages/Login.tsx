import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { bachatGatAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Users, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bachatGat, setBachatGat] = useState('');
  const [role, setRole] = useState<'president' | 'secretary' | 'treasurer' | 'member' | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [bachatGats, setBachatGats] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch available Bachat Gats
  useEffect(() => {
    const fetchBachatGats = async () => {
      setIsFetching(true);
      try {
        const response = await bachatGatAPI.getAvailable();
        console.log('Bachat Gats API Response:', response);
        // The backend returns the array directly, not in a data property
        setBachatGats(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (error) {
        console.error('Error fetching Bachat Gats:', error);
        toast({
          title: "Error",
          description: "Failed to load Bachat Gats. Please try again.",
          variant: "destructive" as any,
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchBachatGats();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password, bachatGat, role || undefined);
      if (success) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials. Please try again.",
          variant: "destructive" as any,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive" as any,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-trust flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-prosperity rounded-full flex items-center justify-center mx-auto mb-4">
            <img 
              src="/logo.jpg" 
              alt="Sushrimala Logo" 
              className="h-10 w-10 rounded-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-prosperity">
            {t('login.title')}
          </CardTitle>
          <CardDescription>
            {t('login.subtitle')}
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
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bachatGat">{t('login.bachatGat')}</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={bachatGat} 
                    onValueChange={setBachatGat}
                    disabled={isFetching}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder={t('login.selectBachatGat')} />
                    </SelectTrigger>
                    <SelectContent>
                      {bachatGats.map((gat) => (
                        <SelectItem key={gat._id} value={gat.name}>
                          {gat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">{t('login.role')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={role} 
                    onValueChange={(value: any) => setRole(value)}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder={t('login.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="president">President</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="treasurer">Treasurer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Link 
                to="/forgot-password" 
                className="text-sm text-prosperity hover:underline"
              >
                {t('login.forgot')}
              </Link>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : t('login.button')}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              {t('login.noaccount')}{' '}
              <Link to="/register" className="text-prosperity hover:underline">
                {t('login.register')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;