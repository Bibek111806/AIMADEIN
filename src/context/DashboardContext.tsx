import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  activeJobs: any[];
  recentCandidates: any[];
  upcomingInterviews: any[];
  stats: any[];
  refetchDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardData | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();

  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/");
      const data = res.data;


      setActiveJobs(data.active_jobs || []);
      setRecentCandidates(data.recent_candidates || []);
      setUpcomingInterviews(data.upcoming_interviews || []);

      setStats([
        {
          label: "Active Job Postings",
          value: data.active_jobs_count || 0,
          color: "text-blue-600",
        },
        {
          label: "Total Applications",
          value: data.total_applications || 0,
      
          color: "text-green-600",
        },
        {
          label: "Interviews Scheduled",
          value: data.total_interviews || 0,
        
          color: "text-purple-600",
        },
      ]);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <DashboardContext.Provider
      value={{
        activeJobs,
        recentCandidates,
        upcomingInterviews,
        stats,
        refetchDashboard: fetchDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside a DashboardProvider");
  }
  return context;
};
