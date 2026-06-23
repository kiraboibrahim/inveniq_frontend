"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: authService.forgotPassword,
        onSuccess: () => {
            setIsSuccess(true);
            toast.success("Reset link sent to your email");
        },
        onError: (error: unknown) => {
            const msg = (error as any)?.response?.data?.detail || "Failed to send password reset email";
            toast.error(msg);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(email);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
                <Card className="max-w-md w-full bg-bg-surface border-border-subtle">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                                <MailCheck className="h-6 w-6 text-success" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-display">Check your email</CardTitle>
                        <CardDescription className="text-text-secondary mt-2">
                            We've sent a password reset link to <span className="text-text-primary font-medium">{email}</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-sm text-text-tertiary">
                        Didn't receive the email? Check your spam folder or try again.
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            variant="outline"
                            className="w-full border-border-strong text-text-primary"
                            onClick={() => setIsSuccess(false)}
                        >
                            Try another email
                        </Button>
                        <Link href="/login" className="text-sm text-accent hover:underline flex items-center justify-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
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
                    <CardTitle className="text-2xl font-display">Forgot password?</CardTitle>
                    <CardDescription>
                        Enter your email and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-bg-elevated border-border-subtle"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent-hover text-white"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending link...
                                </span>
                            ) : "Send Reset Link"}
                        </Button>
                        <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary flex items-center justify-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
