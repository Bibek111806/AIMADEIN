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
import { Award } from "lucide-react";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

function Services() {
  const { user, accessToken, login } = useAuth();
  const [newService, setNewService] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleAddService = async () => {
    if (!newService.trim()) {
      toast({
        title: "Empty Field",
        description: "Please enter a service name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post(
        "accounts/organization/services/",
        { name: newService },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      toast({
        title: "Service Added",
        description: `"${newService}" has been added successfully.`,
      });
      login(accessToken!, localStorage.getItem("refresh_token")!);
      setNewService("");
    } catch (error) {
      const errorMsg =
        error?.response?.data?.name?.[0] || "Failed to add service.";
      toast({
        title: "Add Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async () => {
    if (
      deleteIndex === null ||
      !user?.services?.[deleteIndex]
    )
      return;

    const service = user.services[deleteIndex];

    try {
      await api.delete(`accounts/organization/services/${service.id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({
        title: "Service Deleted",
        description: `"${service.name}" has been removed successfully.`,
      });
      login(accessToken!, localStorage.getItem("refresh_token")!);
      setDeleteIndex(null);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete the service. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Services Offered
          </CardTitle>
        </div>
        <CardDescription>
          Highlight your organization's services and areas of expertise.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Service List</h4>
          <div className="flex flex-wrap gap-2">
            {user?.services?.length > 0 ? (
              user.services.map((service, index) => (
                <div key={service.id}>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    {service.name}
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
                          <DialogTitle>Confirm Deletion</DialogTitle>
                        </DialogHeader>
                        <p>
                          Are you sure you want to delete the service "
                          <strong>{service.name}</strong>"?
                        </p>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteService}
                          >
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
              ))
            ) : (
              <p className="text-gray-500 text-sm">No services added yet.</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Add New Service</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter service name..."
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddService}>Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Services;
