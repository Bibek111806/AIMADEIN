import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/authContext";
import { Camera, X } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

function BasicInfo() {
  const { user, accessToken, login } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    title: "",
    company: "",
    address: "",
    email: "",
    phone: "",
    bio: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.first_name || "",
        middleName: user.middle_name || "",
        lastName: user.last_name || "",
        title: user.professional_title || "",
        company: user.company_name || "",
        address: user.address || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
      setPreviewImage(user.profile_picture || null);
    }
  }, [user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = async () => {
    try {
      await api.delete("accounts/profile-picture/delete/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setPreviewImage(null);
      setSelectedImage(null);
      toast({
        title: "Profile Updated",
        description: "Your profile picture was successfully removed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          "Something went wrong while removing your profile picture.",
      });
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("first_name", profileData.firstName);
    formData.append("middle_name", profileData.middleName);
    formData.append("last_name", profileData.lastName);
    formData.append("professional_title", profileData.title);
    formData.append("company_name", profileData.company);
    formData.append("address", profileData.address);
    formData.append("phone", profileData.phone);
    formData.append("email", profileData.email);
    formData.append("bio", profileData.bio);
    if (selectedImage) {
      formData.append("profile_picture", selectedImage);
    }

    try {
      await api.put("accounts/profile/", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const refresh = localStorage.getItem("refresh_token");
      if (accessToken && refresh) {
        login(accessToken, refresh);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile was successfully updated.",
      });
      setFormErrors({});
    } catch (err: any) {
      if (err.response?.data) {
        setFormErrors(err.response.data);
      }
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Something went wrong while updating your profile.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <img
            src={
              previewImage
                ? previewImage
                : user?.role === "organization"
                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.company_name || "Company"
                  )}&background=ddd&color=555`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${user?.first_name?.[0] || ""}${
                      user?.last_name?.[0] || ""
                    }`
                  )}&background=ddd&color=555`
            }
            alt="Profile"
            className="h-32 w-32 mx-auto rounded-full object-cover mb-4"
          />
          <input
            type="file"
            accept="image/*"
            id="profileImageUpload"
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              document.getElementById("profileImageUpload")?.click()
            }
          >
            <Camera className="h-4 w-4 mr-1" />
            Change Photo
          </Button>

          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4 mr-1" />
            Remove Photo
          </Button>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.role === "organization" ? (
            <div>
              <label className="block text-sm font-medium mb-1">
                Company Name
              </label>
              <Input
                value={profileData.company}
                onChange={(e) =>
                  setProfileData({ ...profileData, company: e.target.value })
                }
              />
              {formErrors.company_name && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.company_name[0]}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <Input
                  value={profileData.firstName}
                  onChange={(e) => {
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    });
                    setFormErrors((prev) => ({
                      ...prev,
                      first_name: undefined,
                    }));
                  }}
                />
                {formErrors.first_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.first_name[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Middle Name
                </label>
                <Input
                  value={profileData.middleName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      middleName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <Input
                  value={profileData.lastName}
                  onChange={(e) => {
                    setProfileData({
                      ...profileData,
                      lastName: e.target.value,
                    });
                    setFormErrors((prev) => ({
                      ...prev,
                      last_name: undefined,
                    }));
                  }}
                />
                {formErrors.last_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.last_name[0]}
                  </p>
                )}
              </div>
            </div>
          )}
          {user?.role === "individual" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Professional Title
              </label>
              <Input
                value={profileData.title}
                onChange={(e) =>
                  setProfileData({ ...profileData, title: e.target.value })
                }
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input
              value={profileData.address}
              onChange={(e) =>
                setProfileData({ ...profileData, address: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => {
                  setProfileData({ ...profileData, email: e.target.value });
                  setFormErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.email[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={profileData.phone}
                onChange={(e) => {
                  setProfileData({ ...profileData, phone: e.target.value });
                  setFormErrors((prev) => ({ ...prev, phone: undefined }));
                }}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.phone[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Textarea
              value={profileData.bio}
              onChange={(e) =>
                setProfileData({ ...profileData, bio: e.target.value })
              }
              rows={4}
            />
          </div>

          <Button className="w-full mt-2" onClick={handleSave}>
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default BasicInfo;
