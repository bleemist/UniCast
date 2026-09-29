"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Radio, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("admin@kyu.ac.ug");
  const [password, setPassword] = React.useState("Admin@Kyambogo107");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-radio-600 to-cyan-300 p-0.5 mx-auto shadow-xl shadow-radio-500/20">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <Radio className="w-6 h-6 text-radio-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Studio Management Portal
          </h1>
          <p className="text-xs text-slate-400">
            Kyambogo University Radio 107.4 FM • Authorized Staff Only
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-navy-800 bg-navy-900/90 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-white">Presenter & Admin Sign In</CardTitle>
              <Badge variant="category" size="sm">KYU STUDIO</Badge>
            </div>
            <CardDescription className="text-xs">
              Enter your university radio credentials to access the studio control desk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="University Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="presenter@kyu.ac.ug"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Studio Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full justify-center mt-2"
              >
                Access Studio Desk
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Note for initial setup */}
        <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 text-center">
          <p className="text-xs text-slate-400">
            Initial Administrator Account:
          </p>
          <p className="text-xs font-mono text-radio-300 mt-1 select-all">
            admin@kyu.ac.ug • Admin@Kyambogo107
          </p>
        </div>
      </div>
    </div>
  );
}
