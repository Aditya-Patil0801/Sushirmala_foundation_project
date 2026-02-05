import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, CreditCard, Calendar, Mail } from 'lucide-react';

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

interface BachatGatCardProps {
  bachatGat: BachatGat;
  onJoin?: (id: string) => void;
  onView?: (id: string) => void;
  showJoinButton?: boolean;
  isLoading?: boolean;
}

const BachatGatCard = ({ 
  bachatGat, 
  onJoin, 
  onView, 
  showJoinButton = false, 
  isLoading = false 
}: BachatGatCardProps) => {
  const memberCount = bachatGat.members.length;
  const isFull = memberCount >= bachatGat.maxMembers;
  const availableSpots = bachatGat.maxMembers - memberCount;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-prosperity mb-2">
              {bachatGat.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mb-3">
              {bachatGat.description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1">
            <Badge 
              variant={bachatGat.isActive ? "default" : "secondary"}
              className={bachatGat.isActive ? "bg-green-100 text-green-800" : ""}
            >
              {bachatGat.isActive ? "Active" : "Inactive"}
            </Badge>
            {isFull && (
              <Badge variant="destructive" className="text-xs">
                Full
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            {bachatGat.location.village}, {bachatGat.location.district}, {bachatGat.location.state}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-prosperity" />
            <div className="text-sm">
              <p className="font-medium">{memberCount}/{bachatGat.maxMembers}</p>
              <p className="text-muted-foreground">Members</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-prosperity" />
            <div className="text-sm">
              <p className="font-medium">₹{bachatGat.monthlyContribution}</p>
              <p className="text-muted-foreground">Monthly</p>
            </div>
          </div>
        </div>

        {!isFull && showJoinButton && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium">
              {availableSpots} spot{availableSpots !== 1 ? 's' : ''} available
            </p>
            <p className="text-xs text-green-600 mt-1">
              Join now to be part of this group!
            </p>
          </div>
        )}

        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            Founded {new Date(bachatGat.foundedDate).toLocaleDateString()}
          </span>
        </div>

        {bachatGat.totalFunds !== undefined && (
          <div className="p-3 bg-prosperity/5 rounded-lg">
            <p className="text-sm font-medium text-prosperity">
              Total Funds: ₹{bachatGat.totalFunds.toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 space-x-2">
        {onView && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(bachatGat._id)}
            className="flex-1"
          >
            View Details
          </Button>
        )}
        
        <Link to={`/enquiry/${bachatGat._id}`} className="flex-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
          >
            <Mail className="h-4 w-4" />
            Enquire
          </Button>
        </Link>
        
        {showJoinButton && onJoin && !isFull && bachatGat.isActive && (
          <Button 
            variant="prosperity" 
            size="sm" 
            onClick={() => onJoin(bachatGat._id)}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-prosperity-foreground/30 border-t-prosperity-foreground rounded-full animate-spin" />
                <span>Joining...</span>
              </div>
            ) : (
              'Join Group'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BachatGatCard;