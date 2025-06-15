import JobCard from "@/components/jobCard";
import { useState } from "react";
import { Link } from "react-router-dom";

function Index() {
  const jobs = [
    {
      id: 1,
      title: "Senior AI Research Engineer",
      company: "TechCorp AI",
      location: "Edmonton, AB",
      type: "Full-time",
      salary: "$150k-200k",
      posted: "2 days ago",
      description: "Join our cutting-edge AI research team...",
      skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning"],
      status: "not-applied",
    },
    {
      id: 2,
      title: "Machine Learning Engineer",
      company: "DataFlow Solutions",
      location: "Winnipeg, MB",
      type: "Full-time",
      salary: "$120k-160k",
      posted: "1 week ago",
      description: "Build and deploy ML models at scale...",
      skills: ["Python", "Scikit-learn", "AWS", "Docker"],
      status: "saved",
    },
    {
      id: 3,
      title: "AI Product Manager",
      company: "StartupAI",
      location: "Toronto, ON",
      type: "Full-time",
      salary: "$130k-170k",
      posted: "3 days ago",
      description: "Lead AI product development initiatives...",
      skills: ["Product Management", "AI Strategy", "Agile"],
      status: "applied",
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
      <section className="bg-gray-100 py-10 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Find Your Next Job</h1>
          <p className="text-lg mb-6">
            Discover AI jobs, internships, and projects that match your skills
          </p>
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <input
              type="text"
              placeholder="Job title or keyword"
              className="w-full md:w-1/3 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              className="w-full md:w-1/4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="w-full md:w-1/5 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Latest Jobs Listing</h3>
            <a
              href="/jobs?type=latest"
              className="text-gray-600 hover:text-black"
            >
              View All
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
            {jobs.map((job, index) => (
              // <JobCard key={index} {...job} />
              <JobCard key={index} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Post a Job CTA */}
      <section className="bg-gray-100 py-10 text-center">
        <h4 className="text-xl font-semibold mb-3">Are You Hiring?</h4>
        <a
          href="/post-job"
          className="inline-block border border-black px-5 py-2 rounded-md text-black hover:bg-black hover:text-white transition"
        >
          Post a Job
        </a>
      </section>

      {/* Community */}
      <section className="bg-white-100 py-10 text-center">
        <h4 className="text-xl font-semibold mb-3">Join Our Community</h4>
        <p className="mb-4 text-gray-700">
          Connect with others in the AI field, share insights, and collaborate
          on projects.
        </p>
        <a
          href="/community"
          className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition"
        >
          Explore Community
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-10">
        <div className="text-center text-gray-400 text-xs mt-6">
          © 2024 AI MADE IN. ALL RIGHT RESERVED.
        </div>
      </footer>
    </div>
  );
}

export default Index;
