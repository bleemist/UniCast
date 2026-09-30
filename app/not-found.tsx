import Link from "next/link";
import { Radio, Home, Compass, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-radio-500/10 border border-radio-500/30 flex items-center justify-center text-radio-400 mb-6 shadow-glow">
        <Radio className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-radio-400 mb-2">
        Frequency Out of Range • Error 404
      </span>
      <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
        Page Not Found
      </h1>
      <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
        The programme, page, or studio signal you are looking for does not exist or has been relocated to another frequency.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Back to Homepage
          </Button>
        </Link>
        <Link href="/listen">
          <Button variant="secondary" size="md" leftIcon={<Radio className="w-4 h-4" />}>
            Tune into Live Broadcast
          </Button>
        </Link>
        <Link href="/schedule">
          <Button variant="outline" size="md" leftIcon={<Compass className="w-4 h-4" />}>
            View Schedule
          </Button>
        </Link>
      </div>
    </div>
  );
}
