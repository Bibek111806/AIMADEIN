import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OrganizationJobCard from "@/components/organizationJobCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useJobManager } from "@/context/JobManagerContext";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export default function OrganizationJobs() {
  const {
    jobs: rawJobs,
    openCreateModal,
    openEditModal,
    openDeleteModal,
  } = useJobManager();

  // Ensure jobs is always an array
  const jobs = Array.isArray(rawJobs) ? rawJobs : [];

  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(1);
  };

  const filtered = jobs.filter((j) =>
    tab === "all"
      ? true
      : tab === "expired"
      ? j.status === "expired"
      : j.category === tab
  );

  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">Manage your job posts</p>
        </div>
        <Button onClick={openCreateModal}>Post a Job</Button>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-6">
          {["all", "job", "internship", "volunteering", "project", "expired"].map(
            (c) => (
              <TabsTrigger key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </TabsTrigger>
            )
          )}
        </TabsList>
      </Tabs>

      <div className="mt-4 space-y-4">
        {paginated.length > 0 ? (
          paginated.map((job) => (
            <OrganizationJobCard
              key={job.id}
              job={job}
              onEdit={() => openEditModal(job)}
              onDelete={() => openDeleteModal(job.id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No jobs found.</p>
        )}
      </div>

      <PaginationComponent
        page={page}
        total={totalPages}
        setPage={setPage}
      />
    </DashboardLayout>
  );
}
