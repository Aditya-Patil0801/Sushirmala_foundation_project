import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bachatGatAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import BachatGatCard from './BachatGatCard';
import CreateBachatGatForm from './CreateBachatGatForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, RefreshCw, MapPin, Users } from 'lucide-react';

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
  foundedDate: string;
  isActive: boolean;
  totalFunds?: number;
}

interface BachatGatListProps {
  showCreateButton?: boolean;
  showJoinButtons?: boolean;
  onGatSelect?: (gat: BachatGat) => void;
}

const BachatGatList = ({ 
  showCreateButton = false, 
  showJoinButtons = false,
  onGatSelect 
}: BachatGatListProps) => {
  const [allGats, setAllGats] = useState<BachatGat[]>([]);
  const [availableGats, setAvailableGats] = useState<BachatGat[]>([]);
  const [filteredGats, setFilteredGats] = useState<BachatGat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchGats();
  }, []);

  useEffect(() => {
    filterGats();
  }, [searchTerm, selectedTab, allGats, availableGats]);

  const fetchGats = async () => {
    setIsLoading(true);
    try {
      // Fetch all groups for admin, available groups for users
      const [allResponse, availableResponse] = await Promise.all([
        user?.role === 'admin' ? bachatGatAPI.getAll() : bachatGatAPI.getAvailable(),
        bachatGatAPI.getAvailable()
      ]);

      setAllGats(Array.isArray(allResponse.data) ? allResponse.data : []);
      setAvailableGats(Array.isArray(availableResponse.data) ? availableResponse.data : []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch Bachat Gats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterGats = () => {
    let gatsToFilter: BachatGat[] = [];
    
    switch (selectedTab) {
      case 'all':
        gatsToFilter = allGats;
        break;
      case 'available':
        gatsToFilter = availableGats;
        break;
      case 'full':
        gatsToFilter = allGats.filter(gat => gat.members.length >= gat.maxMembers);
        break;
      default:
        gatsToFilter = allGats;
    }

    if (searchTerm) {
      gatsToFilter = gatsToFilter.filter(gat =>
        gat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gat.location.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gat.location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gat.location.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGats(gatsToFilter);
  };

  const handleJoinGat = async (gatId: string) => {
    if (!user || user.bachatGatId) {
      toast({
        title: "Cannot Join",
        description: user?.bachatGatId 
          ? "You are already a member of a Bachat Gat" 
          : "Please login to join a group",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(gatId);
    try {
      await bachatGatAPI.join(gatId);
      
      toast({
        title: "Success!",
        description: "You have successfully joined the Bachat Gat",
      });
      
      // Refresh the data
      fetchGats();
      
      // If there's a callback for selection, call it
      const joinedGat = allGats.find(gat => gat._id === gatId);
      if (joinedGat && onGatSelect) {
        onGatSelect(joinedGat);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to join Bachat Gat",
        variant: "destructive",
      });
    } finally {
      setIsJoining(null);
    }
  };

  const handleViewGat = (gatId: string) => {
    const gat = allGats.find(g => g._id === gatId);
    if (gat && onGatSelect) {
      onGatSelect(gat);
    }
  };

  const getTabCounts = () => {
    return {
      all: allGats.length,
      available: availableGats.length,
      full: allGats.filter(gat => gat.members.length >= gat.maxMembers).length
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-prosperity/30 border-t-prosperity rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Bachat Gats...</p>
        </div>
      </div>
    );
  }

  const tabCounts = getTabCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-prosperity">Bachat Gat Groups</h2>
          <p className="text-muted-foreground">
            {user?.role === 'admin' 
              ? 'Manage all Bachat Gat groups' 
              : 'Browse and join available women\'s self-help groups'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGats}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {showCreateButton && user?.role === 'admin' && (
            <CreateBachatGatForm onSuccess={fetchGats} />
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="gap-2">
            All Groups
            <Badge variant="secondary">{tabCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="available" className="gap-2">
            Available
            <Badge variant="secondary">{tabCounts.available}</Badge>
          </TabsTrigger>
          <TabsTrigger value="full" className="gap-2">
            Full
            <Badge variant="secondary">{tabCounts.full}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <GatGrid 
            gats={filteredGats}
            showJoinButtons={showJoinButtons}
            onJoin={handleJoinGat}
            onView={handleViewGat}
            isJoining={isJoining}
          />
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <GatGrid 
            gats={filteredGats}
            showJoinButtons={showJoinButtons}
            onJoin={handleJoinGat}
            onView={handleViewGat}
            isJoining={isJoining}
          />
        </TabsContent>

        <TabsContent value="full" className="mt-6">
          <GatGrid 
            gats={filteredGats}
            showJoinButtons={false}
            onJoin={handleJoinGat}
            onView={handleViewGat}
            isJoining={isJoining}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface GatGridProps {
  gats: BachatGat[];
  showJoinButtons: boolean;
  onJoin: (id: string) => void;
  onView: (id: string) => void;
  isJoining: string | null;
}

const GatGrid = ({ gats, showJoinButtons, onJoin, onView, isJoining }: GatGridProps) => {
  if (gats.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Groups Found</h3>
              <p className="text-muted-foreground">
                No Bachat Gat groups match your current filters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gats.map((gat) => (
        <BachatGatCard
          key={gat._id}
          bachatGat={gat}
          showJoinButton={showJoinButtons}
          onJoin={onJoin}
          onView={onView}
          isLoading={isJoining === gat._id}
        />
      ))}
    </div>
  );
};

export default BachatGatList;