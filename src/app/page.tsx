"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  // If no access code configured, the auth context auto-authenticates,
  // and the useEffect above will redirect
  if (isAuthenticated) {
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = login(code.trim());
    if (result.valid) {
      router.push("/dashboard");
    } else {
      setError("Invalid access code");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">B165 Study Tool</h1>
          <p className="text-muted-foreground mt-2">Global Financial Strategy — Prof. Folkinshteyn</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="access-code" className="text-sm font-medium mb-1.5 block">
                  Access Code
                </label>
                <Input
                  id="access-code"
                  type="password"
                  placeholder="Enter your access code"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(""); }}
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-destructive mt-1.5">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Enter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
