
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Building2, 
  Search, 
  Calendar, 
  User, 
  Settings,
  Menu,
  X,
  Bell,
  Briefcase,
  GraduationCap,
  Heart,
  FolderOpen,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
interface DashboardLayoutProps {
  children: React.ReactNode;
  userType?: string;
  userName?: string;
}

const DashboardLayout = ({ children, userType = 'individual', userName = 'Funny Bunny' }: DashboardLayoutProps) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  const jobsPages = [
    { id: 'jobs', label: 'Jobs', icon: Briefcase, path: '/jobs' },
    { id: 'internships', label: 'Internships', icon: GraduationCap, path: '/internships' },
    { id: 'volunteering', label: 'Volunteering', icon: Heart, path: '/volunteering' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, path: '/projects' }
  ];

  const mainPages = [
    { id: 'dashboard', label: 'Dashboard', icon: User, path: '/dashboard' },
    { id: 'community', label: 'Community', icon: Users, path: '/community' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
    { id: 'reminders', label: 'Reminders', icon: Bell, path: '/reminders' }
  ];

  const currentPage = location.pathname;
  const isJobsSection = jobsPages.some(page => currentPage === page.path);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">AIMADEIN</h1>
  
            </div>

            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search jobs, people, organizations..."
                  className="pl-10 pr-4"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Bell className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex items-center space-x-1">
                  <span className="text-sm font-medium">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t bg-white">
          <div className="px-4 sm:px-6 lg:px-8">
            <nav className="hidden lg:flex space-x-8 h-12 items-center">
              {mainPages.map((page) => {
                const IconComponent = page.icon;
                const active = currentPage === page.path;
                return (
                  <Link
                    key={page.id}
                    to={page.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      active 
                        ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-700' 
                        : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {page.label}
                  </Link>
                );
              })}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md h-auto ${
                      isJobsSection 
                        ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-700' 
                        : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                    }`}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Jobs
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {jobsPages.map((page) => {
                    const IconComponent = page.icon;
                    return (
                      <DropdownMenuItem key={page.id} asChild>
                        <Link to={page.path} className="flex items-center w-full cursor-pointer">
                          <IconComponent className="mr-2 h-4 w-4" />
                          {page.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex items-center space-x-4 ml-auto">
                <Link
                  to="/profile"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === '/profile'
                      ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-700'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === '/settings'
                      ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-700'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
                <Link
                  to="/help"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50 rounded-md"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help
                </Link>
              </div>
            </nav>

            <div className="lg:hidden py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search jobs, people, organizations..."
                  className="pl-10 pr-4"
                />
              </div>
            </div>
          </div>
        </div>

        {showMobileMenu && (
          <div className="lg:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-2">
              {mainPages.map((page) => {
                const IconComponent = page.icon;
                const active = currentPage === page.path;
                return (
                  <Link
                    key={page.id}
                    to={page.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      active 
                        ? 'text-blue-700 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="mr-3 h-4 w-4" />
                    {page.label}
                  </Link>
                );
              })}

              <div className="border-t pt-2 mt-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Jobs & Opportunities
                </div>
                {jobsPages.map((page) => {
                  const IconComponent = page.icon;
                  const active = currentPage === page.path;
                  return (
                    <Link
                      key={page.id}
                      to={page.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        active 
                          ? 'text-blue-700 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="mr-3 h-4 w-4" />
                      {page.label}
                    </Link>
                  );
                })}
              </div>
              
              <div className="border-t pt-2 mt-2 space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === '/profile'
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === '/settings'
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Link>
                <Link
                  to="/help"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50 rounded-md"
                >
                  <HelpCircle className="mr-3 h-4 w-4" />
                  Help
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;