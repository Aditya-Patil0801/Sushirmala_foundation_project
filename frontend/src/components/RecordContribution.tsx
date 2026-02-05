import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { contributionAPI } from '@/lib/api';
import { 
  IndianRupee, 
  Calendar,
  Users,
  CheckCircle
} from 'lucide-react';

interface RecordContributionProps {
  userGroup: any;
  onUpdate: () => void;
  selectedMemberId?: string; // Add this prop
}

const RecordContribution = ({ userGroup, onUpdate, selectedMemberId }: RecordContributionProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [year, setYear] = useState(new Date().getFullYear());
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (userGroup?.members) {
      setMembers(userGroup.members);
    }
  }, [userGroup]);

  // Set the selected member when selectedMemberId prop changes
  useEffect(() => {
    if (selectedMemberId) {
      setSelectedMember(selectedMemberId);
    }
  }, [selectedMemberId]);

  const handleRecordContribution = async () => {
    if (!selectedMember || !amount) {
      toast({
        title: "Error",
        description: "Please select a member and enter an amount",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await contributionAPI.create({
        memberId: selectedMember,
        amount: parseFloat(amount),
        month,
        year,
        paymentMethod,
        remarks
      });

      toast({
        title: "Success",
        description: "Contribution recorded successfully",
      });

      // Reset form
      setSelectedMember('');
      setAmount('');
      setRemarks('');
      
      // Refresh data
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record contribution",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-prosperity" />
          Record Monthly Contribution
        </CardTitle>
        <CardDescription>
          Record contributions from group members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="member">Member *</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member: any) => (
                  <SelectItem key={member._id} value={member._id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="month">Month *</Label>
            <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((name, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              placeholder="Enter year"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Input
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Additional notes (optional)"
          />
        </div>
        
        <Button 
          onClick={handleRecordContribution} 
          disabled={isSubmitting}
          className="w-full gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {isSubmitting ? 'Recording...' : 'Record Contribution'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecordContribution;