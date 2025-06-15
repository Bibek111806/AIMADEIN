
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Filter } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Calendar = () => {
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');

  const mockEvents = [
    {
      id: 1,
      title: 'Interview with DataCorp',
      type: 'interview',
      date: '2024-01-15',
      time: '2:00 PM',
      duration: '1 hour',
      location: 'Virtual Meeting',
      description: 'Technical interview for ML Engineer position',
      attendees: ['John Smith (Interviewer)', 'You'],
      reminder: '15 minutes before'
    },
    {
      id: 2,
      title: 'AI Career Fair',
      type: 'event',
      date: '2024-01-16',
      time: '10:00 AM',
      duration: '4 hours',
      location: 'San Francisco Convention Center',
      description: 'Annual AI and tech career fair with 50+ companies',
      attendees: ['200+ professionals'],
      reminder: '1 day before'
    },
    {
      id: 3,
      title: 'Application Deadline: TechStartup',
      type: 'deadline',
      date: '2024-01-18',
      time: '11:59 PM',
      duration: 'All day',
      location: 'Online',
      description: 'Deadline to submit application for Senior AI Engineer role',
      attendees: ['Personal reminder'],
      reminder: '2 days before'
    },
    {
      id: 4,
      title: 'ML Workshop: Deep Learning',
      type: 'education',
      date: '2024-01-20',
      time: '9:00 AM',
      duration: '3 hours',
      location: 'Virtual Workshop',
      description: 'Hands-on workshop on deep learning fundamentals',
      attendees: ['50 participants'],
      reminder: '1 hour before'
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'interview': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'event': return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'education': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'interview': return '🎯';
      case 'event': return '🎪';
      case 'deadline': return '⏰';
      case 'education': return '📚';
      default: return '📅';
    }
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
                <span className="mr-4">{event.date}</span>
                <Clock className="h-4 w-4 mr-1" />
                <span className="mr-4">{event.time}</span>
                <span>({event.duration})</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="mr-4">{event.location}</span>
                <Users className="h-4 w-4 mr-1" />
                <span>{event.attendees.join(', ')}</span>
              </div>
              <p className="text-gray-700 mb-3">{event.description}</p>
              <div className="flex items-center space-x-2">
                <Badge className={getEventTypeColor(event.type)}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </Badge>
                <Badge variant="outline">
                  🔔 {event.reminder}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">Edit</Button>
            <Button size="sm" variant="ghost">Delete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TodayEvents = () => {
    const todayEvents = mockEvents.filter(event => 
      new Date(event.date).toDateString() === new Date().toDateString()
    );

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
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg">{getEventTypeIcon(event.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.time} - {event.location}</p>
                  </div>
                  <Badge className={getEventTypeColor(event.type)} variant="outline">
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No events scheduled for today</p>
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
        <CardDescription>
          Important deadlines and reminders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
              </div>
              <Badge variant="outline">
                {event.reminder}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">Manage your schedule, events, and reminders</p>
          </div>
          <div className="flex space-x-2">

            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TodayEvents />
          <UpcomingReminders />
        </div>

        {/* View Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  onClick={() => setViewMode('month')}
                  size="sm"
                >
                  Month
                </Button>
                <Button 
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  onClick={() => setViewMode('week')}
                  size="sm"
                >
                  Week
                </Button>
                <Button 
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  onClick={() => setViewMode('day')}
                  size="sm"
                >
                  Day
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">Previous</Button>
                <span className="font-medium">January 2024</span>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Events */}
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              View and manage all your scheduled events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
