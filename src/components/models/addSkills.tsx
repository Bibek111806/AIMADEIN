import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const AddSkillModal = ({ onAdd }: { onAdd: (skill: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [skill, setSkill] = useState("");

  const handleSubmit = () => {
    if (skill.trim()) {
      onAdd(skill.trim());
      setSkill("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Skill
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Skill</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Enter skill name"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Add Skill</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSkillModal;
