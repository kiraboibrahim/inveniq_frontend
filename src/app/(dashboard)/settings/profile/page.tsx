"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Loader2, Mail, Phone, Shield, X, KeyRound, User, Lock } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
    const queryClient = useQueryClient();
    const { user: authUser, login } = useAuthStore();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

    const { data: user, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: userService.getProfile,
    });

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        bio: "",
    });

    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password1: "",
        new_password2: "",
    });

    useEffect(() => {
        if (user) {
            const t = setTimeout(() => {
                setFormData({
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    phone_number: user.phone_number || "",
                    bio: user.bio || "",
                });
            }, 0);
            return () => clearTimeout(t);
        }
    }, [user]);

    const updateMutation = useMutation({
        mutationFn: userService.updateProfile,
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            if (authUser) {
                login({
                    ...authUser,
                    name: data.display_name || data.name || `${data.first_name} ${data.last_name}`.trim() || authUser.name,
                    first_name: data.first_name,
                    last_name: data.last_name,
                });
            }
            toast.success("Profile updated");
        },
        onError: () => toast.error("Failed to update profile"),
    });

    const changePasswordMutation = useMutation({
        mutationFn: userService.changePassword,
        onSuccess: () => {
            toast.success("Password updated");
            setIsPasswordModalOpen(false);
            setPasswordData({ old_password: "", new_password1: "", new_password2: "" });
        },
        onError: (err: any) => {
            const data = err.response?.data;
            const firstError = data ? Object.values(data)[0] : null;
            const msg = Array.isArray(firstError)
                ? firstError[0]
                : typeof firstError === "string"
                    ? firstError
                    : "Failed to change password";
            toast.error(msg);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password1 !== passwordData.new_password2) {
            toast.error("Passwords don't match");
            return;
        }
        changePasswordMutation.mutate(passwordData);
    };

    const getInitials = () => {
        if (user?.first_name || user?.last_name) {
            return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
        }
        return user?.email?.[0]?.toUpperCase() || "U";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-7 h-7 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title="Profile"
                breadcrumbs={[{ label: "Settings" }, { label: "Profile" }]}
            />

            <div className="max-w-5xl mx-auto px-4 md:px-0 pb-16">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── Left: Identity panel ── */}
                    <aside className="lg:w-64 shrink-0 flex flex-col gap-4">
                        {/* Avatar card */}
                        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col items-center text-center gap-4">
                            <div className="relative">
                                <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-display font-bold select-none ring-4 ring-accent/20">
                                    {getInitials()}
                                </div>
                                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-success border-2 border-bg-surface" />
                            </div>
                            <div>
                                <p className="font-semibold text-text-primary leading-tight">{user?.display_name || "—"}</p>
                                <p className="text-xs text-text-tertiary mt-0.5 capitalize">{user?.role}</p>
                            </div>
                            <div className="w-full border-t border-border-subtle pt-4 space-y-2.5 text-left">
                                <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                                    <Mail className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                                    <span className="truncate">{user?.email}</span>
                                </div>
                                {user?.phone_number && (
                                    <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                                        <Phone className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                                        <span>{user.phone_number}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                                    <Shield className="w-3.5 h-3.5 text-accent shrink-0" />
                                    <span className="capitalize">{user?.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tab nav */}
                        <nav className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
                            {[
                                { key: "profile", label: "Personal info", icon: User },
                                { key: "security", label: "Security", icon: Lock },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveTab(key as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${activeTab === key
                                        ? "bg-accent/10 text-accent font-medium border-l-2 border-accent"
                                        : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated border-l-2 border-transparent"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* ── Right: Content panel ── */}
                    <div className="flex-1 min-w-0">
                        {activeTab === "profile" && (
                            <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
                                <div className="px-6 py-5 border-b border-border-subtle">
                                    <h2 className="text-base font-semibold text-text-primary">Personal information</h2>
                                    <p className="text-sm text-text-tertiary mt-0.5">Update your name, contact details, and bio.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="first_name" className="text-text-secondary">First name</Label>
                                            <Input
                                                id="first_name"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                placeholder="First name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="last_name" className="text-text-secondary">Last name</Label>
                                            <Input
                                                id="last_name"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                placeholder="Last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-text-secondary">Email address</Label>
                                        <Input
                                            id="email"
                                            value={user?.email}
                                            disabled
                                            className="bg-bg-base opacity-60"
                                        />
                                        <p className="text-xs text-text-tertiary">Email address cannot be changed.</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone" className="text-text-secondary">Phone number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                                            <Input
                                                id="phone"
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                placeholder="+256 700 000 000"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="bio" className="text-text-secondary">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Tell us a bit about your role or background..."
                                            className="min-h-[100px] resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2 border-t border-border-subtle">
                                        <Button
                                            type="submit"
                                            disabled={updateMutation.isPending}
                                            className="bg-accent hover:bg-accent-hover text-white px-6"
                                        >
                                            {updateMutation.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </span>
                                            ) : "Save changes"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
                                <div className="px-6 py-5 border-b border-border-subtle">
                                    <h2 className="text-base font-semibold text-text-primary">Security</h2>
                                    <p className="text-sm text-text-tertiary mt-0.5">Manage your password and account access.</p>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between py-4 border-b border-border-subtle">
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">Password</p>
                                            <p className="text-xs text-text-tertiary mt-0.5">Last changed: unknown</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsPasswordModalOpen(true)}
                                            className="border-border-strong text-text-primary hover:bg-bg-elevated text-sm"
                                        >
                                            Change password
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">Account role</p>
                                            <p className="text-xs text-text-tertiary mt-0.5 capitalize">{user?.role} — managed by your administrator</p>
                                        </div>
                                        <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent-text font-medium capitalize">
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Password modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-bg-surface border border-border-subtle rounded-xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                            <div className="flex items-center gap-2.5">
                                <KeyRound className="w-4 h-4 text-accent" />
                                <h3 className="text-sm font-semibold text-text-primary">Change password</h3>
                            </div>
                            <button
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="text-text-tertiary hover:text-text-primary p-1 rounded-md hover:bg-bg-elevated transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="old_password" className="text-text-secondary">Current password</Label>
                                <Input
                                    id="old_password"
                                    type="password"
                                    required
                                    value={passwordData.old_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new_password1" className="text-text-secondary">New password</Label>
                                <Input
                                    id="new_password1"
                                    type="password"
                                    required
                                    value={passwordData.new_password1}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password1: e.target.value })}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new_password2" className="text-text-secondary">Confirm new password</Label>
                                <Input
                                    id="new_password2"
                                    type="password"
                                    required
                                    value={passwordData.new_password2}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password2: e.target.value })}
                                    placeholder="Re-enter new password"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                    className="bg-accent hover:bg-accent-hover text-white"
                                >
                                    {changePasswordMutation.isPending ? (
                                        <span className="flex items-center gap-1.5">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Updating...
                                        </span>
                                    ) : "Update password"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}