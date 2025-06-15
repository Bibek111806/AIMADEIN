import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/authContext";

const ProfileCompletionCard = () => {
  const { user } = useAuth(); // assumes user includes bio, profile_picture, skills, education, files

  const resumeExists = user?.files?.some(file => file.type === "resume");

  const fields = [
    user?.bio,
    user?.profile_picture,
    user?.skills?.length > 0,
    user?.education?.length > 0,
    resumeExists,
  ];

  const filledCount = fields.filter(Boolean).length;
  const totalFields = fields.length;
  const completion = Math.round((filledCount / totalFields) * 100);

  const missing = [
    !user?.bio && "Add Bio",
    !user?.profile_picture && "Upload Profile Picture",
    (!user?.skills || user.skills.length === 0) && "Add Skills",
    (!user?.education || user.education.length === 0) && "Add Education",
    !resumeExists && "Upload Resume",
  ].filter(Boolean);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          A complete profile helps you get better job matches and networking opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-gray-500">{completion}%</span>
          </div>
          <Progress value={completion} className="w-full" />

          {missing.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {missing.map((action, idx) => (
                <Button key={idx} size="sm" variant="outline">
                  {action}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionCard;
