import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { bachatGatAPI } from '@/lib/api';
import { Plus, MapPin, CreditCard, Calendar, FileText } from 'lucide-react';

interface CreateBachatGatFormProps {
  onSuccess?: () => void;
}

const CreateBachatGatForm = ({ onSuccess }: CreateBachatGatFormProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      village: '',
      district: '',
      state: ''
    },
    monthlyMeetingDate: '',
    monthlyContribution: '',
    rules: ''
  });

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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: {
        village: '',
        district: '',
        state: ''
      },
      monthlyMeetingDate: '',
      monthlyContribution: '',
      rules: ''
    });
  };

  const validateForm = () => {
    const { name, description, location, monthlyMeetingDate, monthlyContribution } = formData;
    
    if (!name || !description || !location.village || !location.district || 
        !location.state || !monthlyMeetingDate || !monthlyContribution) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    const meetingDate = parseInt(monthlyMeetingDate);
    if (meetingDate < 1 || meetingDate > 31) {
      toast({
        title: "Error",
        description: "Meeting date must be between 1 and 31",
        variant: "destructive",
      });
      return false;
    }

    const contribution = parseInt(monthlyContribution);
    if (contribution < 100) {
      toast({
        title: "Error",
        description: "Monthly contribution must be at least ₹100",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const submitData = {
        ...formData,
        monthlyMeetingDate: parseInt(formData.monthlyMeetingDate),
        monthlyContribution: parseInt(formData.monthlyContribution),
        rules: formData.rules ? formData.rules.split('\n').filter(rule => rule.trim()) : []
      };
      
      await bachatGatAPI.create(submitData);
      
      toast({
        title: "Success!",
        description: "Bachat Gat created successfully",
      });
      
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create Bachat Gat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="prosperity" className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Bachat Gat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Bachat Gat</DialogTitle>
          <DialogDescription>
            Set up a new women's self-help group. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-prosperity">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-prosperity-light font-medium">
                  Group Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter group name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border-prosperity/20 focus:border-prosperity"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-prosperity-light font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and goals of this Bachat Gat"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="border-prosperity/20 focus:border-prosperity min-h-[80px]"
                  required
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-prosperity flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="village" className="text-prosperity-light font-medium">
                    Village *
                  </Label>
                  <Input
                    id="village"
                    type="text"
                    placeholder="Village name"
                    value={formData.location.village}
                    onChange={(e) => handleInputChange('location.village', e.target.value)}
                    className="border-prosperity/20 focus:border-prosperity"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-prosperity-light font-medium">
                    District *
                  </Label>
                  <Input
                    id="district"
                    type="text"
                    placeholder="District name"
                    value={formData.location.district}
                    onChange={(e) => handleInputChange('location.district', e.target.value)}
                    className="border-prosperity/20 focus:border-prosperity"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="state" className="text-prosperity-light font-medium">
                    State *
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="State name"
                    value={formData.location.state}
                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                    className="border-prosperity/20 focus:border-prosperity"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Meeting & Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-prosperity flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Meeting & Financial Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyMeetingDate" className="text-prosperity-light font-medium">
                    Monthly Meeting Date *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="monthlyMeetingDate"
                      type="number"
                      placeholder="Day of month (1-31)"
                      value={formData.monthlyMeetingDate}
                      onChange={(e) => handleInputChange('monthlyMeetingDate', e.target.value)}
                      className="pl-10 border-prosperity/20 focus:border-prosperity"
                      min={1}
                      max={31}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the day of the month for regular meetings (e.g., 15 for 15th of every month)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyContribution" className="text-prosperity-light font-medium">
                    Monthly Contribution (₹) *
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="monthlyContribution"
                      type="number"
                      placeholder="Amount in rupees"
                      value={formData.monthlyContribution}
                      onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                      className="pl-10 border-prosperity/20 focus:border-prosperity"
                      min={100}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum contribution is ₹100 per month
                  </p>
                </div>
              </div>
            </div>

            {/* Group Rules */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-prosperity flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Group Rules (Optional)
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="rules" className="text-prosperity-light font-medium">
                  Group Rules and Guidelines
                </Label>
                <Textarea
                  id="rules"
                  placeholder="Enter each rule on a new line&#10;Example:&#10;Members must attend monthly meetings&#10;Monthly contribution is mandatory&#10;Respect and support all group members"
                  value={formData.rules}
                  onChange={(e) => handleInputChange('rules', e.target.value)}
                  className="border-prosperity/20 focus:border-prosperity min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Enter each rule on a separate line. These can be edited later.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="prosperity" 
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-prosperity-foreground/30 border-t-prosperity-foreground rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Bachat Gat
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBachatGatForm;