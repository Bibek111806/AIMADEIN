import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Users,
  Building2,
  Calendar,
  User,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [noteFieldErrors, setNoteFieldErrors] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [stats, setStats] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState("event");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventDuration, setNewEventDuration] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState(null);

  useEffect(() => {
    refreshDashboardData();
    loadNotes();
  }, []);
  const loadNotes = async () => {
    try {
      const res = await api.get("/notes/");
      setNotes(res.data);
    } catch (error) {
      console.error(error);
    }
  };
  const refreshDashboardData = async () => {
    try {
      const res = await api.get("/dashboard/individual/");
      const data = res.data;

      setStats([
        {
          label: "Job Applications",
          value: data.total_job_applications,
          change: `Last 4 shown`,
          color: "text-blue-600",
        },
        {
          label: "Network Connections",
          value: data.total_connections,
          change: "",
          color: "text-green-600",
        },
        {
          label: "Events",
          value: data.total_events,
          change: "",
          color: "text-orange-600",
        },
      ]);

      setRecentJobs(
        data.recent_job_applications.map((job) => ({
          title: job.job_title,
          company: "Unknown",
          location: "Unknown",
          salary: "",
          posted: new Date(job.created_at).toLocaleDateString(),
          status: "applied",
        }))
      );

      setUpcomingEvents(
        data.upcoming_events.map((event) => ({
          title: event.title,
          date: new Date(event.start_date).toLocaleString(),
          type: "Event",
        }))
      );
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
  };

  const handleAddEvent = async () => {
    try {
      // clear previous errors
      setFieldErrors(null);

      const payload = {
        title: newEventTitle,
        type: newEventType,
        date: newEventDate,
        time: newEventTime,
        duration: newEventDuration,
        location: newEventLocation,
        description: newEventDescription,
      };

      const res = await api.post("/events/", payload);

      toast({
        title: "Event Added",
        description: `Event "${res.data.title}" was added successfully.`,
      });

      setAddEventModalOpen(false);
      clearAddForm();
      refreshDashboardData();
    } catch (error) {
      console.error(error);

      // If validation errors from backend
      if (error?.response?.status === 400 && error.response.data) {
        setFieldErrors(error.response.data);
        toast({
          title: "Validation Error",
          description: "Please fix the highlighted fields.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add event. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  const clearAddForm = () => {
    setNewEventTitle("");
    setNewEventType("event");
    setNewEventDate("");
    setNewEventTime("");
    setNewEventLocation("");
    setNewEventDescription("");
  };

  const handleAddNote = async () => {
    try {
      setNoteFieldErrors(null);

      const payload = {
        title: newNote.title,
        content: newNote.content,
      };

      const res = await api.post("/notes/", payload);

      setNotes([res.data, ...notes]);
      setNewNote({ title: "", content: "" });
      setIsAddingNote(false);

      toast({
        title: "Note Added",
        description: "Your note was saved successfully.",
      });
    } catch (error) {
      console.error(error);

      if (error?.response?.status === 400) {
        setNoteFieldErrors(error.response.data);
        toast({
          title: "Validation Error",
          description: "Please fix the highlighted fields.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add note.",
          variant: "destructive",
        });
      }
    }
  };

const handleEditNote = async (id, updatedFields) => {
  try {
    const noteToUpdate = notes.find((note) => note.id === id);

    const payload = {
      title: updatedFields.title !== undefined ? updatedFields.title : noteToUpdate.title,
      content: updatedFields.content !== undefined ? updatedFields.content : noteToUpdate.content,
    };

    const res = await api.put(`/notes/${id}/`, payload);
    setNotes(
      notes.map((note) => (note.id === id ? res.data : note))
    );
    setEditingNote(null);

    toast({
      title: 'Note Updated',
      description: 'Your changes were saved.',
    });
  } catch (error) {
    console.error(error);
    toast({
      title: 'Error',
      description: 'Failed to update note.',
      variant: 'destructive',
    });
  }
};

  const handleDeleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}/`);
      setNotes(notes.filter((note) => note.id !== id));

      toast({
        title: "Note Deleted",
        description: "The note was removed successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.first_name} {user.middle_name} {user.last_name}!
            🐰
          </h2>
          <p className="text-blue-100 text-lg">
            Ready to advance your AI career today?
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
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
                    onChange={(e) =>
                      setNewNote({ ...newNote, title: e.target.value })
                    }
                  />
                  {noteFieldErrors?.title && (
                    <p className="text-sm text-red-600">
                      {noteFieldErrors.title[0]}
                    </p>
                  )}
                  <Textarea
                    placeholder="Write your note..."
                    value={newNote.content}
                    onChange={(e) =>
                      setNewNote({ ...newNote, content: e.target.value })
                    }
                    rows={3}
                  />
                  {noteFieldErrors?.content && (
                    <p className="text-sm text-red-600">
                      {noteFieldErrors.content[0]}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleAddNote}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddingNote(false)}
                    >
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
                        onBlur={(e) =>
                          handleEditNote(note.id, {
                            title: e.target.value,
                          })
                        }
                      />
                      <Textarea
                        defaultValue={note.content}
                        onBlur={(e) =>
                          handleEditNote(note.id, {
                            content: e.target.value,
                          })
                        }
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
                      <p className="text-sm text-gray-600 mb-2">
                        {note.content}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
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
                    <Badge
                      variant={
                        job.status === "applied" ? "default" : "secondary"
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {job.company} • {job.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {job.salary} • {job.posted}
                  </p>
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
              <CardDescription>
                Don't miss these important dates
              </CardDescription>
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
              <Button
                className="justify-start"
                variant="outline"
                onClick={() => navigate("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
              <Button
                className="justify-start"
                variant="outline"
                onClick={() => navigate("/jobs")}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Browse Jobs
              </Button>
              <Button
                className="justify-start"
                variant="outline"
                onClick={() => navigate("/community")}
              >
                <Users className="mr-2 h-4 w-4" />
                Find Community
              </Button>
              <Button
                className="justify-start"
                variant="outline"
                onClick={() => setAddEventModalOpen(true)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Event Modal */}
      <Dialog open={addEventModalOpen} onOpenChange={setAddEventModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <Input
                placeholder="Title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
              {fieldErrors?.title && (
                <p className="text-sm text-red-600">{fieldErrors.title[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <Select value={newEventType} onValueChange={setNewEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors?.type && (
                <p className="text-sm text-red-600">{fieldErrors.type[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <Input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
              {fieldErrors?.date && (
                <p className="text-sm text-red-600">{fieldErrors.date[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <Input
                type="time"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
              />
              {fieldErrors?.time && (
                <p className="text-sm text-red-600">{fieldErrors.time[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              <Input
                placeholder="e.g. 2 hours"
                value={newEventDuration}
                onChange={(e) => setNewEventDuration(e.target.value)}
              />
              {fieldErrors?.duration && (
                <p className="text-sm text-red-600">
                  {fieldErrors.duration[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <Input
                placeholder="Location"
                value={newEventLocation}
                onChange={(e) => setNewEventLocation(e.target.value)}
              />
              {fieldErrors?.location && (
                <p className="text-sm text-red-600">
                  {fieldErrors.location[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                placeholder="Description"
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
              />
              {fieldErrors?.description && (
                <p className="text-sm text-red-600">
                  {fieldErrors.description[0]}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddEventModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
