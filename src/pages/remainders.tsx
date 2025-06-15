
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Reminders = () => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: 'Follow up with TechCorp',
      description: 'Send thank you email after interview',
      dueDate: '2024-01-16',
      dueTime: '10:00',
      priority: 'high',
      completed: false,
      type: 'followup'
    },
    {
      id: 2,
      title: 'Update LinkedIn Profile',
      description: 'Add recent project experience',
      dueDate: '2024-01-18',
      dueTime: '14:00',
      priority: 'medium',
      completed: false,
      type: 'personal'
    },
    {
      id: 3,
      title: 'Application Deadline - StartupAI',
      description: 'Submit application for Senior AI Engineer role',
      dueDate: '2024-01-20',
      dueTime: '23:59',
      priority: 'high',
      completed: false,
      type: 'deadline'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    type: 'personal'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      dueTime: '',
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
      dueDate: reminder.dueDate,
      dueTime: reminder.dueTime || '',
      priority: reminder.priority,
      type: reminder.type
    });
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  const handleSaveReminder = () => {
    if (!formData.title.trim() || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (editingReminder) {
      // Edit existing reminder
      setReminders(reminders.map(reminder =>
        reminder.id === editingReminder.id 
          ? { ...reminder, ...formData }
          : reminder
      ));
      toast({
        title: "Success",
        description: "Reminder updated successfully"
      });
    } else {
      // Add new reminder
      const newReminder = {
        id: Date.now(),
        ...formData,
        completed: false
      };
      setReminders([newReminder, ...reminders]);
      toast({
        title: "Success",
        description: "Reminder added successfully"
      });
    }

    setIsModalOpen(false);
    resetForm();
    setEditingReminder(null);
  };

  const handleToggleComplete = (id) => {
    setReminders(reminders.map(reminder =>
      reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
    ));
  };

  const confirmDelete = (reminder) => {
    setReminderToDelete(reminder);
  };

  const handleDeleteReminder = () => {
    if (reminderToDelete) {
      setReminders(reminders.filter(reminder => reminder.id !== reminderToDelete.id));
      toast({
        title: "Success",
        description: "Reminder deleted successfully"
      });
      setReminderToDelete(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deadline': return AlertTriangle;
      case 'followup': return Bell;
      case 'personal': return Clock;
      default: return Clock;
    }
  };

  const isOverdue = (dueDate, dueTime) => {
    const now = new Date();
    const due = new Date(`${dueDate}T${dueTime || '23:59'}`);
    return due < now;
  };

  const overdueReminders = reminders.filter(r => !r.completed && isOverdue(r.dueDate, r.dueTime));

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
                const overdue = isOverdue(reminder.dueDate, reminder.dueTime) && !reminder.completed;
                
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
                              {reminder.dueDate}
                            </div>
                            {reminder.dueTime && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {reminder.dueTime}
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
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dueTime">Due Time</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
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