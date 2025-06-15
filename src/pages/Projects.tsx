
import { useState } from 'react';
import { Card, CardContent} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 

} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProjectCard from '@/components/projectCard';

const Projects = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const mockProjects = [
    {
      id: 1,
      title: 'Open Source Computer Vision Library',
      organization: 'OpenCV Community',
      type: 'Open Source',
      contributors: 45,
      duration: 'Ongoing',
      posted: '1 week ago',
      description: 'Contribute to developing advanced computer vision algorithms for the community...',
      skills: ['Python', 'OpenCV', 'Computer Vision', 'C++'],
      status: 'not-applied',
      difficulty: 'Intermediate'
    },
    {
      id: 2,
      title: 'AI Ethics Research Project',
      organization: 'Stanford AI Lab',
      type: 'Research',
      contributors: 12,
      duration: '6 months',
      posted: '3 days ago',
      description: 'Research project on ethical implications of AI decision-making systems...',
      skills: ['Research', 'AI Ethics', 'Data Analysis'],
      status: 'saved',
      difficulty: 'Advanced'
    },
    {
      id: 3,
      title: 'ML Model Optimization Challenge',
      organization: 'Kaggle',
      type: 'Competition',
      contributors: 234,
      duration: '2 months',
      posted: '5 days ago',
      description: 'Optimize machine learning models for edge computing devices...',
      skills: ['Machine Learning', 'Optimization', 'Edge Computing'],
      status: 'applied',
      difficulty: 'Expert'
    }
  ];



  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Collaborate on AI and tech projects</p>
          </div>
          <Button>Post Project</Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search projects..." className="pl-10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="viewed">Viewed</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {mockProjects.map((project) => (
                <ProjectCard key={project.id} project={project}/>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
