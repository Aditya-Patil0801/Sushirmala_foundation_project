import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bachatGatAPI } from '@/lib/api';
import EnquiryForm from '@/components/EnquiryForm';
import { 
  Building2,
  ArrowLeft,
  Users,
  Mail
} from 'lucide-react';

const EnquiryPage = () => {
  const navigate = useNavigate();
  const [bachatGats, setBachatGats] = useState<any[]>([]);
  const [selectedGat, setSelectedGat] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBachatGats();
  }, []);

  const fetchBachatGats = async () => {
    setIsLoading(true);
    try {
      const response = await bachatGatAPI.getAvailable();
      // Fix: Extract the data array from the response
      setBachatGats(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching Bachat Gats:', error);
      setBachatGats([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-trust flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-prosperity/30 border-t-prosperity rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Bachat Gats...</p>
        </div>
      </div>
    );
  }

  if (showForm && selectedGat) {
    return (
      <div className="min-h-screen bg-gradient-trust p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowForm(false)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Button>
          </div>
          
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-gradient-prosperity rounded-full flex items-center justify-center">
                  <img 
                    src="/logo.jpg" 
                    alt="Sushrimala Logo" 
                    className="h-6 w-6 rounded-full object-contain"
                  />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-prosperity">
                {selectedGat.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {selectedGat.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedGat.members.length}</p>
                  <p className="text-sm text-blue-600">Members</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">₹{selectedGat.monthlyContribution}</p>
                  <p className="text-sm text-green-600">Monthly Contribution</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{selectedGat.location?.village}</p>
                  <p className="text-sm text-purple-600">Location</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <EnquiryForm 
            bachatGatId={selectedGat._id}
            onSuccess={() => {
              // Optionally show a success message
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-trust p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-prosperity">
              Join a Bachat Gat
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              Select a group you're interested in joining
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bachatGats.map((gat) => (
            <Card key={gat._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              setSelectedGat(gat);
              setShowForm(true);
            }}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <img 
                    src="/logo.jpg" 
                    alt="Sushrimala Logo" 
                    className="h-5 w-5 rounded-full object-contain"
                  />
                  <CardTitle className="text-lg">{gat.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">{gat.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="text-sm font-medium">{gat.location?.village}, {gat.location?.district}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Members</span>
                    <span className="text-sm font-medium">{gat.members.length}/{gat.maxMembers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Contribution</span>
                    <span className="text-sm font-medium text-prosperity">₹{gat.monthlyContribution}</span>
                  </div>
                </div>
                
                <Button className="w-full mt-4 gap-2" variant="prosperity">
                  <Mail className="h-4 w-4" />
                  Enquire Now
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {bachatGats.length === 0 && (
            <Card className="col-span-full text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bachat Gats Available</h3>
                <p className="text-muted-foreground">
                  There are currently no Bachat Gats available for enrollment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiryPage;