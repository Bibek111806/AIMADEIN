import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface InterviewFormData {
  candidateName: string;
  candidateEmail: string;
  position: string;
  date: string;
  time: string;
  duration: string;
  mode: string;
  notes?: string;
  meetingLink?: string;
}

interface InterviewModalsProps {
  addEditOpen: boolean;
  onAddEditChange: (val: boolean) => void;
  onSave: (data: InterviewFormData) => void;
  editData?: InterviewFormData | null;
  deleteOpen: boolean;
  onDeleteChange: (val: boolean) => void;
  onDeleteConfirm: () => void;
  deleteMessage: string;
  errors?: Record<string, string[]>;
}

const interviewModes = [
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
  { label: "Zoom", value: "zoom" },
  { label: "Google Meet", value: "google_meet" },
  { label: "Phone Call", value: "phone_call" },
];

const emptyForm: InterviewFormData = {
  candidateName: "",
  candidateEmail: "",
  position: "",
  date: "",
  time: "",
  duration: "60",
  mode: "online",
  notes: "",
  meetingLink: "",
};

export default function InterviewModals({
  addEditOpen,
  onAddEditChange,
  onSave,
  editData,
  deleteOpen,
  onDeleteChange,
  onDeleteConfirm,
  deleteMessage,
  errors = {},
}: InterviewModalsProps) {
  const [form, setForm] = useState<InterviewFormData>(emptyForm);

  useEffect(() => {
    if (editData) {
      setForm(editData);
    } else {
      setForm(emptyForm);
    }
  }, [editData]);

  const handleSubmit = () => {
    if (!form.candidateName || !form.date || !form.time) {
      return;
    }
    onSave(form);
  };

  return (
    <>
      {/* ADD / EDIT MODAL */}
      <Dialog open={addEditOpen} onOpenChange={onAddEditChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editData ? "Edit Interview" : "Schedule New Interview"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="candidateName">Candidate Name *</Label>
              <Input
                id="candidateName"
                value={form.candidateName}
                onChange={(e) =>
                  setForm({ ...form, candidateName: e.target.value })
                }
              />
              {errors?.name && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.name.join(" ")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="candidateEmail">Candidate Email</Label>
              <Input
                id="candidateEmail"
                type="email"
                value={form.candidateEmail}
                onChange={(e) =>
                  setForm({ ...form, candidateEmail: e.target.value })
                }
              />
              {errors?.email && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.email.join(" ")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) =>
                  setForm({ ...form, position: e.target.value })
                }
              />
              {errors?.position && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.position.join(" ")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                />
                {errors?.date && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.date.join(" ")}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm({ ...form, time: e.target.value })
                  }
                />
                {errors?.time && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.time.join(" ")}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                />
                {errors?.duration_minutes && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.duration_minutes.join(" ")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="mode">Interview Mode</Label>
              <select
                id="mode"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={form.mode}
                onChange={(e) =>
                  setForm({ ...form, mode: e.target.value })
                }
              >
                {interviewModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
              {errors?.interview_mode && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.interview_mode.join(" ")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                value={form.meetingLink}
                onChange={(e) =>
                  setForm({ ...form, meetingLink: e.target.value })
                }
                placeholder="https://meet.google.com/..."
              />
              {errors?.meeting_link && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.meeting_link.join(" ")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background resize-none"
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                placeholder="Interview notes or preparation details..."
              />
              {errors?.notes && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.notes.join(" ")}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onAddEditChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editData ? "Update Interview" : "Schedule Interview"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <AlertDialog open={deleteOpen} onOpenChange={onDeleteChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
