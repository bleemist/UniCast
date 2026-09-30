"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log sanitized error to monitoring service without exposing stack traces to listeners
    console.error("Application error boundary caught:", error?.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-navy-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
        Broadcast Signal Interrupted
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
        Something Went Wrong
      </h1>
      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        We encountered an unexpected broadcast error while loading this page. Our technical team has been notified.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => reset()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
