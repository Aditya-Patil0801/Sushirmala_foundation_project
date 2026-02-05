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
import { loanAPI } from '@/lib/api';
import { 
  CreditCard, 
  Plus, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  IndianRupee,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  User,
  DollarSign
} from 'lucide-react';

interface LoanDetailsProps {
  user: any;
  userGroup: any;
  canApproveLoans: boolean;
  canManageMoney: boolean;
  onUpdate: () => void;
}

const LoanDetails = ({ user, userGroup, canApproveLoans, canManageMoney, onUpdate }: LoanDetailsProps) => {
  const [isRequestLoanOpen, setIsRequestLoanOpen] = useState(false);
  const [isViewLoanOpen, setIsViewLoanOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [userLoans, setUserLoans] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [newLoanRequest, setNewLoanRequest] = useState({
    amount: '',
    purpose: '',
    duration: '',
    guarantorName: '',
    guarantorPhone: '',
    guarantorRelation: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUserLoans();
    if (canApproveLoans) {
      fetchPendingLoans();
    }
  }, []);

  const fetchUserLoans = async () => {
    try {
      const response = await loanAPI.getMyLoans();
      setUserLoans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching user loans:', error);
      setUserLoans([]);
    }
  };

  const fetchPendingLoans = async () => {
    try {
      const response = await loanAPI.getByGroup(userGroup._id, { status: 'pending' });
      setPendingLoans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending loans:', error);
      setPendingLoans([]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLoanRequest = async () => {
    try {
      if (!newLoanRequest.amount || !newLoanRequest.purpose || !newLoanRequest.duration) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const loanData = {
        amount: parseFloat(newLoanRequest.amount),
        purpose: newLoanRequest.purpose,
        duration: parseInt(newLoanRequest.duration),
        guarantorName: newLoanRequest.guarantorName,
        guarantorPhone: newLoanRequest.guarantorPhone,
        guarantorRelation: newLoanRequest.guarantorRelation
      };

      await loanAPI.create(loanData);
      
      toast({
        title: "Success",
        description: "Loan request submitted successfully",
      });
      
      setIsRequestLoanOpen(false);
      setNewLoanRequest({
        amount: '',
        purpose: '',
        duration: '',
        guarantorName: '',
        guarantorPhone: '',
        guarantorRelation: ''
      });
      
      // Refresh data
      fetchUserLoans();
      if (canApproveLoans) {
        fetchPendingLoans();
      }
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit loan request",
        variant: "destructive",
      });
    }
  };

  const handleApproveLoan = async (loanId: string) => {
    try {
      // Remove the approved loan from the pending loans list immediately
      setPendingLoans(currentLoans => currentLoans.filter(loan => loan._id !== loanId));
      
      await loanAPI.approve(loanId);
      
      toast({
        title: "Success",
        description: "Loan approved successfully",
      });
      // Call onUpdate to refresh data in parent components
      onUpdate();
    } catch (error) {
      // If API call fails, restore the loan to the list
      fetchPendingLoans();
      toast({
        title: "Error",
        description: "Failed to approve loan",
        variant: "destructive",
      });
    }
  };

  const handleRejectLoan = async (loanId: string) => {
    try {
      // Remove the rejected loan from the pending loans list immediately
      setPendingLoans(currentLoans => currentLoans.filter(loan => loan._id !== loanId));
      
      await loanAPI.reject(loanId);
      
      toast({
        title: "Success",
        description: "Loan rejected and removed",
      });
      onUpdate();
    } catch (error) {
      // If API call fails, restore the loan to the list
      fetchPendingLoans();
      toast({
        title: "Error",
        description: "Failed to reject loan",
        variant: "destructive",
      });
    }
  };

  const totalLoanAmount = userLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const activeLoanAmount = userLoans.filter(loan => loan.status === 'active').reduce((sum, loan) => sum + loan.remainingAmount, 0);
  const totalPaidAmount = userLoans.reduce((sum, loan) => sum + loan.paidAmount, 0);

  return (
    <div className="space-y-6">
      {/* Loan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Loans Taken
            </CardTitle>
            <CreditCard className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalLoanAmount)}
            </div>
            <p className="text-xs text-blue-100">
              {userLoans.length} loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loan Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(activeLoanAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {userLoans.filter(loan => loan.status === 'active').length} active loans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingLoans.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isRequestLoanOpen} onOpenChange={setIsRequestLoanOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Request New Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request New Loan</DialogTitle>
              <DialogDescription>
                Submit a new loan request to your Bachat Gat group.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={newLoanRequest.amount}
                    onChange={(e) => setNewLoanRequest({...newLoanRequest, amount: e.target.value})}
                    placeholder="Enter loan amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanDuration">Duration (months)</Label>
                  <Input
                    id="loanDuration"
                    type="number"
                    value={newLoanRequest.duration}
                    onChange={(e) => setNewLoanRequest({...newLoanRequest, duration: e.target.value})}
                    placeholder="Enter duration in months"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanPurpose">Purpose of Loan</Label>
                <Textarea
                  id="loanPurpose"
                  value={newLoanRequest.purpose}
                  onChange={(e) => setNewLoanRequest({...newLoanRequest, purpose: e.target.value})}
                  placeholder="Describe the purpose of your loan"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Guarantor Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guarantorName">Guarantor Name</Label>
                    <Input
                      id="guarantorName"
                      value={newLoanRequest.guarantorName}
                      onChange={(e) => setNewLoanRequest({...newLoanRequest, guarantorName: e.target.value})}
                      placeholder="Enter guarantor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantorPhone">Phone Number</Label>
                    <Input
                      id="guarantorPhone"
                      value={newLoanRequest.guarantorPhone}
                      onChange={(e) => setNewLoanRequest({...newLoanRequest, guarantorPhone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantorRelation">Relationship</Label>
                    <Input
                      id="guarantorRelation"
                      value={newLoanRequest.guarantorRelation}
                      onChange={(e) => setNewLoanRequest({...newLoanRequest, guarantorRelation: e.target.value})}
                      placeholder="e.g., Husband, Father"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRequestLoanOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLoanRequest}>
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Loans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-prosperity" />
            My Loans
          </CardTitle>
          <CardDescription>
            Your loan history and current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userLoans.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No loans found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userLoans.map((loan) => (
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
                          <p className="font-medium">{loan.purpose}</p>
                          <Badge className={`text-xs ${getStatusColor(loan.status)}`}>
                            {loan.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(loan.amount)} • {loan.interestRate}% interest • {loan.duration} months
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Started: {new Date(loan.startDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {formatCurrency(loan.remainingAmount || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          EMI: {formatCurrency(loan.monthlyEMI)}/month
                        </p>
                        {loan.status === 'active' && (
                          <p className="text-sm text-green-600">
                            Paid: {formatCurrency(loan.paidAmount)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setIsViewLoanOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Loan Requests (for President/Secretary) */}
      {canApproveLoans && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-prosperity" />
              Pending Loan Requests
            </CardTitle>
            <CardDescription>
              Loan requests awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLoans.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No pending loan requests
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingLoans.map((loan) => (
                    <div
                      key={loan._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-yellow-50 text-yellow-600">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{loan.member.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {loan.member.email}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(loan.amount)} • {loan.purpose} • {loan.duration} months
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Requested: {new Date(loan.requestDate).toLocaleDateString('en-IN')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Guarantor: {loan.guarantors[0]?.name} ({loan.guarantors[0]?.relationship})
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveLoan(loan._id)}
                          className="gap-2 text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectLoan(loan._id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Loan Details Dialog */}
      <Dialog open={isViewLoanOpen} onOpenChange={setIsViewLoanOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
            <DialogDescription>
              Complete information about your loan
            </DialogDescription>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Loan Amount</Label>
                  <p className="text-sm font-medium">{formatCurrency(selectedLoan.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Interest Rate</Label>
                  <p className="text-sm font-medium">{selectedLoan.interestRate}% per annum</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="text-sm font-medium">{selectedLoan.duration} months</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Monthly EMI</Label>
                  <p className="text-sm font-medium">{formatCurrency(selectedLoan.monthlyEMI)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                  <p className="text-sm font-medium">{formatCurrency(selectedLoan.totalAmount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Remaining Amount</Label>
                  <p className="text-sm font-medium text-orange-600">{formatCurrency(selectedLoan.remainingAmount)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Purpose</Label>
                <p className="text-sm font-medium">{selectedLoan.purpose}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Transaction History</Label>
                <div className="space-y-2 mt-2">
                  {selectedLoan.transactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanDetails;
