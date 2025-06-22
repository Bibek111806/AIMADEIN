import { useState } from "react";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

function Experience() {
  const { user, accessToken, login } = useAuth();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    company: "",
    post: "",
    start_year: "",
    end_year: "",
    description: ""
  });

  const handleDialogOpen = (index: number | null = null) => {
    if (index !== null && user?.works?.[index]) {
      const exp = user.works[index];
      setFormData({
        company: exp.company,
        post: exp.post,
        start_year: exp.start_year,
        end_year: exp.end_year === "present" ? "" : exp.end_year,
        description: exp.description
      });
      setEditingIndex(index);
    } else {
      setFormData({
        company: "",
        post: "",
        start_year: "",
        end_year: "",
        description: ""
      });
      setEditingIndex(null);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        ...formData,
        end_year: formData.end_year?.trim() === "" ? null : formData.end_year
      };

      if (editingIndex !== null) {
        await api.put(`accounts/work/${user.works[editingIndex].id}/`, dataToSend, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        toast({ title: "Experience updated" });
      } else {
        await api.post(`accounts/work/`, dataToSend, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        toast({ title: "Experience added" });
      }
      login(accessToken!, localStorage.getItem("refresh_token")!);
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Failed",
        variant: "destructive",
        description: "Error while saving experience"
      });
    }
  };

  const handleDelete = async () => {
    if (deleteIndex === null || !user?.works[deleteIndex]) return;
    try {
      await api.delete(`accounts/work/${user.works[deleteIndex].id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      toast({ title: "Experience deleted" });
      login(accessToken!, localStorage.getItem("refresh_token")!);
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
            <Briefcase className="mr-2 h-5 w-5" />
            Work Experience
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleDialogOpen(null)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingIndex !== null ? "Edit Experience" : "Add Experience"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Post</label>
                  <Input value={formData.post} onChange={(e) => setFormData({ ...formData, post: e.target.value })} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Start Year</label>
                    <Input value={formData.start_year} onChange={(e) => setFormData({ ...formData, start_year: e.target.value })} />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">End Year</label>
                    <Input value={formData.end_year} onChange={(e) => setFormData({ ...formData, end_year: e.target.value })} />
                    <p className="text-xs text-muted-foreground mt-1">Leave blank if currently working</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {user?.works?.map((exp, index) => (
            <div key={exp.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{exp.post}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.start_year} - {exp.end_year}</p>
                  <p className="text-gray-700">{exp.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleDialogOpen(index)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Dialog open={deleteIndex === index} onOpenChange={(open) => !open && setDeleteIndex(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteIndex(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Do you really want to delete?</DialogTitle>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default Experience;
