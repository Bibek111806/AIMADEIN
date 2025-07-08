import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import JobFormModal from "@/components/JobFormModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { useAuth } from "@/context/authContext";
import { useDashboard } from "./DashboardContext";

export interface Job {
  id?: number;
  title: string;
  location: string;
  salary_min: string;
  salary_max: string;
  experience_required: string;
  job_type: string;
  category: string;
  deadline: string;
  description: string;
  skills_required: string[];
  work_tags: string[];
  requirements: string[];
  responsibilities: string[];
  perks: string[];
}

interface JobManagerContextType {
  jobs: Job[];
  reloadJobs: () => void;
  openCreateModal: () => void;
  openEditModal: (job: Job) => void;
  openDeleteModal: (id: number) => void;
}

const JobManagerContext = createContext<JobManagerContextType | null>(null);

export function useJobManager() {
  const ctx = useContext(JobManagerContext);
  if (!ctx) throw new Error("useJobManager must be inside provider");
  return ctx;
}

export function JobManagerProvider({ children }: { children: React.ReactNode }) {
  const { refetchDashboard } = useDashboard();
  const { accessToken } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadJobs = async () => {
    try {
      const res = await api.get("jobs/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setJobs(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch {
      toast({
        title: "Error",
        description: "Could not fetch jobs",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const saveJob = async (data: Job, id?: number) => {
    const method = id ? "put" : "post";
    const url = id ? `jobs/${id}/` : "jobs/";

    try {
      await api[method](url, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      toast({
        title: id ? "Updated" : "Posted",
        description: "Job saved successfully.",
      });
      setModalOpen(false);
      await loadJobs();
      await refetchDashboard();
    } catch (err: any) {
      // If validation error, throw to be handled in the modal
      if (err?.response?.status === 400 && err?.response?.data) {
        console.log(err)
        throw err.response.data;
      }
      console.log(err)
      // Generic error
      toast({
        title: "Error",
        description: err?.response?.data?.detail || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const deleteJob = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`jobs/${deleteId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({ title: "Deleted", description: "Job removed." });
      setDeleteId(null);
      await loadJobs();
      await refetchDashboard();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete job.",
        variant: "destructive",
      });
    }
  };

  const openCreateModal = () => {
    setEditJob(null);
    setModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditJob(job);
    setModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
  };

  return (
    <JobManagerContext.Provider
      value={{
        jobs,
        reloadJobs: loadJobs,
        openCreateModal,
        openEditModal,
        openDeleteModal,
      }}
    >
      {children}

      <JobFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveJob}
        initialData={editJob}
      />

      <ConfirmDeleteModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteJob}
      />
    </JobManagerContext.Provider>
  );
}
