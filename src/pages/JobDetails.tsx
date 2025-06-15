import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Send,
  Heart,
  Share2
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  
  const job = {
    id: 1,
    title: 'Senior AI Research Engineer',
    company: 'TechCorp AI',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$150k-200k',
    posted: '2 days ago',
    description: 'Join our cutting-edge AI research team to build the future of machine learning. We are looking for passionate engineers who want to push the boundaries of what\'s possible with artificial intelligence.',
    requirements: [
      '5+ years of experience in machine learning',
      'PhD in Computer Science, AI, or related field preferred',
      'Strong proficiency in Python, TensorFlow, and PyTorch',
      'Experience with large-scale distributed systems',
      'Published research in top-tier AI conferences'
    ],
    responsibilities: [
      'Design and implement novel AI algorithms',
      'Lead research initiatives in deep learning',
      'Collaborate with cross-functional teams',
      'Mentor junior researchers and engineers',
      'Publish findings in academic venues'
    ],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health insurance',
      'Flexible work arrangements',
      '20 days PTO + holidays',
      'Professional development budget'
    ],
    companyInfo: {
      size: '500-1000 employees',
      founded: '2018',
      industry: 'Artificial Intelligence'
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate('/jobs')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-3">{job.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {job.company}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salary}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {job.posted}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{job.type}</Badge>
                  <Badge variant="secondary">{job.companyInfo.industry}</Badge>
                </div>
              </div>
              <div className="flex">
           
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button size="lg" className="flex-1 sm:flex-none">
                <Send className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
              <Button variant="outline" size="lg">
                Save Job
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {resp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Company Size:</span>
                  <p className="text-gray-600">{job.companyInfo.size}</p>
                </div>
                <div>
                  <span className="font-medium">Founded:</span>
                  <p className="text-gray-600">{job.companyInfo.founded}</p>
                </div>
                <div>
                  <span className="font-medium">Industry:</span>
                  <p className="text-gray-600">{job.companyInfo.industry}</p>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;
