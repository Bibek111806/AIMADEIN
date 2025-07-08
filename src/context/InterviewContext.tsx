import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import InterviewModal from "@/components/interviewForm";
import InterviewDeleteModal from "@/components/interviewDeleteModal";
import { useDashboard } from "./DashboardContext";

export interface Interview {
  id: number;
  candidateName: string;
  candidateEmail: string;
  position: string;
  date: string;
  time: string;
  duration: string;
  mode: string;
  status: string;
  notes?: string;
  meetingLink?: string;
}

export type InterviewFormValues = Partial<Interview>;

interface InterviewContextType {
  interviews: Interview[];
  fetchInterviews: () => Promise<void>;
  createInterview: (data: InterviewFormValues) => Promise<void>;
  updateInterview: (id: number, data: InterviewFormValues) => Promise<void>;
  deleteInterview: (id: number) => Promise<void>;

  // New UI state:
  isModalOpen: boolean;
  openModal: (interview?: Interview) => void;
  closeModal: () => void;
  editingInterview: Interview | null;

  interviewToDelete: Interview | null;
  setInterviewToDelete: (i: Interview | null) => void;
  handleDeleteInterview: () => void;

  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;

  updateInterviewStatus: (id: number, status: string) => Promise<void>;

  InterviewModal: ReactNode;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
 const { refetchDashboard } = useDashboard();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  const [interviewToDelete, setInterviewToDelete] = useState<Interview | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchInterviews = async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterStatus !== "all") params.status = filterStatus;
      const queryString = new URLSearchParams(params).toString();

      const res = await api.get(`/interviews/${queryString ? `?${queryString}` : ""}`);
      const data: Interview[] = res.data.map((item: any) => ({
        id: item.id,
        candidateName: item.name,
        candidateEmail: item.email,
        position: item.position,
        date: item.date,
        time: item.time,
        duration: item.duration_minutes?.toString() || "",
        mode: item.interview_mode,
        status: item.status,
        notes: item.notes,
        meetingLink: item.meeting_link,
      }));
      setInterviews(data);
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load interviews.",
        variant: "destructive",
      });
    }
  };

  const createInterview = async (data: InterviewFormValues) => {
    await api.patch("/interviews/add/", {
      name: data.candidateName,
      email: data.candidateEmail,
      position: data.position,
      date: data.date,
      time: data.time,
      duration_minutes: parseInt(data.duration || "60"),
      interview_mode: data.mode,
      meeting_link: data.meetingLink,
      notes: data.notes,
    });
    toast({ title: "Interview scheduled successfully." });
    await fetchInterviews();
    await refetchDashboard();
    closeModal();
  };

  const updateInterview = async (id: number, data: InterviewFormValues) => {
    await api.patch(`/interviews/${id}/`, {
      name: data.candidateName,
      email: data.candidateEmail,
      position: data.position,
      date: data.date,
      time: data.time,
      duration_minutes: parseInt(data.duration || "60"),
      interview_mode: data.mode,
      meeting_link: data.meetingLink,
      notes: data.notes,
    });
    toast({ title: "Interview updated successfully." });
    await fetchInterviews();
    await refetchDashboard();
    closeModal();
  };

  const deleteInterview = async (id: number) => {
    await api.delete(`/interviews/${id}/`);
    toast({ title: "Interview deleted successfully." });
    await fetchInterviews();
    await refetchDashboard();
  };

  const updateInterviewStatus = async (id: number, newStatus: string) => {
    try {
      let endpoint = `/interviews/${id}/`;
      let payload: any = {};

      if (newStatus.toLowerCase() === "completed") {
        endpoint = `/interviews/${id}/complete/`;
      } else if (newStatus.toLowerCase() === "accepted") {
        endpoint = `/interviews/${id}/accept/`;
      } else if (newStatus.toLowerCase() === "rejected") {
        endpoint = `/interviews/${id}/reject/`;
      } else {
        payload.status = newStatus;
      }

      if (["completed", "accepted", "rejected"].includes(newStatus.toLowerCase())) {
        await api.patch(endpoint);
      } else {
        await api.patch(endpoint, payload);
      }

      toast({
        title: "Success",
        description: `Interview marked as ${newStatus}.`,
      });
      await fetchInterviews();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update interview status.",
        variant: "destructive",
      });
    }
  };

  const openModal = (interview?: Interview) => {
    setEditingInterview(interview || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingInterview(null);
    setIsModalOpen(false);
  };

  const handleDeleteInterview = async () => {
    if (interviewToDelete) {
      await deleteInterview(interviewToDelete.id);
      setInterviewToDelete(null);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [searchTerm, filterStatus]);

  return (
    <InterviewContext.Provider
      value={{
        interviews,
        fetchInterviews,
        createInterview,
        updateInterview,
        deleteInterview,
        isModalOpen,
        openModal,
        closeModal,
        editingInterview,
        interviewToDelete,
        setInterviewToDelete,
        handleDeleteInterview,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        updateInterviewStatus,
        InterviewModal: (
          <>
          <InterviewModal
            open={isModalOpen}
            onClose={closeModal}
            initialData={editingInterview || undefined}
            />
             <InterviewDeleteModal
            open={!!interviewToDelete}
            onClose={() => setInterviewToDelete(null)}
            onConfirm={handleDeleteInterview}
          />
            </>
        ),
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
};
