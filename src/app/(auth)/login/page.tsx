"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { setAuthCookie } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/api";
import { toast } from "sonner";

function getLoginErrorMessage(error: unknown) {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response
    ) {
        const data = error.response.data;
        if (
            typeof data === "object" &&
            data !== null &&
            "non_field_errors" in data &&
            Array.isArray(data.non_field_errors) &&
            typeof data.non_field_errors[0] === "string"
        ) {
            return data.non_field_errors[0];
        }
    }

    return "Invalid email or password";
}

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await authService.login({ email, password });

            const userData = {
                ...data.user,
                name: data.user.name || data.user.display_name || `${data.user.first_name || ""} ${data.user.last_name || ""}`.trim() || "User"
            };
            login(userData);
            setAuthCookie(data.access);
            console.log(data);
            toast.success("Welcome to InvenIQ");

            router.replace("/");
        } catch (error: unknown) {
            toast.error(getLoginErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-bg-base text-text-primary p-4">
            <div className="w-full max-w-[400px]">
                <div className="flex flex-col items-center mb-8">
                    <span className="font-display text-4xl font-extrabold bg-gradient-to-r from-accent to-info bg-clip-text text-transparent tracking-tight mb-2">
                        InvenIQ
                    </span>
                    <p className="text-text-secondary mt-1">AI Inventory Management System</p>
                </div>

                <div className="p-8 bg-bg-surface border border-border-subtle rounded-xl shadow-xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-medium text-text-primary mb-1">Welcome back</h2>
                        <p className="text-sm text-text-secondary">Enter your credentials to access the dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-text-secondary">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@inveniq.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" title="password" className="text-text-secondary">Password</Label>
                                <Link href="/forgot-password" title="forgot-password" className="text-xs text-accent hover:text-accent-hover font-medium">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-2 bg-accent hover:bg-accent-hover text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}