import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const OrganizationProfile = () => {
  const { user, accessToken, login } = useAuth();

  const [formData, setFormData] = useState({
    founding_year: user?.organization_profile?.founding_year || "",
    industry_type: user?.organization_profile?.industry_type || "",
    contact_person: user?.organization_profile?.contact_person || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await api.patch(
        "accounts/organization/profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      toast({
        title: "Profile Updated",
        description: "Organization details updated successfully.",
      });
      login(accessToken!, localStorage.getItem("refresh_token")!); // Refresh user data
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error?.response?.data?.detail || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Profile</CardTitle>
        <CardDescription>Update your organization's key details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Founding Year</label>
          <Input
            name="founding_year"
            placeholder="e.g., 2010"
            value={formData.founding_year}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Industry Type</label>
          <Input
            name="industry_type"
            placeholder="e.g., Information Technology"
            value={formData.industry_type}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact Person</label>
          <Input
            name="contact_person"
            placeholder="e.g., John Doe"
            value={formData.contact_person}
            onChange={handleChange}
          />
        </div>

        <Button className="w-full mt-4" onClick={handleUpdate}>
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrganizationProfile;
