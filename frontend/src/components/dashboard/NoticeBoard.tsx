import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { schemeAPI, meetingAPI } from '@/lib/api';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  FileText, 
  Users, 
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Megaphone,
  BookOpen,
  MessageSquare,
  Eye
} from 'lucide-react';

interface NoticeBoardProps {
  userGroup: any;
  canManageMembers: boolean;
  onUpdate: () => void;
}

const NoticeBoard = ({ userGroup, canManageMembers, onUpdate }: NoticeBoardProps) => {
  const [isAddSchemeOpen, setIsAddSchemeOpen] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [newScheme, setNewScheme] = useState({
    title: '',
    description: '',
    url: '',
    startDate: '',
    endDate: ''
  });
  const [newMeeting, setNewMeeting] = useState({
    date: '',
    agenda: '',
    decisions: '',
    nextMeetingDate: '',
    attendees: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchemes();
    fetchMeetings();
  }, []);

  const fetchSchemes = async () => {
    try {
      const response = await schemeAPI.getByGroup(userGroup._id);
      setSchemes(response.data);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      // Fallback to empty array if no schemes
      setSchemes([]);
    }
  };

  const handleAddScheme = async () => {
    try {
      if (!newScheme.title || !newScheme.description || !newScheme.startDate) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      await schemeAPI.create(userGroup._id, newScheme);
      
      toast({
        title: "Success",
        description: "Scheme added successfully",
      });
      
      setIsAddSchemeOpen(false);
      setNewScheme({ title: '', description: '', url: '', startDate: '', endDate: '' });
      fetchSchemes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add scheme",
        variant: "destructive",
      });
    }
  };

  const handleDeleteScheme = async (schemeId: string) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this scheme? This action cannot be undone.');
      if (!confirmed) return;

      await schemeAPI.delete(userGroup._id, schemeId);
      
      toast({
        title: "Success",
        description: "Scheme deleted successfully",
      });
      
      fetchSchemes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete scheme",
        variant: "destructive",
      });
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await meetingAPI.getAll();
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // Fallback to empty array if no meetings
      setMeetings([]);
    }
  };


  const handleAddMeeting = async () => {
    try {
      if (!newMeeting.date || !newMeeting.agenda) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Create new meeting via API
      const meetingData = {
        date: newMeeting.date,
        agenda: newMeeting.agenda,
        nextMeetingDate: newMeeting.nextMeetingDate || null,
        attendees: newMeeting.attendees
      };

      const response = await meetingAPI.create(meetingData);
      
      // Add decisions if provided
      if (newMeeting.decisions.trim()) {
        const decisions = newMeeting.decisions.split('\n').filter(d => d.trim());
        await meetingAPI.updateDecisions(response.data.meeting._id, decisions);
      }
      
      toast({
        title: "Success",
        description: "Meeting minutes added successfully",
      });
      
      setIsAddMeetingOpen(false);
      setNewMeeting({ date: '', agenda: '', decisions: '', nextMeetingDate: '', attendees: [] });
      fetchMeetings(); // Refresh meetings list
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add meeting minutes",
        variant: "destructive",
      });
    }
  };

  const handleEditMeeting = async () => {
    try {
      // This would integrate with your backend API
      toast({
        title: "Success",
        description: "Meeting minutes updated successfully",
      });
      setIsEditMeetingOpen(false);
      setSelectedMeeting(null);
      fetchMeetings();
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update meeting minutes",
        variant: "destructive",
      });
    }
  };


  const getSchemeStatus = (scheme: any) => {
    const now = new Date();
    if (scheme.startDate > now) return 'upcoming';
    if (scheme.endDate < now) return 'completed';
    return 'active';
  };

  const getSchemeStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      {canManageMembers && (
        <div className="flex gap-4">
          <Dialog open={isAddSchemeOpen} onOpenChange={setIsAddSchemeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Scheme
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Scheme</DialogTitle>
                <DialogDescription>
                  Create a new scheme for the Bachat Gat group.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schemeTitle">Scheme Title</Label>
                  <Input
                    id="schemeTitle"
                    value={newScheme.title}
                    onChange={(e) => setNewScheme({...newScheme, title: e.target.value})}
                    placeholder="Enter scheme title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schemeDescription">Description</Label>
                  <Textarea
                    id="schemeDescription"
                    value={newScheme.description}
                    onChange={(e) => setNewScheme({...newScheme, description: e.target.value})}
                    placeholder="Enter scheme description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schemeUrl">Website URL (optional)</Label>
                  <Input
                    id="schemeUrl"
                    value={newScheme.url}
                    onChange={(e) => setNewScheme({...newScheme, url: e.target.value})}
                    placeholder="https://example.com/scheme-details"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schemeStartDate">Start Date</Label>
                    <Input
                      id="schemeStartDate"
                      type="date"
                      value={newScheme.startDate}
                      onChange={(e) => setNewScheme({...newScheme, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schemeEndDate">End Date</Label>
                    <Input
                      id="schemeEndDate"
                      type="date"
                      value={newScheme.endDate}
                      onChange={(e) => setNewScheme({...newScheme, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddSchemeOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddScheme}>
                    Add Scheme
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Meeting Minutes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Meeting Minutes</DialogTitle>
                <DialogDescription>
                  Record the minutes of a group meeting.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingDate">Meeting Date</Label>
                  <Input
                    id="meetingDate"
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingAgenda">Agenda</Label>
                  <Textarea
                    id="meetingAgenda"
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting({...newMeeting, agenda: e.target.value})}
                    placeholder="Enter meeting agenda"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingDecisions">Decisions Made</Label>
                  <Textarea
                    id="meetingDecisions"
                    value={newMeeting.decisions}
                    onChange={(e) => setNewMeeting({...newMeeting, decisions: e.target.value})}
                    placeholder="Enter key decisions made in the meeting"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextMeetingDate">Next Meeting Date</Label>
                  <Input
                    id="nextMeetingDate"
                    type="date"
                    value={newMeeting.nextMeetingDate}
                    onChange={(e) => setNewMeeting({...newMeeting, nextMeetingDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attendees</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-auto p-2 border rounded">
                    {userGroup.members.map((m: any) => {
                      const checked = newMeeting.attendees.includes(m._id);
                      return (
                        <label key={m._id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(newMeeting.attendees);
                              if (e.target.checked) next.add(m._id); else next.delete(m._id);
                              setNewMeeting({ ...newMeeting, attendees: Array.from(next) });
                            }}
                          />
                          <span>{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddMeetingOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMeeting}>
                    Add Meeting Minutes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Schemes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-prosperity" />
            Active Schemes
          </CardTitle>
          <CardDescription>
            Current schemes and programs available for group members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schemes.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No schemes available
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {schemes.map((scheme) => {
                  const status = getSchemeStatus(scheme);
                  return (
                    <div
                      key={scheme._id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{scheme.title}</h3>
                          <Badge className={`text-xs ${getSchemeStatusColor(status)}`}>
                            {status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {scheme.description}
                        </p>
                        {scheme.url && (
                          <div className="mb-2">
                            <a 
                              href={scheme.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              View scheme details
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Start: {new Date(scheme.startDate).toLocaleDateString('en-IN')}
                          </span>
                          {scheme.endDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              End: {new Date(scheme.endDate).toLocaleDateString('en-IN')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Created by: {scheme.createdBy?.name || 'System'}
                          </span>
                        </div>
                      </div>
                      {canManageMembers && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteScheme(scheme._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meeting Minutes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-prosperity" />
            Meeting Minutes
          </CardTitle>
          <CardDescription>
            Records of group meetings and decisions made
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meetings.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No meeting minutes available
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          Meeting - {new Date(meeting.date).toLocaleDateString('en-IN')}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {meeting.attendees.length} attendees
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Agenda:</p>
                          <p className="text-sm">{meeting.agenda}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Key Decisions:</p>
                          <ul className="text-sm list-disc list-inside space-y-1">
                            {meeting.decisions.map((decision, index) => (
                              <li key={index}>{decision}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Next meeting: {new Date(meeting.nextMeetingDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setIsEditMeetingOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      {canManageMembers && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setIsEditMeetingOpen(true);
                          }}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Meeting Dialog */}
      <Dialog open={isEditMeetingOpen} onOpenChange={setIsEditMeetingOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Meeting Details</DialogTitle>
            <DialogDescription>
              View and edit meeting minutes
            </DialogDescription>
          </DialogHeader>
          {selectedMeeting && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Meeting Date</Label>
                <p className="text-sm font-medium">
                  {new Date(selectedMeeting.date).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Agenda</Label>
                <p className="text-sm">{selectedMeeting.agenda}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Attendees</Label>
                <div className="space-y-1">
                  {selectedMeeting.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm">{attendee.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {attendee.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Decisions Made</Label>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {selectedMeeting.decisions.map((decision, index) => (
                    <li key={index}>{decision}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Next Meeting Date</Label>
                <p className="text-sm font-medium">
                  {new Date(selectedMeeting.nextMeetingDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoticeBoard;
