import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { bachatGatAPI } from '@/lib/api';
import { 
  IndianRupee, 
  FileText
} from 'lucide-react';

interface RecordExpenseProps {
  userGroup: any;
  onUpdate: () => void;
}

const RecordExpense = ({ userGroup, onUpdate }: RecordExpenseProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  const handleRecordExpense = async () => {
    if (!amount || !description) {
      toast({
        title: "Error",
        description: "Please enter amount and description",
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
      // For now, we'll just update the group's total funds
      // In a real implementation, you might want to create a transaction record
      const currentFunds = userGroup.totalFunds || 0;
      const newFunds = currentFunds - parseFloat(amount);
      
      await bachatGatAPI.update(userGroup._id, { totalFunds: newFunds });

      toast({
        title: "Success",
        description: "Expense recorded successfully",
      });

      // Reset form
      setAmount('');
      setDescription('');
      
      // Refresh data
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-prosperity" />
          Record Group Expense
        </CardTitle>
        <CardDescription>
          Record an expense for the group
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Label htmlFor="description">Description *</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
              className="pl-10"
              rows={3}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleRecordExpense} 
          disabled={isSubmitting}
          className="w-full gap-2"
        >
          {isSubmitting ? 'Recording...' : 'Record Expense'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecordExpense;