import {
  Dialog,
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
import ChipsInput from "@/components/ui/chipInput";
import { useState, useEffect } from "react";
import { Job } from "@/context/JobManagerContext";

const emptyJob: Job = {
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

export default function JobFormModal({
  open,
  onClose,
  onSave,
  initialData,
  onAfterSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Job, id?: number) => Promise<void>;
  initialData?: Job | null;
  onAfterSave?: () => Promise<void> | void;
}) {
  const [form, setForm] = useState<Job>(emptyJob);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          ...emptyJob,
          ...initialData,
          skills_required: initialData.skills_required ?? [],
          work_tags: initialData.work_tags ?? [],
          requirements: initialData.requirements ?? [],
          responsibilities: initialData.responsibilities ?? [],
          perks: initialData.perks ?? [],
        });
      } else {
        setForm(emptyJob);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const handleSave = async () => {
    setErrors({});
    try {
      await onSave(form, initialData?.id);
      if (onAfterSave) {
        await onAfterSave();
      }
      onClose();
    } catch (error: any) {
   if (error && typeof error === "object") {
  setErrors(error);
}
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Job" : "Post Job"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Title */}
          <label className="text-sm font-medium">Job Title</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.join(" ")}</p>
          )}

          {/* Location */}
          <label className="text-sm font-medium">Location</label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          {errors.location && (
            <p className="text-xs text-red-500">{errors.location.join(" ")}</p>
          )}

          {/* Job Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Job Type</label>
              <Select
                value={form.job_type}
                onValueChange={(val) =>
                  setForm({ ...form, job_type: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["full_time", "part_time", "freelance", "contract", "temporary"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={form.category}
                onValueChange={(val) =>
                  setForm({ ...form, category: val })
                }
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

          {/* Salary */}
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
                {errors.salary_min && (
                  <p className="text-xs text-red-500">{errors.salary_min.join(" ")}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Salary Max</label>
                <Input
                  value={form.salary_max}
                  onChange={(e) =>
                    setForm({ ...form, salary_max: e.target.value })
                  }
                />
                {errors.salary_max && (
                  <p className="text-xs text-red-500">{errors.salary_max.join(" ")}</p>
                )}
              </div>
            </div>
          )}

          {/* Experience */}
          {(form.category === "job" || form.category === "project") && (
            <>
              <label className="text-sm font-medium">Experience (years)</label>
              <Input
                value={form.experience_required}
                onChange={(e) =>
                  setForm({ ...form, experience_required: e.target.value })
                }
              />
              {errors.experience_required && (
                <p className="text-xs text-red-500">
                  {errors.experience_required.join(" ")}
                </p>
              )}
            </>
          )}

          {/* Deadline */}
          <label className="text-sm font-medium">Deadline</label>
          <Input
            type="date"
            value={form.deadline}
            onChange={(e) =>
              setForm({ ...form, deadline: e.target.value })
            }
          />
          {errors.deadline && (
            <p className="text-xs text-red-500">{errors.deadline.join(" ")}</p>
          )}

          {/* Description */}
          <label className="text-sm font-medium">Description</label>
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.join(" ")}</p>
          )}

          {/* Chips Inputs */}
          <ChipsInput
            label="Skills Required"
            values={form.skills_required}
            onChange={(val) =>
              setForm({ ...form, skills_required: val })
            }
          />
          <ChipsInput
            label="Work Tags"
            values={form.work_tags}
            onChange={(val) =>
              setForm({ ...form, work_tags: val })
            }
          />
          <ChipsInput
            label="Requirements"
            values={form.requirements}
            onChange={(val) =>
              setForm({ ...form, requirements: val })
            }
          />
          <ChipsInput
            label="Responsibilities"
            values={form.responsibilities}
            onChange={(val) =>
              setForm({ ...form, responsibilities: val })
            }
          />
          {form.job_type !== "freelance" &&
            form.job_type !== "temporary" && (
              <ChipsInput
                label="Perks"
                values={form.perks}
                onChange={(val) =>
                  setForm({ ...form, perks: val })
                }
              />
            )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>
            {initialData ? "Update" : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
