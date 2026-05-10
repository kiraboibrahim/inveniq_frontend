"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { setAuthCookie } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackageSearch, Loader2 } from "lucide-react";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser = {
      id: "u1",
      name: "Bushira Admin",
      email: "admin@aims.com",
      role: "Super Administrator"
    };

    // Set state and cookie
    login(mockUser);
    setAuthCookie("mock_jwt_token_" + Date.now());

    // Redirect to dashboard
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg-base text-text-primary p-4">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-accent rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
            <PackageSearch className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display tracking-tight text-text-primary">AIMS</h1>
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
                placeholder="admin@aims.com" 
                required 
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-text-secondary">Password</Label>
                <a href="#" className="text-xs text-accent hover:text-accent-hover font-medium">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent"
              />
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
          
          <div className="mt-6 text-center text-xs text-text-tertiary">
            Prototype Authentication. Any credentials will work.
          </div>
        </div>
      </div>
    </div>
  );
}
