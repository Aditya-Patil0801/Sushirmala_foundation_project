import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bachatGatAPI, authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import BachatGatList from '@/components/BachatGatList';
import MemberList from '@/components/MemberList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  IndianRupee, 
  Calendar,
  UserCheck,
  Crown,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalGroups: number;
  totalMembers: number;
  activeGroups: number;
  totalFunds: number;
  averageContribution: number;
  fullGroups: number;
}

interface BachatGat {
  _id: string;
  name: string;
  description: string;
  members: any[];
  maxMembers: number;
  totalFunds?: number;
  monthlyContribution: number;
  isActive: boolean;
  foundedDate: string;
}

const Admin = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalMembers: 0,
    activeGroups: 0,
    totalFunds: 0,
    averageContribution: 0,
    fullGroups: 0
  });
  const [recentGroups, setRecentGroups] = useState<BachatGat[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<BachatGat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!(user as any)?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      return;
    }
    
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await bachatGatAPI.getAll();
      const groups: BachatGat[] = response.data;
      
      // Calculate statistics
      const totalMembers = groups.reduce((sum, group) => sum + group.members.length, 0);
      const activeGroups = groups.filter(group => group.isActive).length;
      const totalFunds = groups.reduce((sum, group) => sum + (group.totalFunds || 0), 0);
      const totalContribution = groups.reduce((sum, group) => sum + group.monthlyContribution, 0);
      const averageContribution = groups.length > 0 ? totalContribution / groups.length : 0;
      const fullGroups = groups.filter(group => group.members.length >= group.maxMembers).length;
      
      setStats({
        totalGroups: groups.length,
        totalMembers,
        activeGroups,
        totalFunds,
        averageContribution,
        fullGroups
      });
      
      // Get recent groups (last 5)
      const sortedGroups = groups
        .sort((a, b) => new Date(b.foundedDate).getTime() - new Date(a.foundedDate).getTime())
        .slice(0, 5);
      setRecentGroups(sortedGroups);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupSelect = (group: BachatGat) => {
    setSelectedGroup(group);
    setActiveTab('group-details');
  };

  const handleCreateGroup = async (groupData: any) => {
    setIsLoading(true);
    try {
      await bachatGatAPI.create(groupData);
      toast({
        title: "Success",
        description: "Bachat Gat group created successfully",
      });
      fetchDashboardData();
      setIsCreateGroupOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create group",
        variant: "destructive" as any,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has admin privileges (special case)
  const isAdmin = (user as any)?.isAdmin;

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center p-8">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Crown className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Access Denied</h3>
                <p className="text-muted-foreground">
                  You need admin privileges to access this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-prosperity">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage Bachat Gat groups and monitor system activity
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
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="group-details" disabled={!selectedGroup}>
            {selectedGroup ? selectedGroup.name : 'Group Details'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
                <img 
                  src="/logo.jpg" 
                  alt="Sushrimala Logo" 
                  className="h-4 w-4 rounded-full object-contain"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalGroups}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeGroups} active groups
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Across all groups
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Funds</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{stats.totalFunds.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Combined savings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Contribution</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{Math.round(stats.averageContribution)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per month per group
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Full Groups</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.fullGroups}</div>
                <p className="text-xs text-muted-foreground">
                  Groups at capacity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Good</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Groups</CardTitle>
              <CardDescription>
                Latest 5 Bachat Gat groups created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No groups found
                </p>
              ) : (
                <div className="space-y-4">
                  {recentGroups.map((group) => (
                    <div
                      key={group._id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleGroupSelect(group)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.members.length}/{group.maxMembers} members • 
                          ₹{group.monthlyContribution}/month
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={group.isActive ? "default" : "secondary"}>
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {group.members.length >= group.maxMembers && (
                          <Badge variant="destructive">Full</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <BachatGatList 
            showCreateButton={true}
            onGatSelect={handleGroupSelect}
          />
        </TabsContent>

        <TabsContent value="members">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Members</CardTitle>
                <CardDescription>
                  View and manage members across all Bachat Gat groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Select a specific group from the Groups tab to view its members, or implement a global member view here.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="group-details">
          {selectedGroup ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedGroup.name}</CardTitle>
                  <CardDescription>{selectedGroup.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedGroup.members.length}
                      </p>
                      <p className="text-sm text-blue-600">Members</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        ₹{selectedGroup.totalFunds?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-green-600">Total Funds</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{selectedGroup.monthlyContribution}
                      </p>
                      <p className="text-sm text-purple-600">Monthly</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedGroup.maxMembers - selectedGroup.members.length}
                      </p>
                      <p className="text-sm text-yellow-600">Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <MemberList 
                groupId={selectedGroup._id}
                showActions={true}
                showFullDetails={true}
              />
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No Group Selected</h3>
                    <p className="text-muted-foreground">
                      Select a group from the Groups tab to view details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;