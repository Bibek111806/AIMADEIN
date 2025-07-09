import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Users,
  MessageCircle,
  UserPlus,
  Globe,
  Building,
  GraduationCap
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api
        .get(`/users/${id}/`)
        .then((res) => {
          const data = res.data;

          const transformed = {
            id: data.id,
            type: data.role === "organization" ? "organization" : "individual",
            name: data.full_name || data.company_name,
            title: data.professional_title,
            location: data.address,
            email: data.email,
            bio: data.bio || "",
            skills: data.skills?.map((s: any) => s.name) || [],
            connections: data.total_connections,
            isConnection: data.connection_status === "accepted",
            avatar: data.profile_picture,
            industry: data.organization_profile?.industry_type || "",
            employees: data.employees,
            website: data.website,
            founded: data.organization_profile?.founding_year || "",
            contactPerson: data.organization_profile?.contact_person || "",
            services: (data.services || []).map((s: any) => s.name),
            followers: data.followers,
            experience: [],
            education: [],

          };

          setProfile(transformed);
        })
        .catch(() => {
          setProfile(null);
        });
    }
  }, [id]);

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Profile not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const isIndividual = profile.type === 'individual';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/community')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Community
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-xl">
                  {profile.name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    {isIndividual ? (
                      <>
                        <p className="text-xl text-gray-600 mb-2">{profile.title}</p>
                        <div className="flex items-center text-gray-500 mb-2">
         
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{profile.location}</span>
                        </div>
                      </>
                    ) : (
                      <>
                     
                        <div className="flex items-center text-gray-500 mb-2">
                          
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{profile.location || "N/A"}</span>
                        </div>
              
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{profile.bio}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(isIndividual ? profile.skills : profile.services).map((item: string) => (
                    <Badge key={item} variant="secondary">{item}</Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  {isIndividual ? (
                    <span><Users className="h-4 w-4 inline mr-1" />{profile.connections} connections</span>
                  ) : (
                    <>
                      <span>{profile.followers || 0} followers</span>
                      <span>Founded in {profile.founded || "N/A"}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content Tabs */}
        <Tabs defaultValue={isIndividual ? "experience" : "about"} className="w-full">
          <TabsList className={`grid w-full ${isIndividual ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {isIndividual ? (
              <>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </>
            )}
          </TabsList>

          {isIndividual ? (
            <>
              <TabsContent value="experience" className="mt-6">
                <div className="space-y-4">
                  {profile.experience.length > 0 ? (
                    profile.experience.map((exp: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold">{exp.title}</h3>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500 mb-2">{exp.period}</p>
                          <p className="text-gray-700">{exp.description}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500">No experience added yet.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="education" className="mt-6">
                <div className="space-y-4">
                  {profile.education.length > 0 ? (
                    profile.education.map((edu: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-3">
                            <GraduationCap className="h-6 w-6 text-blue-600 mt-1" />
                            <div>
                              <h3 className="text-lg font-semibold">{edu.degree}</h3>
                              <p className="text-gray-600">{edu.school}</p>
                              <p className="text-sm text-gray-500 mb-2">{edu.period}</p>
                              <p className="text-gray-700">{edu.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-500">No education details added yet.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="skills" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Skills</CardTitle>
                    <CardDescription>Areas of expertise and proficiency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {profile.skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-sm py-2 px-3">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No skills listed.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">About {profile.name}</h3>
                    <p className="text-gray-700 mb-4">{profile.bio || "No organization bio provided."}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Contact Person</h4>
                        <p className="text-gray-600">{profile.contactPerson || "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Founded</h4>
                        <p className="text-gray-600">{profile.founded || "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Industry</h4>
                        <p className="text-gray-600">{profile.industry || "N/A"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Location</h4>
                        <p className="text-gray-600">{profile.location || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Services</CardTitle>
                    <CardDescription>Services provided by this organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profile.services.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {profile.services.map((service: string) => (
                          <Badge key={service} variant="secondary" className="text-sm py-2 px-3">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No services listed.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
