import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { uploadAPI, authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  IndianRupee, 
  CreditCard,
  FileText,
  Upload,
  Edit,
  Eye,
  Crown,
  FileText as FileTextIcon,
  Shield,
  Users,
  Trash2
} from 'lucide-react';

interface PersonalProfileProps {
  user: any;
  canViewProfiles: boolean;
}

const PersonalProfile = ({ user, canViewProfiles }: PersonalProfileProps) => {
  const [isUploadingPassbook, setIsUploadingPassbook] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPassbookOpen, setIsPassbookOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const passbookFileRef = useRef<HTMLInputElement>(null);
  const profileFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { updateUser } = useAuth();

  // State for edit form fields
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age || '',
    occupation: user?.occupation || '',
    monthlyIncome: user?.monthlyIncome || '',
    address: user?.address ? `${user.address.village}, ${user.address.district}, ${user.address.state} - ${user.address.pincode}` : ''
  });

  // Update edit form when user data changes
  useEffect(() => {
    setEditForm({
      name: user?.name || '',
      phone: user?.phone || '',
      age: user?.age || '',
      occupation: user?.occupation || '',
      monthlyIncome: user?.monthlyIncome || '',
      address: user?.address ? `${user.address.village}, ${user.address.district}, ${user.address.state} - ${user.address.pincode}` : ''
    });
  }, [user]);

  const handlePassbookUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a JPEG, PNG, WebP, or PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPassbook(true);
    try {
      const response = await uploadAPI.uploadPassbook(file);
      // Update user data with new passbook file path
      const updatedUser = {
        ...user,
        passbookFile: response.data.filePath
      };
      updateUser(updatedUser);
      
      toast({
        title: "Success",
        description: "Passbook uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload passbook",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPassbook(false);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a JPEG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingProfile(true);
    try {
      const response = await uploadAPI.uploadProfilePicture(file);
      // Update user data with new profile picture path
      const updatedUser = {
        ...user,
        profilePicture: response.data.filePath
      };
      updateUser(updatedUser);
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleDeletePassbook = async () => {
    try {
      await uploadAPI.deletePassbook();
      // Update user data to remove passbook file
      const updatedUser = {
        ...user,
        passbookFile: null
      };
      updateUser(updatedUser);
      
      toast({
        title: "Success",
        description: "Passbook deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete passbook",
        variant: "destructive",
      });
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Parse address string into components
      const addressParts = editForm.address.split(',').map(part => part.trim());
      const pincodeMatch = editForm.address.match(/(\d{6})/);
      
      const updatedUserData = {
        ...user,
        name: editForm.name,
        phone: editForm.phone,
        age: parseInt(editForm.age) || user?.age,
        occupation: editForm.occupation,
        monthlyIncome: parseInt(editForm.monthlyIncome) || user?.monthlyIncome,
        address: {
          village: addressParts[0] || user?.address?.village,
          district: addressParts[1] || user?.address?.district,
          state: addressParts[2]?.split('-')[0]?.trim() || user?.address?.state,
          pincode: pincodeMatch ? pincodeMatch[1] : user?.address?.pincode
        }
      };

      // Send update to backend
      const response = await authAPI.updateProfile(updatedUserData);
      
      // Update local user data
      updateUser(response.data.user);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setIsEditOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'president': return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'secretary': return <FileTextIcon className="h-5 w-5 text-blue-600" />;
      case 'treasurer': return <Shield className="h-5 w-5 text-green-600" />;
      default: return <Users className="h-5 w-5 text-gray-600" />;
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

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getRoleIcon(user?.role)}
                  {user?.name}
                </CardTitle>
                <div className="mt-1">
                  <Badge className={`${getRoleColor(user?.role)}`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {user?.phone}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-prosperity" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <p className="text-sm font-medium">{user?.name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                <p className="text-sm font-medium">{user?.age || 'N/A'} years</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Occupation</Label>
                <p className="text-sm font-medium">{user?.occupation || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Monthly Income</Label>
                <p className="text-sm font-medium text-green-600">
                  {user?.monthlyIncome ? formatCurrency(user.monthlyIncome) : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Aadhar Number</Label>
                <p className="text-sm font-medium">{user?.aadharNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Joining Date</Label>
                <p className="text-sm font-medium">
                  {user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-prosperity" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Village</Label>
                <p className="text-sm font-medium">{user?.address?.village || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">District</Label>
                <p className="text-sm font-medium">{user?.address?.district || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">State</Label>
                <p className="text-sm font-medium">{user?.address?.state || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Pincode</Label>
                <p className="text-sm font-medium">{user?.address?.pincode || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-prosperity" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Current Loan Balance</Label>
                <p className="text-sm font-medium text-red-600">
                  {user?.loanBalance ? formatCurrency(user.loanBalance) : formatCurrency(0)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Interest Rate</Label>
                <p className="text-sm font-medium">{user?.interestRate || 0}% per annum</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Monthly Income</Label>
                <p className="text-sm font-medium text-green-600">
                  {user?.monthlyIncome ? formatCurrency(user.monthlyIncome) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passbook Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-prosperity" />
              Member Passbook
            </CardTitle>
            <CardDescription>
              Upload your physical passbook copy for digital record
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.passbookFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">
                        {user.passbookFile.split('/').pop() || 'Passbook'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded passbook
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => window.open(`http://localhost:5000${user.passbookFile}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => passbookFileRef.current?.click()}
                      disabled={isUploadingPassbook}
                    >
                      <Upload className="h-4 w-4" />
                      {isUploadingPassbook ? 'Uploading...' : 'Replace'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-red-600"
                      onClick={handleDeletePassbook}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  No passbook uploaded yet
                </p>
                <Button 
                  className="gap-2" 
                  onClick={() => passbookFileRef.current?.click()}
                  disabled={isUploadingPassbook}
                >
                  <Upload className="h-4 w-4" />
                  {isUploadingPassbook ? 'Uploading...' : 'Upload Passbook'}
                </Button>
              </div>
            )}
            
            {/* Hidden file input for passbook */}
            <input
              ref={passbookFileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handlePassbookUpload}
              style={{ display: 'none' }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Full Name</Label>
                <Input 
                  id="editName" 
                  value={editForm.name} 
                  onChange={(e) => handleEditFormChange('name', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone Number</Label>
                <Input 
                  id="editPhone" 
                  value={editForm.phone} 
                  onChange={(e) => handleEditFormChange('phone', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAge">Age</Label>
                <Input 
                  id="editAge" 
                  type="number" 
                  value={editForm.age} 
                  onChange={(e) => handleEditFormChange('age', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editOccupation">Occupation</Label>
                <Input 
                  id="editOccupation" 
                  value={editForm.occupation} 
                  onChange={(e) => handleEditFormChange('occupation', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editIncome">Monthly Income</Label>
                <Input 
                  id="editIncome" 
                  type="number" 
                  value={editForm.monthlyIncome} 
                  onChange={(e) => handleEditFormChange('monthlyIncome', e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddress">Address</Label>
              <Textarea 
                id="editAddress" 
                value={editForm.address} 
                onChange={(e) => handleEditFormChange('address', e.target.value)} 
                placeholder="Village, District, State - Pincode"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalProfile;