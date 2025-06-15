import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Upload,
  Award,
  BookOpen,
  Briefcase,
  Eye,
  EyeOff,
  Plus,
  Edit,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileVisibility, setProfileVisibility] = useState({
    public: false,
    connections: true,
    organizations: false,
  });

  const [profileData, setProfileData] = useState({
    firstName: "Funny",
    lastName: "Bunny",
    title: "Senior AI Engineer",
    company: "TechCorp AI",
    location: "San Francisco, CA",
    email: "funny.bunny@email.com",
    phone: "+1 (555) 123-4567",
    bio: "Passionate AI engineer with 5+ years of experience in machine learning and computer vision. Love building innovative solutions that make a real impact.",
    skills: [
      "Python",
      "TensorFlow",
      "PyTorch",
      "Computer Vision",
      "NLP",
      "AWS",
      "Docker",
    ],
    experience: [
      {
        title: "Senior AI Engineer",
        company: "TechCorp AI",
        duration: "2022 - Present",
        description: "Leading AI research initiatives and model development",
      },
      {
        title: "ML Engineer",
        company: "DataFlow Solutions",
        duration: "2020 - 2022",
        description: "Built and deployed machine learning models at scale",
      },
    ],
    education: [
      {
        degree: "MS Computer Science",
        school: "Stanford University",
        year: "2020",
      },
      {
        degree: "BS Computer Engineering",
        school: "UC Berkeley",
        year: "2018",
      },
    ],
  });

  const calculateProfileCompletion = () => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.title,
      profileData.company,
      profileData.bio,
      profileData.skills.length > 0,
      profileData.experience.length > 0,
      profileData.education.length > 0,
    ];
    const completedFields = fields.filter(
      (field) => field && field !== ""
    ).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const VisibilityToggle = ({
    type,
    label,
  }: {
    type: keyof typeof profileVisibility;
    label: string;
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <span className="font-medium">{label}</span>
      <Button
        variant={profileVisibility[type] ? "default" : "outline"}
        size="sm"
        onClick={() =>
          setProfileVisibility({
            ...profileVisibility,
            [type]: !profileVisibility[type],
          })
        }
      >
        {profileVisibility[type] ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">
              Manage your professional profile and visibility
            </p>
          </div>
          <div className="flex space-x-2">
            <Button>
              <Upload className="h-4 w-4 mr-1" />
              Upload Resume
            </Button>
          </div>
        </div>

        {/* Profile Completion */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Profile Completion</h3>
                <p className="text-sm text-gray-600">
                  Complete your profile to get better opportunities
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {calculateProfileCompletion()}%
                </div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
            <Progress value={calculateProfileCompletion()} className="w-full" />
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Basic Info</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="skills">Skills & Education</TabsTrigger>
            <TabsTrigger value="privacy">Documents & files</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Photo */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4">
                    <AvatarFallback className="text-2xl">
                      {profileData.firstName[0]}
                      {profileData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="w-full">
                    <Camera className="h-4 w-4 mr-1" />
                    Change Photo
                  </Button>
                  <Button variant="outline" className="w-full mt-2">
                    <X className="h-4 w-4 mr-1" />
                    Remove Photo
                  </Button>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        First Name
                      </label>
                      <Input
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
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
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Professional Title
                    </label>
                    <Input
                      value={profileData.title}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Company
                      </label>
                      <Input
                        value={profileData.company}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <Input
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bio
                    </label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                  <Button className="w-full">Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="experience" className="mt-6">
            <div className="space-y-6">
              {/* Work Experience */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5" />
                      Work Experience
                    </CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Experience
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData.experience.map((exp, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{exp.title}</h4>
                            <p className="text-gray-600">{exp.company}</p>
                            <p className="text-sm text-gray-500">
                              {exp.duration}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-gray-700">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5" />
                      Skills & Expertise
                    </CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Skill
                    </Button>
                  </div>
                  <CardDescription>
                    Highlight your technical skills and expertise areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-sm py-1 px-3"
                          >
                            {skill}
                            <button className="ml-2 text-gray-500 hover:text-red-600">
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Add New Skill</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter skill name..."
                          className="flex-1"
                        />
                        <Button>Add</Button>
                      </div>
                    </div>

                    <div></div>
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Education
                    </CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Education
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{edu.degree}</h4>
                            <p className="text-gray-600">{edu.school}</p>
                            <p className="text-sm text-gray-500">{edu.year}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            <div className="space-y-6">
              {/* Document Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Files</CardTitle>
                  <CardDescription>
                    Upload and manage your documents (resume, portfolio,
                    certificates, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600 mb-2">
                        Upload files (unlimited size and type)
                      </p>
                      <Button variant="outline">Choose Files</Button>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Uploaded Files</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded">📄</div>
                            <div>
                              <p className="font-medium">Resume_2024.pdf</p>
                              <p className="text-sm text-gray-500">
                                Uploaded 2 days ago
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                            <Button variant="ghost" size="sm">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
