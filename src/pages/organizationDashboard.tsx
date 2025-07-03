import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Plus,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

const OrganizationDashboard = () => {
  const { toast } = useToast();

  // Dashboard data
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  // Modal states
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [editingInterview, setEditingInterview] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState('');

  // Forms
  const [jobForm, setJobForm] = useState({
    title: '',
    status: 'active',
    deadline: '',
    salary: '',
    description: ''
  });

  const [interviewForm, setInterviewForm] = useState({
    candidate: '',
    position: '',
    time: '',
    type: 'Phone Screen',
    status: 'scheduled'
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/');
        const data = res.data;

        setActiveJobs(data.active_jobs || []);
        setRecentCandidates(data.recent_candidates || []);
        setUpcomingInterviews(data.upcoming_interviews || []);

        setStats([
          {
            label: 'Active Job Postings',
            value: data.active_jobs_count || 0,
            change: '+2 this week',
            color: 'text-blue-600'
          },
          {
            label: 'Total Applications',
            value: data.total_applications || 0,
            change: '+38 new',
            color: 'text-green-600'
          },
          {
            label: 'Interviews Scheduled',
            value: data.total_interviews || 0,
            change: '5 today',
            color: 'text-purple-600'
          }
        ]);
      } catch (err) {
        console.error(err);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive'
        });
      }
    };

    fetchDashboard();
  }, []);

  // Job handlers
  const openJobModal = (job = null) => {
    if (job) {
      setJobForm({
        title: job.title,
        status: job.status,
        deadline: job.deadline,
        salary: job.salary,
        description: job.description || ''
      });
      setEditingJob(job);
    } else {
      setJobForm({
        title: '',
        status: 'active',
        deadline: '',
        salary: '',
        description: ''
      });
      setEditingJob(null);
    }
    setIsJobModalOpen(true);
  };

  const handleSaveJob = () => {
    toast({
      title: 'Success',
      description: editingJob ? 'Job updated.' : 'Job posted.'
    });
    setIsJobModalOpen(false);
  };

  // Interview handlers
  const openInterviewModal = (interview = null) => {
    if (interview) {
      setInterviewForm({ ...interview });
      setEditingInterview(interview);
    } else {
      setInterviewForm({
        candidate: '',
        position: '',
        time: '',
        type: 'Phone Screen',
        status: 'scheduled'
      });
      setEditingInterview(null);
    }
    setIsInterviewModalOpen(true);
  };

  const handleSaveInterview = () => {
    toast({
      title: 'Success',
      description: editingInterview
        ? 'Interview updated.'
        : 'Interview scheduled.'
    });
    setIsInterviewModalOpen(false);
  };

  const confirmDelete = (item: any, type: string) => {
    setItemToDelete(item);
    setDeleteType(type);
  };

  const handleDelete = () => {
    toast({
      title: 'Deleted',
      description: `${deleteType} deleted successfully.`
    });
    setItemToDelete(null);
    setDeleteType('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">TechCorp Dashboard 🏢</h2>
          <p className="text-indigo-100 text-lg">
            Manage your talent acquisition and team growth
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
                    <p
                      className={`text-2xl font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.change}
                    </p>
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
          {/* Active Jobs */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Active Job Postings
                </CardTitle>
                <Button size="sm" onClick={() => openJobModal()}>
                  <Plus className="h-4 w-4 mr-1" />
                  New Job
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="space-y-2 p-3 border rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{job.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          job.status === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {job.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openJobModal(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => confirmDelete(job, 'job')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {job.applications} applications
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Posted {job.posted}</span>
                    <span>Deadline: {job.deadline}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Candidates */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Recent Candidates
                </CardTitle>
              </div>
              <CardDescription>
                Latest applicants in your pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCandidates.slice(0, 4).map((candidate) => (
                <div key={candidate.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">
                        {candidate.user?.first_name}{' '}
                        {candidate.user?.middle_name}{' '}
                        {candidate.user?.last_name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {candidate.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">
                      {candidate.stage || 'Applied'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {candidate.applied}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Interviews
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => openInterviewModal()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Interview
                </Button>
              </div>
              <CardDescription>
                Don&apos;t miss these scheduled interviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingInterviews.slice(0, 4).map((interview) => (
                <div
                  key={interview.id}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">
                        {interview.candidate}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {interview.position}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {interview.type}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          openInterviewModal(interview)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          confirmDelete(interview, 'interview')
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {interview.time}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                className="justify-start"
                variant="outline"
                onClick={() => openJobModal()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
              <Button
                className="justify-start"
                variant="outline"
                onClick={() => toast({ title: 'Coming soon!' })}
              >
                <Users className="mr-2 h-4 w-4" />
                Review Candidates
              </Button>
              <Button
                className="justify-start"
                variant="outline"
                onClick={() => openInterviewModal()}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interviews
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingJob ? 'Edit Job' : 'Post New Job'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={jobForm.status}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        status: e.target.value
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={jobForm.deadline}
                    onChange={(e) =>
                      setJobForm({
                        ...jobForm,
                        deadline: e.target.value
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  placeholder="e.g., $100k-130k"
                  value={jobForm.salary}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, salary: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Job description..."
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      description: e.target.value
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsJobModalOpen(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSaveJob}>
                <Save className="h-4 w-4 mr-1" />
                {editingJob ? 'Update' : 'Post'} Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isInterviewModalOpen}
          onOpenChange={setIsInterviewModalOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingInterview
                  ? 'Edit Interview'
                  : 'Schedule New Interview'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candidate">Candidate *</Label>
                  <Input
                    id="candidate"
                    value={interviewForm.candidate}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        candidate: e.target.value
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={interviewForm.position}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        position: e.target.value
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time">Date & Time *</Label>
                  <Input
                    id="time"
                    placeholder="e.g., Today, 2:00 PM"
                    value={interviewForm.time}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        time: e.target.value
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={interviewForm.type}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        type: e.target.value
                      })
                    }
                  >
                    <option value="Phone Screen">Phone Screen</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural Fit">Cultural Fit</option>
                    <option value="Final">Final</option>
                    <option value="Panel">Panel</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={interviewForm.status}
                  onChange={(e) =>
                    setInterviewForm({
                      ...interviewForm,
                      status: e.target.value
                    })
                  }
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsInterviewModalOpen(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSaveInterview}>
                <Save className="h-4 w-4 mr-1" />
                {editingInterview ? 'Update' : 'Schedule'} Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={!!itemToDelete}
          onOpenChange={() => {
            setItemToDelete(null);
            setDeleteType('');
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this {deleteType}. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default OrganizationDashboard;
