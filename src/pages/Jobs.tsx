
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/jobCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 

} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Jobs = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    experience: '',
    salary: '',
    type: ''
  });

  const mockJobs = [
    {
      id: 1,
      title: 'Senior AI Research Engineer',
      company: 'TechCorp AI',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$150k-200k',
      posted: '2 days ago',
      description: 'Join our cutting-edge AI research team...',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning'],
      status: 'not-applied'
    },
    {
      id: 2,
      title: 'Machine Learning Engineer',
      company: 'DataFlow Solutions',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120k-160k',
      posted: '1 week ago',
      description: 'Build and deploy ML models at scale...',
      skills: ['Python', 'Scikit-learn', 'AWS', 'Docker'],
      status: 'saved'
    },
    {
      id: 3,
      title: 'AI Product Manager',
      company: 'StartupAI',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$130k-170k',
      posted: '3 days ago',
      description: 'Lead AI product development initiatives...',
      skills: ['Product Management', 'AI Strategy', 'Agile'],
      status: 'applied'
    }
  ];

  const getJobsByStatus = (status: string) => {
    if (status === 'all') return mockJobs;
    return mockJobs.filter(job => job.status === status);
  };





  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-1">Discover AI and tech opportunities</p>
          </div>
          <Button>Post a Job</Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs, companies, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedFilters.location} onValueChange={(value) => setSelectedFilters({...selectedFilters, location: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="sf">San Francisco</SelectItem>
                    <SelectItem value="ny">New York</SelectItem>
                    <SelectItem value="seattle">Seattle</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedFilters.experience} onValueChange={(value) => setSelectedFilters({...selectedFilters, experience: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead/Principal</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-1" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="interview">Interviews</TabsTrigger>
            <TabsTrigger value="viewed">Viewed</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {getJobsByStatus('all').map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="space-y-4">
              {getJobsByStatus('saved').map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applied" className="mt-6">
            <div className="space-y-4">
              {getJobsByStatus('applied').map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interview" className="mt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No interviews scheduled yet</p>
            </div>
          </TabsContent>

          <TabsContent value="viewed" className="mt-6">
            <div className="space-y-4">
              {mockJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hidden" className="mt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No hidden jobs</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
