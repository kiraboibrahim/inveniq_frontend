"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordConfirmPage() {
    const params = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        new_password1: "",
        new_password2: "",
    });
    const [isSuccess, setIsSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: (data: { new_password1: string; new_password2: string }) => authService.resetPassword({
            ...data,
            uid: params.uid,
            token: params.token,
        }),
        onSuccess: () => {
            setIsSuccess(true);
            toast.success("Password reset successfully");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        },
        onError: (error: unknown) => {
            const errorMsg = (error as any)?.response?.data?.non_field_errors?.[0] || "Failed to reset password. Link may be expired.";
            toast.error(errorMsg);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.new_password1 !== formData.new_password2) {
            toast.error("Passwords do not match");
            return;
        }
        mutation.mutate(formData);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
                <Card className="max-w-md w-full bg-bg-surface border-border-subtle">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-success" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-display">Success!</CardTitle>
                        <CardDescription className="text-text-secondary mt-2">
                            Your password has been reset successfully. Redirecting you to login...
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link href="/login" className="w-full">
                            <Button className="w-full bg-accent hover:bg-accent-hover text-white">
                                Login Now
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
            <Card className="max-w-md w-full bg-bg-surface border-border-subtle">
                <CardHeader>
                    <CardTitle className="text-2xl font-display">Set new password</CardTitle>
                    <CardDescription>
                        Choose a strong password that you haven't used before.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new_password1">New Password</Label>
                            <Input
                                id="new_password1"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={formData.new_password1}
                                onChange={(e) => setFormData({ ...formData, new_password1: e.target.value })}
                                className="bg-bg-elevated border-border-subtle"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new_password2">Confirm New Password</Label>
                            <Input
                                id="new_password2"
                                type="password"
                                placeholder="••••••••"
                                required
                                value={formData.new_password2}
                                onChange={(e) => setFormData({ ...formData, new_password2: e.target.value })}
                                className="bg-bg-elevated border-border-subtle"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent-hover text-white"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Resetting password...
                                </span>
                            ) : "Reset Password"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
