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
import { AuthProvider } from "@/context/authContext";
import ProtectedRoute from "@/routes/protectedRoutes";
import GuestRoute from "@/routes/guestRoutes";

const queryClient = new QueryClient();

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

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
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
              path="/jobs/:id"
              element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/internships"
              element={
                <ProtectedRoute>
                  <Internships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteering"
              element={
                <ProtectedRoute>
                  <Volunteering />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
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
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats/:id"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
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

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
