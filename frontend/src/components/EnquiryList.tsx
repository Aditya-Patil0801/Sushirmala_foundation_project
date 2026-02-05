import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { enquiryAPI } from '@/lib/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Home,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X
} from 'lucide-react';

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    village: string;
    district: string;
    state: string;
    pincode: string;
  };
  interestedInJoining: boolean;
  livesInRentedHouse: boolean;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: {
    name: string;
  };
  approvedDate?: string;
  rejectedBy?: {
    name: string;
  };
  rejectedDate?: string;
  remarks?: string;
  createdAt: string;
}

interface EnquiryListProps {
  bachatGatId: string;
  userRole: string;
}

const EnquiryList = ({ bachatGatId, userRole }: EnquiryListProps) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    filterEnquiries();
  }, [selectedTab, enquiries]);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const response = await enquiryAPI.getByGroup(bachatGatId);
      setEnquiries(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching enquiries:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch enquiries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterEnquiries = () => {
    if (selectedTab === 'all') {
      setFilteredEnquiries(enquiries);
    } else {
      setFilteredEnquiries(enquiries.filter(enquiry => enquiry.status === selectedTab));
    }
  };

  const handleApprove = async () => {
    if (!selectedEnquiry) return;

    try {
      await enquiryAPI.approve(selectedEnquiry._id, remarks);
      
      toast({
        title: "Success",
        description: "Enquiry approved successfully",
      });
      
      setIsApproveOpen(false);
      setRemarks('');
      fetchEnquiries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve enquiry",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedEnquiry) return;

    try {
      await enquiryAPI.reject(selectedEnquiry._id, remarks);
      
      toast({
        title: "Success",
        description: "Enquiry rejected successfully",
      });
      
      setIsRejectOpen(false);
      setRemarks('');
      fetchEnquiries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject enquiry",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTabCounts = () => {
    return {
      all: enquiries.length,
      pending: enquiries.filter(e => e.status === 'pending').length,
      approved: enquiries.filter(e => e.status === 'approved').length,
      rejected: enquiries.filter(e => e.status === 'rejected').length
    };
  };

  const tabCounts = getTabCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-prosperity/30 border-t-prosperity rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-prosperity" />
            Membership Enquiries
          </CardTitle>
          <CardDescription>
            Review and process membership enquiries for your Bachat Gat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedTab === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('all')}
              className="gap-2"
            >
              All
              <Badge variant="secondary">{tabCounts.all}</Badge>
            </Button>
            <Button
              variant={selectedTab === 'pending' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('pending')}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Pending
              <Badge variant="secondary">{tabCounts.pending}</Badge>
            </Button>
            <Button
              variant={selectedTab === 'approved' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('approved')}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approved
              <Badge variant="secondary">{tabCounts.approved}</Badge>
            </Button>
            <Button
              variant={selectedTab === 'rejected' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('rejected')}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Rejected
              <Badge variant="secondary">{tabCounts.rejected}</Badge>
            </Button>
          </div>

          {/* Enquiries List */}
          {filteredEnquiries.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No enquiries found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnquiries.map((enquiry) => (
                <div
                  key={enquiry._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      {getStatusIcon(enquiry.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{enquiry.name}</p>
                        <Badge className={`text-xs ${getStatusColor(enquiry.status)}`}>
                          {enquiry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {enquiry.email} • {enquiry.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {enquiry.address.village}, {enquiry.address.district}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEnquiry(enquiry);
                        setIsViewOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    
                    {enquiry.status === 'pending' && ['president', 'secretary'].includes(userRole) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setIsApproveOpen(true);
                          }}
                          className="gap-2 text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setIsRejectOpen(true);
                          }}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Enquiry Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              Detailed information about the membership enquiry
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="text-sm font-medium">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm font-medium">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm font-medium">{selectedEnquiry.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Submitted On</Label>
                    <p className="text-sm font-medium">
                      {new Date(selectedEnquiry.createdAt).toLocaleDateString('en-IN')}{' '}
                      {new Date(selectedEnquiry.createdAt).toLocaleTimeString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Address Information</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Street Address</Label>
                    <p className="text-sm font-medium">{selectedEnquiry.address.street}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Village</Label>
                      <p className="text-sm font-medium">{selectedEnquiry.address.village}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">District</Label>
                      <p className="text-sm font-medium">{selectedEnquiry.address.district}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">State</Label>
                      <p className="text-sm font-medium">{selectedEnquiry.address.state}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Pincode</Label>
                    <p className="text-sm font-medium">{selectedEnquiry.address.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Additional Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Interested in joining our Bachat Gat?</span>
                    <Badge variant={selectedEnquiry.interestedInJoining ? "default" : "secondary"}>
                      {selectedEnquiry.interestedInJoining ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Do you stay in a rented house?</span>
                    <Badge variant={selectedEnquiry.livesInRentedHouse ? "default" : "secondary"}>
                      {selectedEnquiry.livesInRentedHouse ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              {selectedEnquiry.status !== 'pending' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Status Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">Status</span>
                      <Badge className={getStatusColor(selectedEnquiry.status)}>
                        {selectedEnquiry.status}
                      </Badge>
                    </div>
                    {selectedEnquiry.approvedBy && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm font-medium">Approved By</span>
                        <span className="text-sm">{selectedEnquiry.approvedBy.name}</span>
                      </div>
                    )}
                    {selectedEnquiry.approvedDate && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm font-medium">Approved On</span>
                        <span className="text-sm">
                          {new Date(selectedEnquiry.approvedDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}
                    {selectedEnquiry.rejectedBy && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm font-medium">Rejected By</span>
                        <span className="text-sm">{selectedEnquiry.rejectedBy.name}</span>
                      </div>
                    )}
                    {selectedEnquiry.rejectedDate && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm font-medium">Rejected On</span>
                        <span className="text-sm">
                          {new Date(selectedEnquiry.rejectedDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}
                    {selectedEnquiry.remarks && (
                      <div className="p-3 border rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground">Remarks</Label>
                        <p className="text-sm mt-1">{selectedEnquiry.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Enquiry Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Enquiry</DialogTitle>
            <DialogDescription>
              Approve this membership enquiry
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  Are you sure you want to approve {selectedEnquiry.name}'s membership enquiry?
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approveRemarks">Remarks (Optional)</Label>
                <Textarea
                  id="approveRemarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any remarks for this approval"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsApproveOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApprove} className="gap-2">
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Enquiry Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Enquiry</DialogTitle>
            <DialogDescription>
              Reject this membership enquiry
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  Are you sure you want to reject {selectedEnquiry.name}'s membership enquiry?
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejectRemarks">Remarks (Required)</Label>
                <Textarea
                  id="rejectRemarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Please provide a reason for rejection"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleReject} 
                  className="gap-2"
                  disabled={!remarks.trim()}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnquiryList;