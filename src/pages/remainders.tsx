import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
 
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast';
import {
  Bell, Plus, Trash2, Edit, Save, X, Clock, Calendar,
  AlertTriangle, CheckCircle, Bookmark, Phone, Flag
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';

// Helper function to get icon based on reminder type
const getTypeIcon = (type) => {
  switch (type) {
    case 'personal':
      return Bookmark;
    case 'followup':
      return Phone;
    case 'deadline':
      return Flag;
    default:
      return Bookmark;
  }
};

// Helper function to get color class for priority badge
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Reminders = () => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
    priority: 'medium',
    type: 'personal'
  });

  useEffect(() => {
    api.get('/reminders/').then(res => setReminders(res.data));
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      due_time: '',
      priority: 'medium',
      type: 'personal'
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const openEditModal = (reminder) => {
    setFormData({
      title: reminder.title,
      description: reminder.description,
      due_date: reminder.due_date,
      due_time: reminder.due_time,
      priority: reminder.priority,
      type: reminder.type
    });
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  const confirmDelete = (reminder) => {
    setReminderToDelete(reminder);
  };

  const handleSaveReminder = async () => {
    if (!formData.title.trim() || !formData.due_date) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      if (editingReminder) {
        const res = await api.put(`/reminders/${editingReminder.id}/`, formData);
        setReminders(reminders.map(r => (r.id === editingReminder.id ? res.data : r)));
        toast({ title: 'Reminder updated successfully' });
      } else {
        const res = await api.post('/reminders/', formData);
        setReminders([res.data, ...reminders]);
        toast({ title: 'Reminder added successfully' });
      }
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleToggleComplete = async (id) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    try {
      const res = await api.put(`/reminders/${id}/`, { ...reminder, completed: !reminder.completed });
      setReminders(reminders.map(r => (r.id === id ? res.data : r)));
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleDeleteReminder = async () => {
    if (!reminderToDelete) return;

    try {
      await api.delete(`/reminders/${reminderToDelete.id}/`);
      setReminders(reminders.filter(r => r.id !== reminderToDelete.id));
      toast({ title: 'Reminder deleted successfully' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }

    setReminderToDelete(null);
  };

  const isOverdue = (dueDate, dueTime) => {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(`${dueDate}T${dueTime || '23:59'}`);
    return due < now;
  };

  const overdueReminders = reminders.filter(r => !r.completed && isOverdue(r.due_date, r.due_time));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
            <p className="text-gray-600 mt-1">Stay on top of your tasks and deadlines</p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-1" />
            Add Reminder
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Active</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reminders.filter(r => !r.completed).length}
                  </p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueReminders.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reminders.filter(r => r.completed).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>All Reminders</CardTitle>
            <CardDescription>
              Manage all your reminders and tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reminders.map((reminder) => {
                const IconComponent = getTypeIcon(reminder.type);
                const overdue = isOverdue(reminder.due_date, reminder.due_time) && !reminder.completed;
                
                return (
                  <div
                    key={reminder.id}
                    className={`p-4 border rounded-lg ${
                      reminder.completed ? 'bg-gray-50 opacity-75' : overdue ? 'border-red-200 bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={reminder.completed}
                          onChange={() => handleToggleComplete(reminder.id)}
                          className="mt-1"
                        />
                        <IconComponent className="h-5 w-5 mt-0.5 text-gray-500" />
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${reminder.completed ? 'line-through text-gray-500' : ''}`}>
                            {reminder.title}
                          </h3>
                          <p className="text-gray-600 mb-2">{reminder.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {reminder.due_date}
                            </div>
                            {reminder.due_time && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {reminder.due_time}
                              </div>
                            )}
                            {overdue && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getPriorityColor(reminder.priority)}>
                              {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)} Priority
                            </Badge>
                            <Badge variant="outline">
                              {reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(reminder)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => confirmDelete(reminder)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Add New Reminder'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Reminder title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="personal">Personal</option>
                    <option value="followup">Follow-up</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="due_time">Due Time</Label>
                  <Input
                    id="due_time"
                    type="time"
                    value={formData.due_time}
                    onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSaveReminder}>
                <Save className="h-4 w-4 mr-1" />
                {editingReminder ? 'Update' : 'Save'} Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!reminderToDelete} onOpenChange={() => setReminderToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the reminder "{reminderToDelete?.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteReminder}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Reminders;