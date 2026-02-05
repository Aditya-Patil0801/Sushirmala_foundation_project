import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bachatGatAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import MemberCard from './MemberCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, UserCheck, Crown, RefreshCw } from 'lucide-react';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    village: string;
    district: string;
    state: string;
    pincode: string;
  };
  age: number;
  occupation: string;
  monthlyIncome: number;
  aadharNumber: string;
  role: 'admin' | 'member';
  joiningDate: string;
  isActive: boolean;
  profilePicture?: string;
}

interface BachatGatDetails {
  _id: string;
  name: string;
  description: string;
  members: Member[];
  president?: Member;
  secretary?: Member;
  treasurer?: Member;
  maxMembers: number;
  isActive: boolean;
}

interface MemberListProps {
  groupId?: string;
  showActions?: boolean;
  showFullDetails?: boolean;
}

const MemberList = ({ 
  groupId, 
  showActions = false, 
  showFullDetails = false 
}: MemberListProps) => {
  const [bachatGat, setBachatGat] = useState<BachatGatDetails | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    } else if (user?.bachatGatId) {
      fetchGroupDetails(user.bachatGatId);
    }
  }, [groupId, user]);

  useEffect(() => {
    if (bachatGat) {
      filterMembers();
    }
  }, [searchTerm, selectedTab, bachatGat]);

  const fetchGroupDetails = async (id?: string) => {
    const targetId = id || groupId;
    if (!targetId) return;

    setIsLoading(true);
    try {
      const response = await bachatGatAPI.getById(targetId);
      setBachatGat(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch group details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterMembers = () => {
    if (!bachatGat) return;

    let membersToFilter: Member[] = [];
    
    switch (selectedTab) {
      case 'all':
        membersToFilter = bachatGat.members;
        break;
      case 'officers':
        membersToFilter = bachatGat.members.filter(member => 
          member._id === bachatGat.president?._id ||
          member._id === bachatGat.secretary?._id ||
          member._id === bachatGat.treasurer?._id
        );
        break;
      case 'active':
        membersToFilter = bachatGat.members.filter(member => member.isActive);
        break;
      case 'inactive':
        membersToFilter = bachatGat.members.filter(member => !member.isActive);
        break;
      default:
        membersToFilter = bachatGat.members;
    }

    if (searchTerm) {
      membersToFilter = membersToFilter.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        member.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.address.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.address.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMembers(membersToFilter);
  };

  const handleAssignOfficer = async (memberId: string, position: string) => {
    if (!bachatGat) return;

    try {
      await bachatGatAPI.assignOfficer(bachatGat._id, { memberId, position });
      
      toast({
        title: "Success!",
        description: `Member assigned as ${position} successfully`,
      });
      
      // Refresh group details
      fetchGroupDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to assign ${position}`,
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromGroup = async (memberId: string) => {
    // This would need to be implemented in the backend API
    toast({
      title: "Not Implemented",
      description: "Member removal functionality needs to be implemented",
      variant: "destructive",
    });
  };

  const getOfficerInfo = (member: Member) => {
    if (!bachatGat) return undefined;
    
    if (member._id === bachatGat.president?._id) {
      return { position: 'president' as const };
    }
    if (member._id === bachatGat.secretary?._id) {
      return { position: 'secretary' as const };
    }
    if (member._id === bachatGat.treasurer?._id) {
      return { position: 'treasurer' as const };
    }
    
    return undefined;
  };

  const getTabCounts = () => {
    if (!bachatGat) return { all: 0, officers: 0, active: 0, inactive: 0 };
    
    const officers = bachatGat.members.filter(member => 
      member._id === bachatGat.president?._id ||
      member._id === bachatGat.secretary?._id ||
      member._id === bachatGat.treasurer?._id
    );
    
    return {
      all: bachatGat.members.length,
      officers: officers.length,
      active: bachatGat.members.filter(member => member.isActive).length,
      inactive: bachatGat.members.filter(member => !member.isActive).length
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-prosperity/30 border-t-prosperity rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading group members...</p>
        </div>
      </div>
    );
  }

  if (!bachatGat) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Group Found</h3>
              <p className="text-muted-foreground">
                {groupId ? "The specified group could not be found." : "You are not a member of any Bachat Gat group."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tabCounts = getTabCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-prosperity">{bachatGat.name} Members</h2>
          <p className="text-muted-foreground">
            {bachatGat.members.length} of {bachatGat.maxMembers} members
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchGroupDetails()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Group Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Group Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{bachatGat.members.length}</p>
              <p className="text-sm text-blue-600">Total Members</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{tabCounts.active}</p>
              <p className="text-sm text-green-600">Active Members</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{tabCounts.officers}</p>
              <p className="text-sm text-yellow-600">Officers</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{bachatGat.maxMembers - bachatGat.members.length}</p>
              <p className="text-sm text-purple-600">Available Spots</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Search Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary">{tabCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="officers" className="gap-2">
            <Crown className="h-3 w-3" />
            Officers
            <Badge variant="secondary">{tabCounts.officers}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <UserCheck className="h-3 w-3" />
            Active
            <Badge variant="secondary">{tabCounts.active}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="gap-2">
            Inactive
            <Badge variant="secondary">{tabCounts.inactive}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <MemberGrid 
            members={filteredMembers}
            bachatGat={bachatGat}
            showActions={showActions}
            showFullDetails={showFullDetails}
            onAssignOfficer={handleAssignOfficer}
            onRemoveFromGroup={handleRemoveFromGroup}
            currentUserRole={user?.role}
          />
        </TabsContent>

        <TabsContent value="officers" className="mt-6">
          <MemberGrid 
            members={filteredMembers}
            bachatGat={bachatGat}
            showActions={showActions}
            showFullDetails={showFullDetails}
            onAssignOfficer={handleAssignOfficer}
            onRemoveFromGroup={handleRemoveFromGroup}
            currentUserRole={user?.role}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <MemberGrid 
            members={filteredMembers}
            bachatGat={bachatGat}
            showActions={showActions}
            showFullDetails={showFullDetails}
            onAssignOfficer={handleAssignOfficer}
            onRemoveFromGroup={handleRemoveFromGroup}
            currentUserRole={user?.role}
          />
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          <MemberGrid 
            members={filteredMembers}
            bachatGat={bachatGat}
            showActions={showActions}
            showFullDetails={showFullDetails}
            onAssignOfficer={handleAssignOfficer}
            onRemoveFromGroup={handleRemoveFromGroup}
            currentUserRole={user?.role}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface MemberGridProps {
  members: Member[];
  bachatGat: BachatGatDetails;
  showActions: boolean;
  showFullDetails: boolean;
  onAssignOfficer: (memberId: string, position: string) => void;
  onRemoveFromGroup: (memberId: string) => void;
  currentUserRole?: 'admin' | 'member';
}

const MemberGrid = ({ 
  members, 
  bachatGat, 
  showActions, 
  showFullDetails,
  onAssignOfficer,
  onRemoveFromGroup,
  currentUserRole
}: MemberGridProps) => {
  const getOfficerInfo = (member: Member) => {
    if (member._id === bachatGat.president?._id) {
      return { position: 'president' as const };
    }
    if (member._id === bachatGat.secretary?._id) {
      return { position: 'secretary' as const };
    }
    if (member._id === bachatGat.treasurer?._id) {
      return { position: 'treasurer' as const };
    }
    return undefined;
  };

  if (members.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Members Found</h3>
              <p className="text-muted-foreground">
                No members match your current filters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <MemberCard
          key={member._id}
          member={member}
          isOfficer={getOfficerInfo(member)}
          showFullDetails={showFullDetails}
          showActions={showActions}
          onAssignOfficer={onAssignOfficer}
          onRemoveFromGroup={onRemoveFromGroup}
          currentUserRole={currentUserRole}
        />
      ))}
    </div>
  );
};

export default MemberList;