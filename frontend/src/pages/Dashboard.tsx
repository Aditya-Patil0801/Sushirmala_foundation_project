import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bachatGatAPI, transactionAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  TrendingUp, 
  Calendar, 
  IndianRupee, 
  Users,
  Building2,
  RefreshCw,
  PiggyBank,
  Award,
  User,
  FileText,
  CreditCard,
  Bell,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

// Import tab components
import BachatGatProfile from '@/components/dashboard/BachatGatProfile';
import PersonalProfile from '@/components/dashboard/PersonalProfile';
import BachatGatBalance from '@/components/dashboard/BachatGatBalance';
import LoanDetails from '@/components/dashboard/LoanDetails';
import NoticeBoard from '@/components/dashboard/NoticeBoard';
import BachatGatList from '@/components/BachatGatList';

const Dashboard = () => {
  const [userGroup, setUserGroup] = useState(null);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bachat-gat-profile');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      if (user?.bachatGatId) {
        const [groupResponse, summaryResponse, transactionsResponse] = await Promise.all([
          bachatGatAPI.getById(user.bachatGatId),
          transactionAPI.getSummary(),
          transactionAPI.getAll({ limit: 10 })
        ]);
        
        setUserGroup(groupResponse.data);
        setTransactionSummary(summaryResponse.data);
        setRecentTransactions(transactionsResponse.data.transactions || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Role-based access control
  const canViewProfiles = ['president', 'secretary', 'treasurer'].includes(user?.role);
  const canManageMembers = ['president', 'secretary'].includes(user?.role);
  const canManageMoney = ['treasurer'].includes(user?.role);
  const canApproveLoans = ['president', 'secretary'].includes(user?.role);
  const isOfficer = ['president', 'secretary', 'treasurer'].includes(user?.role);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-prosperity/30 border-t-prosperity rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If user is not part of any group
  if (!user?.bachatGatId || !userGroup) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-prosperity/10 rounded-full flex items-center justify-center mx-auto">
            <img 
              src="/logo.jpg" 
              alt="Sushrimala Logo" 
              className="h-10 w-10 rounded-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-prosperity">Welcome to Sushirmala Foundation!</h1>
            <p className="text-muted-foreground text-lg mt-2">
              You're not part of any Bachat Gat group yet.
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-prosperity">Join a Bachat Gat Group</CardTitle>
            <CardDescription>
              Connect with other women in your community and start your savings journey together.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-600">Community Support</h3>
                <p className="text-sm text-blue-600 mt-1">Connect with like-minded women</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <PiggyBank className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-600">Regular Savings</h3>
                <p className="text-sm text-green-600 mt-1">Build your financial future</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-600">Skill Development</h3>
                <p className="text-sm text-purple-600 mt-1">Learn and grow together</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberProgress = (userGroup.members.length / userGroup.maxMembers) * 100;

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-prosperity">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            {userGroup.name} • {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Group Funds
            </CardTitle>
            <Wallet className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(transactionSummary?.totalFunds || userGroup.totalFunds || 0)}
            </div>
            <p className="text-xs text-blue-100">
              Combined savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userGroup.members.length}/{userGroup.maxMembers}
            </div>
            <Progress value={memberProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Loan Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(user?.loanBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Interest: {user?.interestRate || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Contribution</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-prosperity">
              {formatCurrency(userGroup.monthlyContribution)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="bachat-gat-profile" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <Building2 className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Bachat Gat</span>
            <span className="sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="personal-profile" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <User className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Personal</span>
            <span className="sm:hidden">Me</span>
          </TabsTrigger>
          <TabsTrigger value="balance" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <Wallet className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Balance</span>
            <span className="sm:hidden">₹</span>
          </TabsTrigger>
          <TabsTrigger value="loan-details" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Loans</span>
            <span className="sm:hidden">Loan</span>
          </TabsTrigger>
          <TabsTrigger value="notice-board" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
            <Bell className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Notice</span>
            <span className="sm:hidden">News</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bachat-gat-profile">
          <BachatGatProfile 
            userGroup={userGroup}
            canManageMembers={canManageMembers}
            isOfficer={isOfficer}
            onUpdate={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="personal-profile">
          <PersonalProfile 
            user={user}
            canViewProfiles={canViewProfiles}
          />
        </TabsContent>

        <TabsContent value="balance">
          <BachatGatBalance 
            userGroup={userGroup}
            transactionSummary={transactionSummary}
            canManageMoney={canManageMoney}
            onUpdate={fetchDashboardData}
            recentTransactions={recentTransactions}
            user={user}
          />
        </TabsContent>

        <TabsContent value="loan-details">
          <LoanDetails 
            user={user}
            userGroup={userGroup}
            canApproveLoans={canApproveLoans}
            canManageMoney={canManageMoney}
            onUpdate={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="notice-board">
          <NoticeBoard 
            userGroup={userGroup}
            canManageMembers={canManageMembers}
            onUpdate={fetchDashboardData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;