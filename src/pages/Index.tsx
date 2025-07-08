import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
} from "lucide-react";
 import axios from "axios";
 import { useState,useEffect } from "react";
const Index = () => {
const [featuredJobs, setFeaturedJobs] = useState([]);
useEffect(() => {
  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/latest-jobs/");
      setFeaturedJobs(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  fetchJobs();
}, []);
  const stats = [
    { label: "Active Jobs", value: "2.5K+", icon: Building2 },
    { label: "Companies", value: "500+", icon: Users },
    { label: "Success Rate", value: "94%", icon: TrendingUp },
    { label: "Community Members", value: "10K+", icon: Award },
  ];

  const benefits = [
    {
      title: "Curated Opportunities",
      description:
        "We connect you with the latest AI jobs, internships, and projects across top companies worldwide.",
    },
    {
      title: "Trusted Community",
      description:
        "Collaborate and network with professionals, researchers, and innovators passionate about AI.",
    },
    {
      title: "No Hidden Fees",
      description:
        "Whether you're hiring or applying, AI MADE IN provides transparent and free access to opportunities.",
    },
    {
      title: "Professional Growth",
      description:
        "Find resources, insights, and networking events designed to accelerate your AI career.",
    },
  ];

  return (
    <div className="font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            AI MADE IN
          </Link>
          <div className="space-x-4 hidden md:flex">
            <Link to="/jobs" className="text-gray-700 hover:text-black">
              Jobs
            </Link>
            <Link to="/internships" className="text-gray-700 hover:text-black">
              Internships
            </Link>
            <Link to="/projects" className="text-gray-700 hover:text-black">
              Projects
            </Link>
            <Link to="/community" className="text-gray-700 hover:text-black">
              Community
            </Link>
            <Link
              to="/login"
              className="border border-black text-black px-3 py-1 rounded-md text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-black text-white px-3 py-1 rounded-md text-sm"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gray-50 py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Welcome to AI MADE IN
          </h1>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Your gateway to AI opportunities, community connections, and collaborative projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/jobs"
              className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition text-lg font-medium"
            >
              Explore Jobs
            </Link>
            <Link
              to="/community"
              className="border-2 border-black text-black px-8 py-3 rounded-lg hover:bg-black hover:text-white transition text-lg font-medium"
            >
              Join Community
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-gray-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose AI MADE IN (CARDS) */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose AI MADE IN?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="mb-2 text-gray-900">
                    {item.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Opportunities
            </h2>
            <Link
              to="/jobs"
              className="text-gray-600 hover:text-black font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {featuredJobs.map((job) => (
  <Card
    key={job.id}
    className="hover:shadow-lg transition-shadow border-0 shadow-md"
  >
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <CardTitle className="text-xl mb-3">
            {job.title}
          </CardTitle>
          <div className="flex flex-wrap items-center text-gray-600 gap-4">
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              {job.organization_details?.company_name}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {job.location}
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              {job.salary_min} - {job.salary_max}
            </div>
          </div>
          <div className="flex items-center mt-3">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-500">
              {job.time_ago}
            </span>
            <Badge
              variant="outline"
              className="ml-4"
            >
              {job.job_type}
            </Badge>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4 leading-relaxed">
        {job.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {job.skills_required?.map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="text-xs"
          >
            {skill}
          </Badge>
        ))}
      </div>
      <Link
        to={`/jobs/${job.id}`}
        className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
      >
        View Details
      </Link>
    </CardContent>
  </Card>
))}
          </div>
        </div>
      </section>

      {/* Are You Hiring? */}
      <section className="bg-gray-50 py-16 text-center">
        <h3 className="text-3xl font-bold mb-4">Are You Hiring?</h3>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Connect with top AI talent and find the perfect candidates for your team.
        </p>
        <Link
          to="/organization-jobs"
          className="inline-block border-2 border-black px-6 py-3 rounded-lg text-black hover:bg-black hover:text-white transition font-medium"
        >
          Post a Job
        </Link>
      </section>

      {/* Join Our Community */}
      <section className=" py-16 text-center">
        <h3 className="text-3xl font-bold mb-4">Join Our Community</h3>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Connect with AI professionals, share insights, and collaborate on exciting projects.
        </p>
        <Link
          to="/community"
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
        >
          Explore Community
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <Link
              to="/"
              className="text-2xl font-bold mb-4 inline-block"
            >
              AI MADE IN
            </Link>
            <div className="text-gray-400 text-sm">
              © 2024 AI MADE IN. ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
