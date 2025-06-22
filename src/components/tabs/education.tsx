import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter,
  DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { BookOpen, Plus, Edit, Trash } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

function Education() {
  const { user, accessToken, login } = useAuth();
  const [educations, setEducations] = useState([]);
  const [form, setForm] = useState({
    institution: "",
    degree: "",
    start_year: "",
    end_year: "",
    description: ""
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (user?.educations) {
      setEducations(user.educations);
    }
  }, [user]);

  const refreshProfile = async () => {
    if (accessToken && localStorage.getItem("refresh_token")) {
      login(accessToken, localStorage.getItem("refresh_token")!);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (payload.end_year === "") {
        delete payload.end_year; 
      }

      if (editId) {
        await api.put(`accounts/education/${editId}/`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        toast({ title: "Updated", description: "Education updated successfully." });
      } else {
        await api.post("accounts/education/", payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        toast({ title: "Added", description: "Education added successfully." });
      }
      setOpenDialog(false);
      setForm({ institution: "", degree: "", start_year: "", end_year: "", description: "" });
      setEditId(null);
      await refreshProfile();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save education data.",
      });
    }
  };

  const handleEdit = (edu: any) => {
    setForm({
      institution: edu.institution,
      degree: edu.degree,
      start_year: edu.start_year,
      end_year: edu.end_year ?? "",
      description: edu.description ?? ""
    });
    setEditId(edu.id);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`accounts/education/${deleteId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({ title: "Deleted", description: "Education removed successfully." });
      setConfirmDelete(false);
      setDeleteId(null);
      await refreshProfile();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete education.",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Education
            </CardTitle>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => {
                  setEditId(null);
                  setForm({ institution: "", degree: "", start_year: "", end_year: "", description: "" });
                  setOpenDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Education
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editId ? "Edit Education" : "Add Education"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label className="block text-sm mb-1">Institution</label>
                    <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Degree</label>
                    <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm mb-1">Start Year</label>
                      <Input type="number" value={form.start_year} onChange={(e) => setForm({ ...form, start_year: e.target.value })} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm mb-1">End Year <span className="text-xs text-muted">Leave blank if studying</span></label>
                      <Input type="number" value={form.end_year} onChange={(e) => setForm({ ...form, end_year: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Description</label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit}>{editId ? "Update" : "Add"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {educations.map((edu: any) => (
              <div key={edu.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">
                      {edu.start_year} - {edu.end_year ? edu.end_year : "Present"}
                    </p>
                    {edu.description && <p className="text-gray-700 mt-1">{edu.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(edu)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Dialog open={deleteId === edu.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteId(edu.id);
                            setConfirmDelete(true);
                          }}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Do you really want to delete?</DialogTitle>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
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
    </>
  );
}

export default Education;
