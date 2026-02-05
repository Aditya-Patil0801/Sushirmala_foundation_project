import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { bachatGatAPI, transactionAPI, loanAPI } from '@/lib/api';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  IndianRupee, 
  Users,
  Plus,
  Eye,
  Edit,
  CreditCard,
  PiggyBank,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  Coins,
  Banknote
} from 'lucide-react';
import RecordContribution from '@/components/RecordContribution';
import ContributionStatus from '@/components/ContributionStatus';
import RecordExpense from '@/components/RecordExpense';

interface BachatGatBalanceProps {
  userGroup: any;
  transactionSummary: any;
  canManageMoney: boolean;
  onUpdate: () => void;
  recentTransactions?: any[];
  user?: any;
}

const BachatGatBalance = ({ userGroup, transactionSummary, canManageMoney, onUpdate, recentTransactions = [], user }: BachatGatBalanceProps) => {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false);
  const [isEditContributionOpen, setIsEditContributionOpen] = useState(false);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: '',
    amount: '',
    member: '',
    description: ''
  });
  const [newContribution, setNewContribution] = useState(userGroup?.monthlyContribution || 0);
  const [balanceData, setBalanceData] = useState({
    newBalance: '',
    reason: ''
  });
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    description: ''
  });
  const [isRecordContributionOpen, setIsRecordContributionOpen] = useState(false);
  const [selectedMemberForContribution, setSelectedMemberForContribution] = useState<string | null>(null);
  const [isRecordExpenseOpen, setIsRecordExpenseOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch loans and transactions data
    fetchLoans();
    fetchTransactions();
  }, []);

  const fetchLoans = async () => {
    try {
      // This would integrate with your backend API
      // const response = await loanAPI.getByBachatGat(userGroup._id);
      // setLoans(response.data);
      
      // Mock data for now
      setLoans([
        {
          _id: '1',
          member: { name: 'Priya Sharma', role: 'member' },
          amount: 50000,
          status: 'active',
          remainingAmount: 35000,
          monthlyEMI: 5000,
          interestRate: 12,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-01')
        },
        {
          _id: '2',
          member: { name: 'Sunita Patel', role: 'treasurer' },
          amount: 30000,
          status: 'active',
          remainingAmount: 18000,
          monthlyEMI: 3000,
          interestRate: 12,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-11-01')
        },
        {
          _id: '3',
          member: { name: 'Meera Singh', role: 'member' },
          amount: 25000,
          status: 'completed',
          remainingAmount: 0,
          monthlyEMI: 2500,
          interestRate: 12,
          startDate: new Date('2023-06-01'),
          endDate: new Date('2024-05-01')
        }
      ]);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getAll();
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleUpdateContribution = async () => {
    try {
      if (newContribution <= 0) {
        toast({
          title: "Error",
          description: "Monthly contribution must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      // Update via API
      await bachatGatAPI.update(userGroup._id, { monthlyContribution: newContribution });
      
      toast({
        title: "Success",
        description: "Monthly contribution updated successfully",
      });
      
      setIsEditContributionOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update monthly contribution",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBalance = async () => {
    try {
      if (!balanceData.newBalance || !balanceData.reason) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      const newBalance = parseFloat(balanceData.newBalance);
      if (isNaN(newBalance) || newBalance < 0) {
        toast({
          title: "Error",
          description: "Please enter a valid balance amount",
          variant: "destructive",
        });
        return;
      }

      // Update via API
      await bachatGatAPI.update(userGroup._id, { totalFunds: newBalance });
      
      toast({
        title: "Success",
        description: "Group balance updated successfully",
      });
      
      setIsEditBalanceOpen(false);
      setBalanceData({ newBalance: '', reason: '' });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update balance",
        variant: "destructive",
      });
    }
  };

  const handleRecordPayment = async () => {
    try {
      if (!paymentData.amount || !selectedLoan) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const amount = parseFloat(paymentData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid payment amount",
          variant: "destructive",
        });
        return;
      }

      if (amount > selectedLoan.remainingAmount) {
        toast({
          title: "Error",
          description: "Payment amount cannot exceed remaining loan amount",
          variant: "destructive",
        });
        return;
      }

      // Record payment via API
      await loanAPI.addPayment(selectedLoan._id, {
        amount,
        description: paymentData.description
      });
      
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      
      setIsRecordPaymentOpen(false);
      setSelectedLoan(null);
      setPaymentData({ amount: '', description: '' });
      fetchLoans(); // Refresh loans
      fetchTransactions(); // Refresh transactions
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleAddTransaction = async () => {
    try {
      if (!newTransaction.type || !newTransaction.amount || !newTransaction.member) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const transactionData = {
        type: newTransaction.type,
        amount: parseFloat(newTransaction.amount),
        member: newTransaction.member,
        description: newTransaction.description
      };

      await transactionAPI.create(transactionData);
      
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
      
      setIsAddTransactionOpen(false);
      setNewTransaction({ type: '', amount: '', member: '', description: '' });
      fetchTransactions(); // Refresh transactions
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add transaction",
        variant: "destructive",
      });
    }
  };

  const totalLoansAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const activeLoansAmount = loans.filter(loan => loan.status === 'active').reduce((sum, loan) => sum + loan.remainingAmount, 0);
  const totalContributions = userGroup.members.length * userGroup.monthlyContribution;

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Group Funds
            </CardTitle>
            <Wallet className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(userGroup.totalFunds || 0)}
            </div>
            <p className="text-xs text-green-100">
              Available for loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(activeLoansAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {loans.filter(loan => loan.status === 'active').length} active loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Monthly Contributions</CardTitle>
              {canManageMoney && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewContribution(userGroup.monthlyContribution);
                    setIsEditContributionOpen(true);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </div>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalContributions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Expected monthly ({formatCurrency(userGroup.monthlyContribution)} per member)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency((userGroup.totalFunds || 0) - activeLoansAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              For new loans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {canManageMoney && (
        <div className="flex gap-4">
          <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Record a new financial transaction for the group.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contribution">Contribution</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="repayment">Repayment</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionAmount">Amount</Label>
                  <Input
                    id="transactionAmount"
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionMember">Member</Label>
                  <Select value={newTransaction.member} onValueChange={(value) => setNewTransaction({...newTransaction, member: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {userGroup.members.map((member: any) => (
                        <SelectItem key={member._id} value={member._id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionDescription">Description</Label>
                  <Textarea
                    id="transactionDescription"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder="Enter transaction description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTransaction}>
                    Add Transaction
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => setIsEditBalanceOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Update Balance
          </Button>
        </div>
      )}

      {/* Loan Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-prosperity" />
            Loan Details
          </CardTitle>
          <CardDescription>
            Overview of all loans taken by group members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loans.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No loans found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div
                    key={loan._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                        {getStatusIcon(loan.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{loan.member.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {loan.member.role}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(loan.status)}`}>
                            {loan.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Loan taken on {new Date(loan.startDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {formatCurrency(loan.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          EMI: {formatCurrency(loan.monthlyEMI)}/month
                        </p>
                        {loan.status === 'active' && (
                          <p className="text-sm text-orange-600">
                            Remaining: {formatCurrency(loan.remainingAmount)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      {canManageMoney && loan.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => {
                            setSelectedLoan(loan);
                            setPaymentData({ amount: '', description: '' });
                            setIsRecordPaymentOpen(true);
                          }}
                        >
                          <TrendingDown className="h-4 w-4" />
                          Record Payment
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-prosperity" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Latest financial activities in your group
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No transactions recorded yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((transaction: any) => (
                  <div key={transaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.member?.name || 'System'} • {new Date(transaction.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${transaction.type === 'contribution' ? 'text-green-600' : transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                        {transaction.type === 'contribution' ? '+' : ''}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Group Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-prosperity" />
                Group Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Members</span>
                  <span className="font-medium">{userGroup.members.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monthly Contribution</span>
                  <span className="font-medium text-prosperity">{formatCurrency(userGroup.monthlyContribution)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Potential Monthly Income</span>
                  <span className="font-medium text-green-600">{formatCurrency(userGroup.members.length * userGroup.monthlyContribution)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Funds</span>
                  <span className="font-bold text-lg text-prosperity">{formatCurrency(transactionSummary?.totalFunds || userGroup.totalFunds || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions for Officers */}
          {canManageMoney && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-prosperity" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Manage group finances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={isRecordContributionOpen} onOpenChange={(open) => {
                  setIsRecordContributionOpen(open);
                  if (open) setSelectedMemberForContribution(null); // Clear selected member when opening from quick actions
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Record Contribution
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Record Member Contribution</DialogTitle>
                      <DialogDescription>
                        Record a monthly contribution from a group member
                      </DialogDescription>
                    </DialogHeader>
                    <RecordContribution 
                      userGroup={userGroup} 
                      onUpdate={onUpdate} 
                      selectedMemberId={selectedMemberForContribution || undefined}
                    />
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isRecordExpenseOpen} onOpenChange={setIsRecordExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Banknote className="h-4 w-4" />
                      Record Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Group Expense</DialogTitle>
                      <DialogDescription>
                        Record an expense for the group
                      </DialogDescription>
                    </DialogHeader>
                    <RecordExpense 
                      userGroup={userGroup} 
                      onUpdate={onUpdate} 
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Contribution Status - Visible to all members */}
      <ContributionStatus 
        userGroup={userGroup} 
        user={user}
        onOpenRecordContribution={(memberId) => {
          setSelectedMemberForContribution(memberId);
          setIsRecordContributionOpen(true);
        }}
      />

      {/* Record Contribution Dialog */}
      <Dialog open={isRecordContributionOpen} onOpenChange={(open) => {
        setIsRecordContributionOpen(open);
        if (!open) setSelectedMemberForContribution(null); // Reset selected member when closing
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Member Contribution</DialogTitle>
            <DialogDescription>
              Record a monthly contribution from a group member
            </DialogDescription>
          </DialogHeader>
          <RecordContribution 
            userGroup={userGroup} 
            onUpdate={onUpdate} 
            selectedMemberId={selectedMemberForContribution || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Record Expense Dialog */}
      <Dialog open={isRecordExpenseOpen} onOpenChange={setIsRecordExpenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Group Expense</DialogTitle>
            <DialogDescription>
              Record an expense for the group
            </DialogDescription>
          </DialogHeader>
          <RecordExpense 
            userGroup={userGroup} 
            onUpdate={onUpdate} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Balance Dialog */}
      <Dialog open={isEditBalanceOpen} onOpenChange={setIsEditBalanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Group Balance</DialogTitle>
            <DialogDescription>
              Manually update the total group funds balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentBalance">Current Balance</Label>
              <Input
                id="currentBalance"
                value={formatCurrency(userGroup.totalFunds || 0)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBalance">New Balance</Label>
              <Input
                id="newBalance"
                type="number"
                value={balanceData.newBalance}
                onChange={(e) => setBalanceData({...balanceData, newBalance: e.target.value})}
                placeholder="Enter new balance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balanceReason">Reason for Update</Label>
              <Textarea
                id="balanceReason"
                value={balanceData.reason}
                onChange={(e) => setBalanceData({...balanceData, reason: e.target.value})}
                placeholder="Enter reason for balance update"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditBalanceOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBalance}>
                Update Balance
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Monthly Contribution Dialog */}
      <Dialog open={isEditContributionOpen} onOpenChange={setIsEditContributionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Monthly Contribution</DialogTitle>
            <DialogDescription>
              Change the monthly contribution amount for all members of this Bachat Gat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyContribution">Monthly Contribution Amount</Label>
              <Input
                id="monthlyContribution"
                type="number"
                value={newContribution}
                onChange={(e) => setNewContribution(Number(e.target.value))}
                placeholder="Enter new monthly contribution amount"
              />
              <p className="text-xs text-muted-foreground">
                Current: {formatCurrency(userGroup.monthlyContribution)}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will affect all members' monthly contribution requirements.
                Make sure to inform all members about this change.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditContributionOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateContribution}>
                Update Contribution
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Loan Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedLoan?.member?.name}'s loan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Loan Details:</strong><br />
                Amount: {selectedLoan && formatCurrency(selectedLoan.amount)}<br />
                Remaining: {selectedLoan && formatCurrency(selectedLoan.remainingAmount)}<br />
                EMI: {selectedLoan && formatCurrency(selectedLoan.monthlyEMI)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                placeholder="Enter payment amount"
                max={selectedLoan?.remainingAmount}
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {selectedLoan && formatCurrency(selectedLoan.remainingAmount)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDescription">Description (Optional)</Label>
              <Textarea
                id="paymentDescription"
                value={paymentData.description}
                onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                placeholder="Enter payment description or notes"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRecordPaymentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment}>
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BachatGatBalance;
