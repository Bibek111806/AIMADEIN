import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import api from "@/lib/api";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [eventBeingEdited, setEventBeingEdited] = useState<any>(null);
  const [eventBeingDeleted, setEventBeingDeleted] = useState<any>(null);

  // Add form state
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState("event");
  const [newEventDate, setNewEventDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventDuration, setNewEventDuration] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<any>(null);
  const [editFieldErrors, setEditFieldErros] = useState<any>(null);

  useEffect(() => {
    fetchEvents();
    fetchReminders();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events/");
      const parsedEvents = res.data.map((event: any) => ({
        ...event,
        date: new Date(event.date),
      }));
      setEvents(parsedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await api.get("/reminders/");
      setReminders(res.data || []);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    }
  };

  const handleAddEvent = async () => {
    setFieldErrors(null);
    try {
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

      setAddModalOpen(false);
      clearAddForm();
      fetchEvents();
    } catch (error: any) {
      if (error?.response?.status === 400) {
        setFieldErrors(error.response.data);
      } else {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to add event.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    setEditFieldErros(null);
    try {
      const payload = {
        title: eventData.title,
        type: eventData.type,
        date: eventData.date,
        time: eventData.time,
        duration: eventData.duration,
        location: eventData.location,
        description: eventData.description,
      };

      const res = await api.put(`/events/${eventData.id}/`, payload);

      toast({
        title: "Event Updated",
        description: `Event "${res.data.title}" was updated successfully.`,
      });

      setEditModalOpen(false);
      setEventBeingEdited(null);
      fetchEvents();
    } catch (error: any) {
      if (error?.response?.status === 400) {
        setEditFieldErros(error.response.data);
      } else {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to add event.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await api.delete(`/events/${id}/`);
      toast({
        title: "Event Deleted",
        description: "The event was deleted successfully.",
      });
      setDeleteModalOpen(false);
      setEventBeingDeleted(null);
      fetchEvents();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const clearAddForm = () => {
    setNewEventTitle("");
    setNewEventType("event");
    setNewEventDate(format(new Date(), "yyyy-MM-dd"));
    setNewEventTime("");
    setNewEventDuration("");
    setNewEventLocation("");
    setNewEventDescription("");
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "interview":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "event":
        return "bg-green-100 text-green-800 border-green-200";
      case "deadline":
        return "bg-red-100 text-red-800 border-red-200";
      case "education":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "interview":
        return "🎯";
      case "event":
        return "🎪";
      case "deadline":
        return "⏰";
      case "education":
        return "📚";
      default:
        return "📅";
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const getTodayEvents = () => {
    return getEventsForDate(new Date());
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const EventCard = ({ event }: { event: any }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{getEventTypeIcon(event.type)}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span className="mr-4">
                  {format(event.date, "MMM dd, yyyy")}
                </span>
                <Clock className="h-4 w-4 mr-1" />
                <span className="mr-4">{event.time}</span>
                <span>({event.duration})</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{event.location}</span>
              </div>
              <p className="text-gray-700 mb-3">{event.description}</p>
              <div className="flex items-center space-x-2">
                <Badge className={getEventTypeColor(event.type)}>
                  {event.type?.charAt(0).toUpperCase() + event.type?.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEventBeingEdited({
                  ...event,
                  date: format(event.date, "yyyy-MM-dd"),
                });
                setEditModalOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEventBeingDeleted(event);
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TodayEvents = () => {
    const todayEvents = getTodayEvents();
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Today's Schedule
          </CardTitle>
          <CardDescription>
            {todayEvents.length} events scheduled for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayEvents.length > 0 ? (
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="text-lg">{getEventTypeIcon(event.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {event.time} - {event.location}
                    </p>
                  </div>
                  <Badge
                    className={getEventTypeColor(event.type)}
                    variant="outline"
                  >
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No events scheduled for today
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const UpcomingReminders = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Upcoming Reminders
        </CardTitle>
        <CardDescription>Important deadlines and reminders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reminders.length > 0 ? (
            reminders.slice(0, 5).map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{reminder.title}</p>
                  <p className="text-sm text-gray-600">
                    {reminder.date} at {reminder.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No reminders available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">
              Manage your schedule, events, and reminders
            </p>
          </div>
          <div className="flex ">
            
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TodayEvents />
          <UpcomingReminders />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-6 auto-rows-fr">
          {/* CALENDAR CARD */}
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-full flex flex-col">
              <div className="border-t rounded-b-md overflow-hidden flex-grow flex flex-col">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="w-full flex-grow"
                  modifiers={{
                    hasEvents: (date) => getEventsForDate(date).length > 0,
                  }}
                  modifiersStyles={{
                    hasEvents: {
                      backgroundColor: "#dbeafe",
                      fontWeight: "bold",
                    },
                  }}
                />
            
              </div>
            </CardContent>
          </Card>

          {/* EVENTS FOR SELECTED DATE */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{format(selectedDate, "MMM dd, yyyy")}</CardTitle>
              <CardDescription>Events for selected date</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event) => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="text-sm">
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-gray-600">{event.time}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {event.location}
                          </p>
                          <Badge
                            className={`${getEventTypeColor(
                              event.type
                            )} text-xs mt-1`}
                          >
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No events for this date
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              View and manage all your scheduled events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No events found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ADD MODAL */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
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
                placeholder="Duration"
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
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {eventBeingEdited && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input
                    placeholder="Title"
                    value={eventBeingEdited?.title || ""}
                    onChange={(e) =>
                      setEventBeingEdited({
                        ...eventBeingEdited,
                        title: e.target.value,
                      })
                    }
                  />
                  {editFieldErrors?.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {editFieldErrors.title[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <Select
                    value={eventBeingEdited?.type || ""}
                    onValueChange={(value) =>
                      setEventBeingEdited({ ...eventBeingEdited, type: value })
                    }
                  >
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
                  {editFieldErrors?.type && (
                    <p className="text-sm text-red-600 mt-1">
                      {editFieldErrors.type[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={eventBeingEdited?.date || ""}
                    onChange={(e) =>
                      setEventBeingEdited({
                        ...eventBeingEdited,
                        date: e.target.value,
                      })
                    }
                  />
                  {editFieldErrors?.date && (
                    <p className="text-sm text-red-600 mt-1">
                      {editFieldErrors.date[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Time
                  </label>
                  <Input
                    type="time"
                    placeholder="Time"
                    value={eventBeingEdited?.time || ""}
                    onChange={(e) =>
                      setEventBeingEdited({
                        ...eventBeingEdited,
                        time: e.target.value,
                      })
                    }
                  />
                  {editFieldErrors?.time && (
                    <p className="text-sm text-red-600 mt-1">
                      {editFieldErrors.time[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <Input
                    placeholder="Duration"
                    value={eventBeingEdited?.duration || ""}
                    onChange={(e) =>
                      setEventBeingEdited({
                        ...eventBeingEdited,
                        duration: e.target.value,
                      })
                    }
                  />
                  {editFieldErrors?.duration && (
                    <p className="text-sm text-red-600 mt-1">
                      {editFieldErrors.duration[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <Input
                    placeholder="Location"
                    value={eventBeingEdited?.location || ""}
                    onChange={(e) =>
                      setEventBeingEdited({
                        ...eventBeingEdited,
                        location: e.target.value,
                      })
                    }
                  />
                  {editFieldErrors?.location && (
                    <p className="text-sm text-red-600 mt-1">
                      {editFieldErrors.location[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Textarea
                    placeholder="Description"
                    value={eventBeingEdited?.description || ""}
                    onChange={(e) =>
                      setEventBeingEdited({
                        ...eventBeingEdited,
                        description: e.target.value,
                      })
                    }
                  />
                  {editFieldErrors?.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {editFieldErrors.description[0]}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleUpdateEvent(eventBeingEdited)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <CardDescription>
              Do you really want to delete the event "{eventBeingDeleted?.title}
              "?
            </CardDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (eventBeingDeleted) {
                  handleDeleteEvent(eventBeingDeleted.id);
                }
              }}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Calendar;
