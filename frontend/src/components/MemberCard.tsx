import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  CreditCard, 
  Calendar,
  Crown,
  FileText,
  Calculator
} from 'lucide-react';

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

interface MemberCardProps {
  member: Member;
  isOfficer?: {
    position: 'president' | 'secretary' | 'treasurer';
  };
  showFullDetails?: boolean;
  showActions?: boolean;
  onAssignOfficer?: (memberId: string, position: string) => void;
  onRemoveFromGroup?: (memberId: string) => void;
  currentUserRole?: 'admin' | 'user';
}

const MemberCard = ({ 
  member, 
  isOfficer,
  showFullDetails = false,
  showActions = false,
  onAssignOfficer,
  onRemoveFromGroup,
  currentUserRole
}: MemberCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getOfficerBadge = () => {
    if (!isOfficer) return null;
    
    const badgeConfig = {
      president: { label: 'President', color: 'bg-yellow-100 text-yellow-800' },
      secretary: { label: 'Secretary', color: 'bg-blue-100 text-blue-800' },
      treasurer: { label: 'Treasurer', color: 'bg-green-100 text-green-800' }
    };

    const config = badgeConfig[isOfficer.position];
    
    return (
      <Badge className={`gap-1 ${config.color}`}>
        <Crown className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.profilePicture} alt={member.name} />
              <AvatarFallback className="bg-prosperity text-prosperity-foreground">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">{member.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Member since {formatDate(member.joiningDate)}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant={member.isActive ? "default" : "secondary"}>
              {member.isActive ? "Active" : "Inactive"}
            </Badge>
            {getOfficerBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{member.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{member.phone}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <span className="text-muted-foreground">
            {member.address.village}, {member.address.district}
          </span>
        </div>

        {showFullDetails && (
          <>
            {/* Professional Info */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{member.occupation}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {formatCurrency(member.monthlyIncome)}/month
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{member.age} years old</span>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-1 pt-2 border-t">
              <h4 className="text-sm font-medium text-prosperity">Full Address</h4>
              <p className="text-sm text-muted-foreground">
                {member.address.village}, {member.address.district}, 
                {member.address.state} - {member.address.pincode}
              </p>
            </div>

            {/* Identity */}
            <div className="pt-2 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Aadhar: ****-****-{member.aadharNumber.slice(-4)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {showActions && (currentUserRole === 'admin' || isOfficer) && (
        <CardFooter className="pt-4 space-y-2">
          {onAssignOfficer && currentUserRole === 'admin' && (
            <div className="grid grid-cols-3 gap-1 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAssignOfficer(member._id, 'president')}
                disabled={isOfficer?.position === 'president'}
                className="text-xs"
              >
                President
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAssignOfficer(member._id, 'secretary')}
                disabled={isOfficer?.position === 'secretary'}
                className="text-xs"
              >
                Secretary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAssignOfficer(member._id, 'treasurer')}
                disabled={isOfficer?.position === 'treasurer'}
                className="text-xs"
              >
                Treasurer
              </Button>
            </div>
          )}
          
          {onRemoveFromGroup && currentUserRole === 'admin' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemoveFromGroup(member._id)}
              className="w-full"
            >
              Remove from Group
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default MemberCard;