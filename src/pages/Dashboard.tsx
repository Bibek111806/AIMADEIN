import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Building2, 
  Calendar, 
  User,
  TrendingUp,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  X
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Dashboard = () => {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Interview Preparation', content: 'Review ML algorithms and prepare for technical questions', createdAt: '2024-01-10' },
    { id: 2, title: 'Network Follow-up', content: 'Send thank you email to Sarah from the AI conference', createdAt: '2024-01-09' }
  ]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const stats = [
    { label: 'Job Applications', value: '12', change: '+3 this week', color: 'text-blue-600' },
    { label: 'Network Connections', value: '84', change: '+8 new', color: 'text-green-600' },
    { label: 'Messages', value: '7', change: '3 unread', color: 'text-purple-600' },
    { label: 'Events', value: '3', change: 'Next: Tomorrow', color: 'text-orange-600' }
  ];

  const recentJobs = [
    { title: 'AI Research Engineer', company: 'TechCorp', location: 'Remote', salary: '$120k-150k', posted: '2 days ago', status: 'applied' },
    { title: 'Machine Learning Engineer', company: 'DataFlow', location: 'San Francisco', salary: '$140k-180k', posted: '5 days ago', status: 'saved' },
    { title: 'AI Product Manager', company: 'StartupAI', location: 'New York', salary: '$130k-160k', posted: '1 week ago', status: 'viewed' }
  ];

  const upcomingEvents = [
    { title: 'AI Career Fair', date: 'Tomorrow, 2:00 PM', type: 'Virtual Event' },
    { title: 'ML Workshop: Deep Learning', date: 'Friday, 10:00 AM', type: 'Education' },
    { title: 'Tech Interview with DataCorp', date: 'Monday, 3:00 PM', type: 'Interview' }
  ];

  const handleAddNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note = {
        id: Date.now(),
        title: newNote.title,
        content: newNote.content,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setNotes([note, ...notes]);
      setNewNote({ title: '', content: '' });
      setIsAddingNote(false);
    }
  };

  const handleEditNote = (id, updatedNote) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, ...updatedNote } : note
    ));
    setEditingNote(null);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome back, Funny Bunny! 🐰</h2>
          <p className="text-blue-100 text-lg">Ready to advance your AI career today?</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Notes */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Quick Notes
                </CardTitle>
                <Button size="sm" onClick={() => setIsAddingNote(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {isAddingNote && (
                <div className="space-y-2 p-3 border rounded-lg">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Write your note..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleAddNote}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsAddingNote(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {notes.map((note) => (
                <div key={note.id} className="p-3 border rounded-lg">
                  {editingNote === note.id ? (
                    <div className="space-y-2">
                      <Input
                        defaultValue={note.title}
                        onBlur={(e) => handleEditNote(note.id, { title: e.target.value })}
                      />
                      <Textarea
                        defaultValue={note.content}
                        onBlur={(e) => handleEditNote(note.id, { content: e.target.value })}
                        rows={3}
                      />
                      <Button size="sm" onClick={() => setEditingNote(null)}>
                        Done
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{note.title}</h4>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setEditingNote(note.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{note.content}</p>
                      <p className="text-xs text-gray-400">{note.createdAt}</p>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Job Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Recent Job Activity
              </CardTitle>
              <CardDescription>Your latest job interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentJobs.map((job, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{job.title}</h4>
                    <Badge variant={job.status === 'applied' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                  <p className="text-xs text-gray-500">{job.salary} • {job.posted}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Don't miss these important dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <p className="text-sm text-gray-600">{event.date}</p>
                  <Badge variant="outline">{event.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button className="justify-start" variant="outline">
                <User className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
              <Button className="justify-start" variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Browse Jobs
              </Button>
              <Button className="justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Find Community
              </Button>
              <Button className="justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Event
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              A complete profile helps you get better job matches and networking opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-gray-500">75%</span>
              </div>
              <Progress value={75} className="w-full" />
              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" variant="outline">Add Skills</Button>
                <Button size="sm" variant="outline">Upload Resume</Button>
                <Button size="sm" variant="outline">Add Experience</Button>
                <Button size="sm" variant="outline">Set Preferences</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
