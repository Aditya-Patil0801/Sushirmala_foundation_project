import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, 
  Users, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Crown, 
  FileText, 
  Shield,
  PiggyBank,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { bachatGatAPI, memberAPI, loanAPI } from '@/lib/api';
import EnquiryList from '@/components/EnquiryList';

interface BachatGatProfileProps {
  userGroup: any;
  canManageMembers: boolean;
  isOfficer: boolean;
  onUpdate: () => void;
}

const BachatGatProfile = ({ userGroup, canManageMembers, isOfficer, onUpdate }: BachatGatProfileProps) => {
  const { user } = useAuth();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(true);
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member'
  });
  const [locationData, setLocationData] = useState({
    village: userGroup?.location?.village || '',
    district: userGroup?.location?.district || '',
    state: userGroup?.location?.state || ''
  });
  const [groupEditData, setGroupEditData] = useState({
    name: userGroup?.name || '',
    description: userGroup?.description || '',
    registrationNumber: userGroup?.registrationNumber || '',
    foundedDate: userGroup?.foundedDate ? new Date(userGroup.foundedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    monthlyContribution: userGroup?.monthlyContribution || 0,
    bankAccount: {
      accountNumber: userGroup?.bankAccount?.accountNumber || '',
      bankName: userGroup?.bankAccount?.bankName || '',
      ifscCode: userGroup?.bankAccount?.ifscCode || ''
    }
  });
  const { toast } = useToast();

  // Fetch approved loans when component mounts
  useEffect(() => {
    fetchApprovedLoans();
  }, [userGroup._id]);

  const fetchApprovedLoans = async () => {
    setIsLoadingLoans(true);
    try {
      const response = await loanAPI.getByGroup(userGroup._id, { status: 'approved' });
      setApprovedLoans(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching approved loans:', error);
      setApprovedLoans([]);
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddMember = async () => {
    try {
      if (!newMemberData.email) {
        toast({
          title: "Error",
          description: "Email is required to add a member",
          variant: "destructive",
        });
        return;
      }

      await memberAPI.add(userGroup._id, {
        email: newMemberData.email,
        role: newMemberData.role
      });

      toast({
        title: "Success",
        description: "Member added successfully",
      });
      setIsAddMemberOpen(false);
      setNewMemberData({ name: '', email: '', phone: '', role: 'member' });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add member",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${memberName}? This will completely delete their account and all data.`);
    if (!confirmed) return;

    // Optimistic UI update: remove locally first
    const previousMembers = Array.isArray(userGroup?.members) ? [...userGroup.members] : [];
    try {
      // mutate local object to immediately hide removed member
      if (Array.isArray(userGroup?.members)) {
        const updated = previousMembers.filter((m: any) => m._id !== memberId);
        // @ts-ignore - userGroup is passed from parent, we locally mutate for instant UX
        userGroup.members = updated;
      }

      await memberAPI.remove(userGroup._id, memberId);

      toast({
        title: "Success",
        description: "Member removed completely from the system",
      });
      onUpdate();
    } catch (error: any) {
      // revert on failure
      // @ts-ignore
      userGroup.members = previousMembers;
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLocation = async () => {
    try {
      if (!locationData.village || !locationData.district || !locationData.state) {
        toast({
          title: "Error",
          description: "Please fill in all location fields",
          variant: "destructive",
        });
        return;
      }

      // Update via API
      await bachatGatAPI.update(userGroup._id, { location: locationData });
      
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
      
      setIsEditLocationOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update location",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGroup = async () => {
    try {
      if (!groupEditData.name || !groupEditData.description) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Update via API
      await bachatGatAPI.update(userGroup._id, groupEditData);
      
      toast({
        title: "Success",
        description: "Group details updated successfully",
      });
      
      setIsEditGroupOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update group details",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'president': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'secretary': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'treasurer': return <Shield className="h-4 w-4 text-green-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'president': return 'bg-yellow-100 text-yellow-800';
      case 'secretary': return 'bg-blue-100 text-blue-800';
      case 'treasurer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Find member by ID
  const findMemberById = (memberId: string) => {
    return userGroup.members.find((member: any) => member._id === memberId);
  };

  return (
    <div className="space-y-6">
      {/* Group Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <img 
                  src="/logo.jpg" 
                  alt="Sushrimala Logo" 
                  className="h-5 w-5 rounded-full object-contain"
                />
                {userGroup.name}
              </CardTitle>
              <CardDescription>{userGroup.description}</CardDescription>
            </div>
            {canManageMembers && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGroupEditData({
                    name: userGroup.name || '',
                    description: userGroup.description || '',
                    registrationNumber: userGroup.registrationNumber || '',
                    foundedDate: userGroup.foundedDate ? new Date(userGroup.foundedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    monthlyContribution: userGroup.monthlyContribution || 0,
                    bankAccount: {
                      accountNumber: userGroup.bankAccount?.accountNumber || '',
                      bankName: userGroup.bankAccount?.bankName || '',
                      ifscCode: userGroup.bankAccount?.ifscCode || ''
                    }
                  });
                  setIsEditGroupOpen(true);
                }}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Group
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Group Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Group Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Registration Number:</span>
                  <span className="font-medium">{userGroup.registrationNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Founded Date:</span>
                  <span className="font-medium">
                    {new Date(userGroup.foundedDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Members:</span>
                  <span className="font-medium">
                    {userGroup.members.length}/{userGroup.maxMembers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monthly Contribution:</span>
                  <span className="font-medium text-prosperity">
                    {formatCurrency(userGroup.monthlyContribution)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Bank Account</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-medium">
                    {userGroup.bankAccount?.accountNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bank Name:</span>
                  <span className="font-medium">
                    {userGroup.bankAccount?.bankName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">IFSC Code:</span>
                  <span className="font-medium">
                    {userGroup.bankAccount?.ifscCode || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Funds:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(userGroup.totalFunds || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Group Officers */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Group Officers</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    President:
                  </span>
                  <span className="font-medium">
                    {userGroup.president?.name || 'Not assigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Secretary:
                  </span>
                  <span className="font-medium">
                    {userGroup.secretary?.name || 'Not assigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Treasurer:
                  </span>
                  <span className="font-medium">
                    {userGroup.treasurer?.name || 'Not assigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </h3>
              {isOfficer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocationData({
                      village: userGroup.location?.village || '',
                      district: userGroup.location?.district || '',
                      state: userGroup.location?.state || ''
                    });
                    setIsEditLocationOpen(true);
                  }}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Location
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Village:</span>
                <span className="font-medium">{userGroup.location?.village || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">District:</span>
                <span className="font-medium">{userGroup.location?.district || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">State:</span>
                <span className="font-medium">{userGroup.location?.state || 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approved Loans Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-prosperity" />
            Approved Loans in Group
          </CardTitle>
          <CardDescription>
            Recently approved loans by group members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLoans ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="w-6 h-6 border-2 border-prosperity/30 border-t-prosperity rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Loading approved loans...</p>
              </div>
            </div>
          ) : approvedLoans.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No approved loans in the group yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedLoans.map((loan: any) => {
                const member = findMemberById(loan.member);
                return (
                  <div key={loan._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-green-100 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member?.name || 'Unknown Member'}</p>
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                            Approved
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(loan.amount)} • {loan.purpose} • {loan.duration} months
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Approved on: {new Date(loan.approvedDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(loan.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Interest: {loan.interestRate}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-prosperity" />
              Group Members ({userGroup.members.length})
            </CardTitle>
            {canManageMembers && (
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                    <DialogDescription>
                      Add a new member to the Bachat Gat group.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberName">Name</Label>
                      <Input
                        id="memberName"
                        value={newMemberData.name}
                        onChange={(e) => setNewMemberData({...newMemberData, name: e.target.value})}
                        placeholder="Enter member name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberEmail">Email</Label>
                      <Input
                        id="memberEmail"
                        type="email"
                        value={newMemberData.email}
                        onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberPhone">Phone</Label>
                      <Input
                        id="memberPhone"
                        value={newMemberData.phone}
                        onChange={(e) => setNewMemberData({...newMemberData, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberRole">Role</Label>
                      <Select value={newMemberData.role} onValueChange={(value) => setNewMemberData({...newMemberData, role: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="president">President</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                          <SelectItem value="treasurer">Treasurer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMember}>
                        Add Member
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userGroup.members.map((member: any) => (
              <div
                key={member._id}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50"
              >
                <Avatar>
                  <AvatarImage src={member.profilePicture} />
                  <AvatarFallback>
                    {member.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <p className="text-sm font-medium truncate">{member.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`text-xs ${getRoleColor(member.role)}`}>
                      {member.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Joined {new Date(member.joiningDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                {canManageMembers && member.role !== 'president' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member._id, member.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Location Dialog */}
      <Dialog open={isEditLocationOpen} onOpenChange={setIsEditLocationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group Location</DialogTitle>
            <DialogDescription>
              Update the location details for this Bachat Gat group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                value={locationData.village}
                onChange={(e) => setLocationData({...locationData, village: e.target.value})}
                placeholder="Enter village name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={locationData.district}
                onChange={(e) => setLocationData({...locationData, district: e.target.value})}
                placeholder="Enter district name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={locationData.state}
                onChange={(e) => setLocationData({...locationData, state: e.target.value})}
                placeholder="Enter state name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditLocationOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateLocation}>
                Update Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Bachat Gat Details</DialogTitle>
            <DialogDescription>
              Update the details for this Bachat Gat group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={groupEditData.name}
                  onChange={(e) => setGroupEditData({...groupEditData, name: e.target.value})}
                  placeholder="Enter group name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={groupEditData.registrationNumber}
                  onChange={(e) => setGroupEditData({...groupEditData, registrationNumber: e.target.value})}
                  placeholder="Enter registration number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupDescription">Description</Label>
              <Textarea
                id="groupDescription"
                value={groupEditData.description}
                onChange={(e) => setGroupEditData({...groupEditData, description: e.target.value})}
                placeholder="Enter group description"
                rows={3}
              />
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monthly Contribution (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="monthlyContribution"
                    type="number"
                    value={groupEditData.monthlyContribution}
                    onChange={(e) => setGroupEditData({...groupEditData, monthlyContribution: parseFloat(e.target.value) || 0})}
                    placeholder="Enter monthly contribution amount"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="foundedDate">Founded Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="foundedDate"
                    type="date"
                    value={groupEditData.foundedDate}
                    onChange={(e) => setGroupEditData({...groupEditData, foundedDate: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Bank Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={groupEditData.bankAccount.accountNumber}
                    onChange={(e) => setGroupEditData({
                      ...groupEditData,
                      bankAccount: { ...groupEditData.bankAccount, accountNumber: e.target.value }
                    })}
                    placeholder="Enter account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={groupEditData.bankAccount.bankName}
                    onChange={(e) => setGroupEditData({
                      ...groupEditData,
                      bankAccount: { ...groupEditData.bankAccount, bankName: e.target.value }
                    })}
                    placeholder="Enter bank name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={groupEditData.bankAccount.ifscCode}
                    onChange={(e) => setGroupEditData({
                      ...groupEditData,
                      bankAccount: { ...groupEditData.bankAccount, ifscCode: e.target.value }
                    })}
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditGroupOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateGroup}>
                Update Group Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enquiries Section for Officers */}
      {(isOfficer) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-prosperity" />
              Membership Enquiries
            </CardTitle>
            <CardDescription>
              Review and process membership enquiries for your Bachat Gat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnquiryList 
              bachatGatId={userGroup._id} 
              userRole={user?.role || 'member'} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BachatGatProfile;