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
import { User, Mail, Lock, Phone, MapPin, Calendar, Briefcase, IndianRupee, FileText, Users, UserCircle } from 'lucide-react';

interface BachatGat {
  _id: string;
  name: string;
  description: string;
  location: {
    village: string;
    district: string;
    state: string;
  };
  members: any[];
  maxMembers: number;
  monthlyContribution: number;
}

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      village: '',
      district: '',
      state: '',
      pincode: ''
    },
    age: '',
    occupation: '',
    monthlyIncome: '',
    aadharNumber: '',
    gatId: '',
    role: 'member'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [bachatGats, setBachatGats] = useState<BachatGat[]>([]);
  const [loadingGats, setLoadingGats] = useState(true);
  
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch available Bachat Gats
  useEffect(() => {
    const fetchBachatGats = async () => {
      try {
        setLoadingGats(true);
        const response = await bachatGatAPI.getAvailable();
        setBachatGats(response.data);
      } catch (error) {
        console.error('Error fetching Bachat Gats:', error);
        toast({
          title: "Error",
          description: "Failed to load Bachat Gats. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingGats(false);
      }
    };

    fetchBachatGats();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive" as any,
      });
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive" as any,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register({
        ...formData,
        age: parseInt(formData.age),
        monthlyIncome: parseInt(formData.monthlyIncome)
      } as any);
      
      if (success) {
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: "Failed to create account. Please try again.",
          variant: "destructive" as any,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred. Please try again.",
        variant: "destructive" as any,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-trust flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-prosperity rounded-full flex items-center justify-center mx-auto mb-4">
            <img 
              src="/logo.jpg" 
              alt="Sushrimala Logo" 
              className="h-10 w-10 rounded-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-prosperity">
            {t('register.title')}
          </CardTitle>
          <CardDescription>
            {t('register.subtitle')}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('register.name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('register.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t('register.phone')}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aadharNumber">Aadhar Number</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="aadharNumber"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    placeholder="123456789012"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('register.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('register.confirm')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="25"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupation">{t('occupation')}</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="Occupation"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthlyIncome"
                    name="monthlyIncome"
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    placeholder="10000"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              {/* Bachat Gat Selection */}
              <div className="space-y-2">
                <Label htmlFor="gatId">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Select Bachat Gat
                  </div>
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={formData.gatId} 
                    onValueChange={(value) => handleSelectChange('gatId', value)}
                    disabled={loadingGats}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder={loadingGats ? "Loading..." : "Select a Bachat Gat"} />
                    </SelectTrigger>
                    <SelectContent>
                      {bachatGats.map((gat) => (
                        <SelectItem key={gat._id} value={gat._id}>
                          {gat.name} ({gat.location.village})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.gatId && (
                  <p className="text-xs text-muted-foreground">
                    {bachatGats.find(g => g._id === formData.gatId)?.description}
                  </p>
                )}
              </div>
              
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    Select Role
                  </div>
                </Label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="president">President</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="treasurer">Treasurer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role !== 'member' && (
                  <p className="text-xs text-muted-foreground">
                    Note: Officer positions require approval from existing group members.
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-prosperity">Address Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address.village">Village</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address.village"
                      name="address.village"
                      value={formData.address.village}
                      onChange={handleInputChange}
                      placeholder="Village Name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address.district">District</Label>
                  <Input
                    id="address.district"
                    name="address.district"
                    value={formData.address.district}
                    onChange={handleInputChange}
                    placeholder="District Name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address.state">State</Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="State Name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address.pincode">Pincode</Label>
                  <Input
                    id="address.pincode"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                    placeholder="400001"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : t('register.button')}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              {t('register.haveaccount')}{' '}
              <Link to="/login" className="text-prosperity hover:underline">
                {t('register.signin')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;