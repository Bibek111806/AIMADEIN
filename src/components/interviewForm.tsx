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
import { useEffect, useState } from "react";
import { Interview, useInterview } from "@/context/InterviewContext";

interface InterviewFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Interview | null;
}

export default function InterviewFormModal({
  open,
  onClose,
  initialData,
}: InterviewFormModalProps) {
  const { createInterview, updateInterview } = useInterview();

  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    position: "",
    date: "",
    time: "",
    duration: "60",
    mode: "online",
    notes: "",
    meetingLink: "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      if (initialData) {
        setForm({
          candidateName: initialData.candidateName,
          candidateEmail: initialData.candidateEmail,
          position: initialData.position,
          date: initialData.date,
          time: initialData.time,
          duration: initialData.duration || "60",
          mode: initialData.mode,
          notes: initialData.notes || "",
          meetingLink: initialData.meetingLink || "",
        });
      } else {
        setForm({
          candidateName: "",
          candidateEmail: "",
          position: "",
          date: "",
          time: "",
          duration: "60",
          mode: "online",
          notes: "",
          meetingLink: "",
        });
      }
    }
  }, [open, initialData]);

  const handleSave = async () => {
    setErrors({});
    try {
      if (initialData) {
        await updateInterview(initialData.id, form);
      } else {
        await createInterview(form);
      }
      onClose();
    } catch (error: any) {
      if (error?.response?.status === 400 && error?.response?.data) {
        setErrors(error.response.data);
      }
    }
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return (
        <p className="text-red-600 text-xs mt-1">
          {errors[field].join(" ")}
        </p>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Interview" : "Schedule New Interview"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
          <div>
            <Label>Candidate Name *</Label>
            <Input
              value={form.candidateName}
              onChange={(e) =>
                setForm({ ...form, candidateName: e.target.value })
              }
            />
            {renderError("name")}
          </div>
          <div>
            <Label>Candidate Email</Label>
            <Input
              type="email"
              value={form.candidateEmail}
              onChange={(e) =>
                setForm({ ...form, candidateEmail: e.target.value })
              }
            />
            {renderError("email")}
          </div>
          <div>
            <Label>Position</Label>
            <Input
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: e.target.value })
              }
            />
            {renderError("position")}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />
              {renderError("date")}
            </div>
            <div>
              <Label>Time *</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm({ ...form, time: e.target.value })
                }
              />
              {renderError("time")}
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm({ ...form, duration: e.target.value })
                }
              />
              {renderError("duration_minutes")}
            </div>
          </div>
          <div>
            <Label>Interview Mode</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={form.mode}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value })
              }
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="zoom">Zoom</option>
              <option value="google_meet">Google Meet</option>
              <option value="phone_call">Phone Call</option>
            </select>
            {renderError("interview_mode")}
          </div>
          <div>
            <Label>Meeting Link</Label>
            <Input
              value={form.meetingLink}
              onChange={(e) =>
                setForm({ ...form, meetingLink: e.target.value })
              }
            />
            {renderError("meeting_link")}
          </div>
          <div>
            <Label>Notes</Label>
            <textarea
              className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background resize-none"
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
              placeholder="Interview notes or preparation details..."
            />
            {renderError("notes")}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {initialData ? "Update Interview" : "Schedule Interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
