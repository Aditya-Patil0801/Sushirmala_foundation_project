import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { contributionAPI } from '@/lib/api';
import { 
  IndianRupee, 
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Edit,
  Trash2
} from 'lucide-react';

interface ContributionStatusProps {
  userGroup: any;
  user: any;
  onOpenRecordContribution?: (memberId: string) => void; // Add this prop
}

const ContributionStatus = ({ userGroup, user, onOpenRecordContribution }: ContributionStatusProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [paidMembers, setPaidMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Check if user is an officer (president, secretary, or treasurer)
  const isOfficer = ['president', 'secretary', 'treasurer'].includes(user?.role);

  useEffect(() => {
    fetchPaidMembers();
  }, [currentMonth, currentYear, userGroup._id]);

  const fetchPaidMembers = async () => {
    setIsLoading(true);
    try {
      const response = await contributionAPI.getPaidMembers(
        userGroup._id, 
        { month: currentMonth, year: currentYear }
      );
      setPaidMembers(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching paid members:', error);
      setPaidMembers([]);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch contribution data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isMemberPaid = (memberId: string) => {
    return paidMembers.some(contribution => contribution.memberId._id === memberId);
  };

  const getMemberContribution = (memberId: string) => {
    return paidMembers.find(contribution => contribution.memberId._id === memberId);
  };

  const handleDeleteContribution = async (contributionId: string) => {
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to mark this contribution as not paid?')) {
      return;
    }

    setIsDeleting(contributionId);
    try {
      await contributionAPI.delete(contributionId);
      
      toast({
        title: "Success",
        description: "Contribution status updated successfully",
      });

      // Refresh the data
      fetchPaidMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update contribution status",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - 2 + i
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-prosperity/30 border-t-prosperity rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading contribution status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-prosperity" />
                Monthly Contribution Status
              </CardTitle>
              <CardDescription>
                Track payment status for {monthNames[currentMonth - 1]} {currentYear}
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={currentMonth.toString()} 
                onValueChange={(value) => setCurrentMonth(parseInt(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={currentYear.toString()} 
                onValueChange={(value) => setCurrentYear(parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userGroup.members.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No members in this group
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userGroup.members.map((member: any) => {
                  const isPaid = isMemberPaid(member._id);
                  const contribution = getMemberContribution(member._id);
                  
                  return (
                    <div 
                      key={member._id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${isPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {isPaid ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {isPaid && contribution ? (
                          <>
                            <div className="flex items-center justify-end gap-1">
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Paid
                              </Badge>
                              {isOfficer && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleDeleteContribution(contribution._id)}
                                  disabled={isDeleting === contribution._id}
                                >
                                  {isDeleting === contribution._id ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                  )}
                                </Button>
                              )}
                            </div>
                            <p className="text-sm font-medium text-green-600 mt-1">
                              ₹{contribution.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(contribution.createdAt).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Not Paid
                            </Badge>
                            {isOfficer && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  // If onOpenRecordContribution is provided, use it to open the record contribution dialog
                                  if (onOpenRecordContribution) {
                                    onOpenRecordContribution(member._id);
                                  } else {
                                    // Fallback to showing a message
                                    toast({
                                      title: "Action Required",
                                      description: "Use the 'Record Contribution' feature to mark this member as paid",
                                    });
                                  }
                                }}
                              >
                                <Edit className="h-3 w-3 text-green-600" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributionStatus;