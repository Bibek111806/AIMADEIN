import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OrganizationJobCard from "@/components/organizationJobCard";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 💡 Chips input
const ChipsInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (val: string[]) => void;
}) => {
  const [input, setInput] = useState("");
  const addChip = () => {
    if (input.trim()) {
      onChange([...value, input.trim()]);
      setInput("");
    }
  };
  const removeChip = (i: number) => {
    onChange(value.filter((_, index) => index !== i));
  };
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2 border px-2 py-1 rounded-md">
        {value.map((v, i) => (
          <span
            key={i}
            className="bg-gray-200 px-2 py-0.5 rounded-full text-sm flex items-center"
          >
            {v}
            <button className="ml-1 text-red-600" onClick={() => removeChip(i)}>
              &times;
            </button>
          </span>
        ))}
        <input
          className="outline-none px-1 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addChip())
          }
          placeholder="Type and press Enter"
        />
      </div>
    </div>
  );
};

// Initial form
const emptyJob = {
  title: "",
  location: "",
  salary_min: "",
  salary_max: "",
  experience_required: "",
  job_type: "full_time",
  category: "job",
  deadline: "",
  description: "",
  skills_required: [],
  work_tags: [],
  requirements: [],
  responsibilities: [],
  perks: [],
};

export default function OrganizationJobs() {
  const { accessToken } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyJob });
  const [isEdit, setIsEdit] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Load Jobs
  const loadJobs = async () => {
    try {
      const res = await api.get("jobs/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setJobs(res.data);
    } catch {
      toast({
        title: "Error",
        description: "Could not fetch jobs",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Open Modal for Edit/Create
  const openForm = (job?: any) => {
    if (job) {
      setForm({ ...job });
      setIsEdit(job.id);
    } else {
      setForm({ ...emptyJob });
      setIsEdit(null);
    }
    setModalOpen(true);
  };

  // 💾 Save or Update
  const saveJob = async () => {
    try {
      if (!form.title)
        return toast({ title: "Missing title", variant: "destructive" });

      const method = isEdit ? "put" : "post";
      const url = isEdit
        ? `jobs/${isEdit}/`
        : "jobs/";

      await api[method](url, form, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      toast({ title: isEdit ? "Updated" : "Posted", description: "Job saved" });
      setModalOpen(false);
      loadJobs();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.detail || "Failed",
        variant: "destructive",
      });
    }
  };

  // ❌ Delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`jobs/${deleteId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({ title: "Deleted", description: "Job removed" });
      setDeleteId(null);
      loadJobs();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  // 🔍 Filter jobs
  const filtered = jobs.filter((j) =>
    tab === "all"
      ? true
      : tab === "expired"
      ? j.status === "expired"
      : j.category === tab
  );

  return (
    <DashboardLayout>
      {/* 🧭 Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">Manage your job posts</p>
        </div>
        <Button onClick={() => openForm()}>Post a Job</Button>
      </div>

      {/* 🔘 Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-6">
          {[
            "all",
            "job",
            "internship",
            "volunteering",
            "project",
            "expired",
          ].map((c) => (
            <TabsTrigger key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 📃 Jobs */}
      <div className="mt-4 space-y-4">
        {filtered.map((job) => (
          <OrganizationJobCard
            key={job.id}
            job={job}
            onEdit={() => openForm(job)}
            onDelete={() => setDeleteId(job.id)}
          />
        ))}
      </div>

      {/* 🔲 Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Job" : "Post Job"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <label className="text-sm font-medium">Job Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <label className="text-sm font-medium">Location</label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Job Type</label>
                <Select
                  value={form.job_type}
                  onValueChange={(val) => setForm({ ...form, job_type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "full_time",
                      "part_time",
                      "freelance",
                      "contract",
                      "temporary",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["job", "internship", "volunteering", "project"].map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c.toUpperCase()}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conditionally show salary */}
            {form.category === "job" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Salary Min</label>
                  <Input
                    value={form.salary_min}
                    onChange={(e) =>
                      setForm({ ...form, salary_min: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Salary Max</label>
                  <Input
                    value={form.salary_max}
                    onChange={(e) =>
                      setForm({ ...form, salary_max: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          {(form.category === "job" || form.category === "project") && (
            <>
              <label className="text-sm font-medium">Experience (in years)</label>
              <Input
                value={form.experience_required}
                onChange={(e) =>
                  setForm({ ...form, experience_required: e.target.value })
                }
              />
            </>
          )}

            <label className="text-sm font-medium">Deadline</label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />

            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            {/*  Chips */}
            <ChipsInput
              label="Skills Required"
              value={form.skills_required}
              onChange={(val) => setForm({ ...form, skills_required: val })}
            />
            <ChipsInput
              label="Work Tags"
              value={form.work_tags}
              onChange={(val) => setForm({ ...form, work_tags: val })}
            />
            <ChipsInput
              label="Requirements"
              value={form.requirements}
              onChange={(val) => setForm({ ...form, requirements: val })}
            />
            <ChipsInput
              label="Responsibilities"
              value={form.responsibilities}
              onChange={(val) => setForm({ ...form, responsibilities: val })}
            />
            {form.job_type !== "freelance" && form.job_type !== "temporary" && (

              <ChipsInput
              label="Perks"
              value={form.perks}
              onChange={(val) => setForm({ ...form, perks: val })}
              />
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveJob}>{isEdit ? "Update" : "Post"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🗑️ Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this job?</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
