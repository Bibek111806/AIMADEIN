import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BasicInfo from "@/components/tabs/basicInfo";
import Experience from "@/components/tabs/experience";
import Skills from "@/components/tabs/skills";
import Education from "@/components/tabs/education";
import Documents from "@/components/tabs/documents";
// import OrganizationDetails from "@/components/tabs/organizationDetails";
import { useAuth } from "@/context/authContext";
import Services from "@/components/tabs/services";
import OrganizationProfile from "@/components/tabs/organizationProfile";
const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");

  const isOrganization = user?.role === "organization";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your profile information</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${isOrganization ? "grid-cols-2" : "grid-cols-4"}`}>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            {isOrganization ? (
              <TabsTrigger value="org">Organization Details</TabsTrigger>
            ) : (
              <>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="skills">Skills & Education</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <BasicInfo />
          </TabsContent>

          {isOrganization ? (
            <TabsContent value="org" className="mt-6">
              <div className="space-y-3">

              <Services/>
              <OrganizationProfile/>
              </div>
            </TabsContent>
          ) : (
            <>
              <TabsContent value="experience" className="mt-6">
                <Experience />
              </TabsContent>
              <TabsContent value="skills" className="mt-6">
                <Skills />
                <Education />
              </TabsContent>
              <TabsContent value="documents" className="mt-6">
                <Documents />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
