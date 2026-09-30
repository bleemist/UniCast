"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global critical error:", error?.message);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#050814] text-white flex flex-col items-center justify-center min-h-screen p-6 font-sans">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">System Error</h1>
          <p className="text-sm text-slate-400">
            A critical system error occurred. Please refresh the broadcast page.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg text-sm transition-colors"
          >
            Reload Broadcast
          </button>
        </div>
      </body>
    </html>
  );
}
