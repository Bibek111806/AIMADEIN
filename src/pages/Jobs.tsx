import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import JobCard from "@/components/jobCard";
import api from "@/lib/api";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "any",
    experience: "any",
    type: "any",
  });

  useEffect(() => {
    api.get("/jobs/").then((res) => setJobs(res.data));
  }, []);

  const onStatusChange = (id, updated) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updated } : job))
    );
  };

  const getFilteredJobs = () => {
    return jobs.filter((job) => {
      if (activeTab !== "all") {
        if (activeTab === "applied" && !job.applied) return false;
        if (activeTab === "saved" && !job.saved) return false;
        if (activeTab === "interview" && !job.interview) return false;
      }

      if (filters.location !== "any" && job.location !== filters.location)
        return false;
      if (
        filters.experience !== "any" &&
        Number(job.experience_required || 0) < Number(filters.experience)
      )
        return false;
      if (filters.type !== "any" && job.job_type !== filters.type) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const titleMatch = job.title?.toLowerCase().includes(term);
        const companyMatch = job.organization_details?.company_name
          ?.toLowerCase()
          .includes(term);
        const skillMatch = job.skills_required?.some((skill) =>
          skill.toLowerCase().includes(term)
        );
        if (!titleMatch && !companyMatch && !skillMatch) return false;
      }

      return true;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-1">
              Discover AI and tech opportunities
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs, companies, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {/* Location */}
                <Input
                  placeholder="Location"
                  className="w-40"
                  value={filters.location === "any" ? "" : filters.location}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      location: e.target.value || "any",
                    })
                  }
                />

                {/* Experience */}
                <Select
                  value={filters.experience}
                  onValueChange={(value) =>
                    setFilters({ ...filters, experience: value })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+ yrs</SelectItem>
                    <SelectItem value="2">2+ yrs</SelectItem>
                    <SelectItem value="3">3+ yrs</SelectItem>
                  </SelectContent>
                </Select>

                {/* Type */}
                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters({ ...filters, type: value })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="Part_time">Part-time</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="interview">Interviews</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {getFilteredJobs().length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                No jobs found.
              </div>
            ) : (
              getFilteredJobs().map((job) => (
                <JobCard key={job.id} job={job} onUpdate={onStatusChange} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
