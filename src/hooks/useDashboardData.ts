import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useDashboardData() {
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
          change: "+2 this week",
          color: "text-blue-600",
        },
        {
          label: "Total Applications",
          value: data.total_applications || 0,
          change: "+38 new",
          color: "text-green-600",
        },
        {
          label: "Interviews Scheduled",
          value: data.total_interviews || 0,
          change: "5 today",
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

  return {
    activeJobs,
    recentCandidates,
    upcomingInterviews,
    stats,
    refetchDashboard: fetchDashboard,
  };
}
