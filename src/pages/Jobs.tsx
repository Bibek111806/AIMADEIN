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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import JobCard from "@/components/jobCard";
import api from "@/lib/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export default function Jobs() {
  const [activeTab, setActiveTab] = useState("all");

  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "any",
    experience: "any",
    type: "any",
  });
  const [loading, setLoading] = useState(false);

  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [interviewJobs, setInterviewJobs] = useState([]);

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllJobs();
    } else if (activeTab === "saved") {
      fetchSavedJobs();
    } else if (activeTab === "applied") {
      fetchAppliedJobs();
    } else if (activeTab === "interview") {
      fetchInterviewJobs();
    }
  }, [activeTab, page]);

  const fetchAllJobs = async () => {
    try {
      setLoading(true);
      const params = { page };

      if (filters.location && filters.location !== "any") {
        params.location = filters.location;
      }
      if (filters.experience && filters.experience !== "any") {
        params.experience = filters.experience;
      }
      if (filters.type && filters.type !== "any") {
        params.type = filters.type;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const res = await api.get("/jobs/?category=job", { params });
      setJobs(res.data.results || []);
      setTotalPages(Math.ceil(res.data.count / 10));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/my-jobs/saved/?category=job");
      setSavedJobs(
        res.data.map((item) => ({
          ...item.job,
          saved_id: item.id,
          saved_created_at: item.created_at,
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/my-jobs/applied/?category=job");
      setAppliedJobs(
        res.data.map((item) => ({
          ...item.job,
          applied_id: item.id,
          applied:true,
          applied_created_at: item.created_at,
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/my-jobs/interview/?category=job");
setInterviewJobs(
  res.data.map((item) => ({
    ...item.job,
    interview_id: item.id,
    interview_created_at: item.created_at,
    applied: true,             // ← Add this!
    interviewed: true          // ← Optional for clarity
  }))
);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchAllJobs();
  };

  const onStatusChange = (id, updated) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updated } : job))
    );
    setSavedJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updated } : job))
    );
    setAppliedJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updated } : job))
    );
    setInterviewJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updated } : job))
    );
  };

  const renderJobs = (jobList) => {
    if (loading) {
      return <div className="text-center text-gray-500">Loading jobs...</div>;
    }

    if (jobList.length === 0) {
      return (
        <div className="text-gray-500 text-center py-4">No jobs found.</div>
      );
    }

    return jobList.map((job) => (
      <JobCard key={job.id} job={job} onUpdate={onStatusChange} />
    ));
  };
const PaginationComponent = ({ page, total, setPage }) => {
  if (total <= 1) return null;
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(Math.max(page - 1, 1));
            }}
          />
        </PaginationItem>
        {[...Array(total)].map((_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={page === i + 1}
              onClick={(e) => {
                e.preventDefault();
                setPage(i + 1);
              }}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(Math.min(page + 1, total));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
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

        {/* Filters */}
        {activeTab === "all" && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs, companies, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
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
                      <SelectItem value="part_time">Part-time</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="interview">Interviews</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-4">
            {renderJobs(jobs)}
            <PaginationComponent
              page={page}
              total={totalPages}
              setPage={setPage}
            />
          </TabsContent>

          <TabsContent value="saved" className="mt-6 space-y-4">
            {renderJobs(savedJobs)}
          </TabsContent>

          <TabsContent value="applied" className="mt-6 space-y-4">
            {renderJobs(appliedJobs)}
          </TabsContent>

          <TabsContent value="interview" className="mt-6 space-y-4">
            {renderJobs(interviewJobs)}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
