import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Shield, Lock, Trash2, LogOut } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/authContext";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();
  const { user, accessToken, logout, login } = useAuth();
  const [privacy, setPrivacy] = useState({
    profileVisibility: user?.profile_visibility || "connections",
    showEmail: user?.show_email ?? true,
    showPhone: user?.show_phone ?? true,
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const updatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Password mismatch", variant: "destructive" });
      setPasswordDialogOpen(false);
      return;
    }
    setPasswordLoading(true);
    try {
      await api.post(
        "accounts/change-password/",
        {
          old_password: passwords.current,
          new_password: passwords.new,
          confirm_password: passwords.confirm,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast({
        title: "Password Updated",
        description: "Your password has been changed.",
      });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch {
      toast({
        title: "Failed",
        description: "Could not update password",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
      setPasswordDialogOpen(false);
    }
  };

  const savePrivacy = async () => {
    try {
      await api.put(
        "accounts/privacy/",
        {
          profile_visibility: privacy.profileVisibility,
          show_email: privacy.showEmail,
          show_phone: privacy.showPhone,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast({
        title: "Privacy Updated",
        description: "Your privacy settings were saved.",
      });
      login(accessToken!, localStorage.getItem("refresh_token")!);
    } catch {
      toast({
        title: "Failed",
        description: "Could not save privacy settings",
        variant: "destructive",
      });
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("accounts/delete/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast({
        title: "Account Deleted",
        description: "Your account was permanently deleted.",
      });
      logout();
    } catch {
      toast({
        title: "Failed",
        description: "Could not delete account",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and privacy settings
        </p>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Password & Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Current password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
            />
            <Input
              type="password"
              placeholder="New password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
            />
            <Dialog
              open={passwordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="w-full" onClick={() => setPasswordDialogOpen(true)}>
                  Update Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Do you really want to change your password?
                  </DialogTitle>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    onClick={updatePassword}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Updating..." : "Yes, Change"}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        {user?.role === "individual" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Profile Visibility
                </label>
                <Select
                  value={privacy.profileVisibility}
                  onValueChange={(value) =>
                    setPrivacy({ ...privacy, profileVisibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (Everyone)</SelectItem>
                    <SelectItem value="connection">
                      Connections Only
                    </SelectItem>
                    <SelectItem value="organization">
                      Organizations Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Show email address</span>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, showEmail: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Show phone number</span>
                  <Switch
                    checked={privacy.showPhone}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, showPhone: checked })
                    }
                  />
                </div>
              </div>
              <Button className="w-full" onClick={savePrivacy}>
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logout */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex justify-between items-center p-3 border rounded-lg bg-blue-50 border-blue-200 hover:bg-blue-100 transition cursor-pointer">
                  <div>
                    <p className="font-medium text-blue-800">Logout</p>
                    <p className="text-sm text-blue-700">
                      Log out from your account
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-blue-700 border-blue-400 hover:bg-blue-100"
                    size="sm"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Do you really want to logout?</DialogTitle>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={logout}>
                    Yes, Logout
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Account */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex justify-between items-center p-3 border rounded-lg border-red-200 hover:bg-red-50 transition cursor-pointer">
                  <div>
                    <p className="font-medium text-red-700">Delete Account</p>
                    <p className="text-sm text-red-600">
                      Permanently delete your account
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Do you really want to delete your account?
                  </DialogTitle>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={deleteAccount}>
                    Yes, Delete
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
