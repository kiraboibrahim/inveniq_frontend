"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Shield, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: userService.getProfile,
  });

  const displayName = profile?.display_name || user?.name || "";
  const nameParts = displayName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const tabs = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Access", icon: Shield },
    { id: "devices", label: "Connected Devices", icon: Smartphone },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left",
              activeTab === tab.id 
                ? "bg-accent-muted text-accent" 
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 bg-bg-surface border border-border-subtle rounded-md p-6">
        {activeTab === "profile" && <ProfileForm firstName={firstName} lastName={lastName} email={profile?.email || ""} role={profile?.role || ""} />}
        {activeTab !== "profile" && (
          <div className="h-64 flex items-center justify-center text-text-tertiary text-sm">
            Configuration for {activeTab} will appear here.
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileForm({ firstName, lastName, email, role }: { firstName: string; lastName: string; email: string; role: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    await userService.updateProfile({
      first_name: formData.get("firstName"),
      last_name: formData.get("lastName"),
      email: formData.get("email"),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-text-primary">Profile Information</h3>
        <p className="text-sm text-text-secondary">Update your account details and public profile.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-text-secondary">First Name</Label>
              <Input id="firstName" name="firstName" defaultValue={firstName} className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-text-secondary">Last Name</Label>
              <Input id="lastName" name="lastName" defaultValue={lastName} className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-text-secondary">Email Address</Label>
            <Input id="email" name="email" type="email" defaultValue={email} className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-text-secondary">Role</Label>
            <Input id="role" defaultValue={role.charAt(0).toUpperCase() + role.slice(1)} disabled className="bg-bg-base border-border-subtle text-text-tertiary cursor-not-allowed" />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end border-t border-border-subtle">
          <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent-hover text-white">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
