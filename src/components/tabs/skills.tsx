import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Award, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

function Skills() {
  const { user, accessToken, login } = useAuth();
  const [newSkill, setNewSkill] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await api.post(
        "accounts/skills/",
        { name: newSkill },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      toast({ title: "Skill Added" });
      login(accessToken!, localStorage.getItem("refresh_token")!); // refresh context
      setNewSkill("");
    } catch (error) {
      if(error?.response?.data?.name){

        toast({ title: "Failed", variant: "destructive",description:error?.response?.data?.name });
      }else{

        toast({ title: "Failed", variant: "destructive" });
      }
    }
  };

  const handleDeleteSkill = async () => {
    if (deleteIndex === null || !user?.skills[deleteIndex]) return;
    try {
      await api.delete(`accounts/skills/${user.skills[deleteIndex].id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({ title: "Skill Deleted" });
      login(accessToken!, localStorage.getItem("refresh_token")!); // refresh context
      setDeleteIndex(null);
    } catch (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Skills & Expertise
          </CardTitle>
        </div>
        <CardDescription>
          Highlight your technical skills and expertise areas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Technical Skills</h4>
          <div className="flex flex-wrap gap-2">
            {user?.skills?.map((skill, index) => (
              <div key={skill.id}>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  {skill.name}
                  <Dialog
                    open={deleteIndex === index}
                    onOpenChange={(open) => !open && setDeleteIndex(null)}
                  >
                    <DialogTrigger asChild>
                      <button
                        className="ml-2 text-gray-500 hover:text-red-600"
                        onClick={() => setDeleteIndex(index)}
                      >
                        ×
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Do you really want to delete?</DialogTitle>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="destructive" onClick={handleDeleteSkill}>
                          Delete
                        </Button>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Add New Skill</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter skill name..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddSkill}>Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Skills;
