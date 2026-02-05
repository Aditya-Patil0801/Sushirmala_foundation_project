import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { enquiryAPI } from '@/lib/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Home,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface EnquiryFormProps {
  bachatGatId: string;
  onSuccess?: () => void;
}

const EnquiryForm = ({ bachatGatId, onSuccess }: EnquiryFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      village: '',
      district: '',
      state: '',
      pincode: ''
    },
    interestedInJoining: 'yes',
    livesInRentedHouse: 'no'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    const { name, email, phone, address } = formData;
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return false;
    }

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (!phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return false;
    }

    // Phone validation (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number starting with 6-9",
        variant: "destructive",
      });
      return false;
    }

    if (!address.street.trim()) {
      toast({
        title: "Error",
        description: "Please enter your street address",
        variant: "destructive",
      });
      return false;
    }

    if (!address.village.trim()) {
      toast({
        title: "Error",
        description: "Please enter your village",
        variant: "destructive",
      });
      return false;
    }

    if (!address.district.trim()) {
      toast({
        title: "Error",
        description: "Please enter your district",
        variant: "destructive",
      });
      return false;
    }

    if (!address.state.trim()) {
      toast({
        title: "Error",
        description: "Please enter your state",
        variant: "destructive",
      });
      return false;
    }

    if (!address.pincode.trim()) {
      toast({
        title: "Error",
        description: "Please enter your pincode",
        variant: "destructive",
      });
      return false;
    }

    // Pincode validation (6 digits)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(address.pincode)) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const enquiryData = {
        ...formData,
        interestedInJoining: formData.interestedInJoining === 'yes',
        livesInRentedHouse: formData.livesInRentedHouse === 'yes',
        bachatGatId
      };

      await enquiryAPI.submit(enquiryData);
      
      toast({
        title: "Success",
        description: "Your enquiry has been submitted successfully!",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: {
          street: '',
          village: '',
          district: '',
          state: '',
          pincode: ''
        },
        interestedInJoining: 'yes',
        livesInRentedHouse: 'no'
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit enquiry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-prosperity" />
          Join Our Bachat Gat
        </CardTitle>
        <CardDescription>
          Please fill out this form to express your interest in joining our Bachat Gat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter 10-digit phone number"
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="Enter your street address"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="village">Village *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="village"
                    value={formData.address.village}
                    onChange={(e) => handleInputChange('address.village', e.target.value)}
                    placeholder="Enter your village"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.address.district}
                  onChange={(e) => handleInputChange('address.district', e.target.value)}
                  placeholder="Enter your district"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="Enter your state"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.address.pincode}
                  onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Questions</h3>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base">
                  Are you interested in joining our Bachat Gat? *
                </Label>
                <RadioGroup 
                  value={formData.interestedInJoining} 
                  onValueChange={(value) => handleInputChange('interestedInJoining', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="interested-yes" />
                    <Label htmlFor="interested-yes" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="interested-no" />
                    <Label htmlFor="interested-no" className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base">
                  Do you stay in a rented house? *
                </Label>
                <RadioGroup 
                  value={formData.livesInRentedHouse} 
                  onValueChange={(value) => handleInputChange('livesInRentedHouse', value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="rented-yes" />
                    <Label htmlFor="rented-yes" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="rented-no" />
                    <Label htmlFor="rented-no" className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnquiryForm;