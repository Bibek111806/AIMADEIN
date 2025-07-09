import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import Internships from "@/pages/Internships";
import Volunteering from "@/pages/Volunteering";
import Projects from "@/pages/Projects";
import Community from "@/pages/Community";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Calendar from "@/pages/Calendar";
import NotFound from "@/pages/NotFound";
import JobDetails from "@/pages/JobDetails";
import Chat from "@/pages/chat";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VerifyEmail from "@/pages/verifyEmail";
import VerifyPhone from "@/pages/verifyPhone";
import Reminders from "@/pages/remainders";

import OrganizationJobs from "@/pages/organizationJobs";
import Candidates from "@/pages/candidates";
import Interview from "@/pages/interview";
import OrganizationDashboard from "@/pages/organizationDashboard";

import { AuthProvider, useAuth } from "@/context/authContext";
import ProtectedRoute from "@/routes/protectedRoutes";
import GuestRoute from "@/routes/guestRoutes";
import RoleRoute from "@/routes/roleRoutes";
import { JobManagerProvider } from "@/context/JobManagerContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { InterviewProvider } from "@/context/InterviewContext";
import GroupChat from "./pages/groupChat";
import UserProfile from "./pages/userProfile";

const queryClient = new QueryClient();

const JobsWrapper = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "organization") {
    return (
      <DashboardProvider>
        <JobManagerProvider>
          <OrganizationJobs />
        </JobManagerProvider>
      </DashboardProvider>
    );
  }

  return <Jobs />;
};

const DashboardWrapper = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "organization") {
    return (
      <DashboardProvider>
        <JobManagerProvider>
          <InterviewProvider>
            <OrganizationDashboard />
          </InterviewProvider>
        </JobManagerProvider>
      </DashboardProvider>
    );
  }

  return <Dashboard />;
};

const InterviewWrapper = () => {
  return (
    <DashboardProvider>
      <InterviewProvider>
        <Interview />
      </InterviewProvider>
    </DashboardProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Guest routes */}
            <Route
              path="/"
              element={
                <GuestRoute>
                  <Index />
                </GuestRoute>
              }
            />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route
              path="/verify/email"
              element={
                <GuestRoute>
                  <VerifyEmail />
                </GuestRoute>
              }
            />
            <Route
              path="/verify/phone"
              element={
                <GuestRoute>
                  <VerifyPhone />
                </GuestRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <JobsWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reminders"
              element={
                <ProtectedRoute>
                  <Reminders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:id"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <RoleRoute allowedRoles={["organization"]}>
                  <Candidates />
                </RoleRoute>
              }
            />
            <Route
              path="/interviews"
              element={
                <RoleRoute allowedRoles={["organization"]}>
                  <InterviewWrapper />
                </RoleRoute>
              }
            />
            <Route
              path="/internships"
              element={
                <RoleRoute allowedRoles={["individual"]}>
                  <Internships />
                </RoleRoute>
              }
            />
            <Route
              path="/volunteering"
              element={
                <RoleRoute allowedRoles={["individual"]}>
                  <Volunteering />
                </RoleRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <RoleRoute allowedRoles={["individual"]}>
                  <Projects />
                </RoleRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <RoleRoute allowedRoles={["individual"]}>
                  <Calendar />
                </RoleRoute>
              }
            />
            <Route
              path="/chats/private/:id"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats/group/:id"
              element={
                <ProtectedRoute>
                  <GroupChat />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
