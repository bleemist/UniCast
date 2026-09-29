import { Metadata } from "next";
import Link from "next/link";
import {
  Radio,
  GraduationCap,
  Shield,
  Heart,
  Globe2,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About UniCast | Your Campus Pulse",
  description:
    "Learn about UniCast: One Radio. Every Campus. A single online university radio platform connecting students across universities with live music, debates, and real-time audience analytics.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-radio-500/10 border border-radio-500/30 text-xs text-radio-300">
          <Sparkles className="w-3.5 h-3.5 text-radio-400" />
          <span className="font-semibold">The UniCast Story & Philosophy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          One Radio. Every Campus. <br />
          <span className="bg-gradient-to-r from-radio-400 via-cyan-300 to-white bg-clip-text text-transparent">
            Your Campus Pulse.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          UniCast is a single online university radio platform designed to serve as a scalable radio network connecting students across universities.
        </p>
      </div>

      {/* Core Principle: ONE Broadcast, Equal Experience */}
      <div className="p-8 rounded-3xl bg-navy-850 border border-navy-750 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radio-500/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="space-y-2">
          <Badge variant="live" size="sm">
            Core Product Architecture
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            One Unified Broadcast For Every Student
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            UniCast is institution-neutral. We do not build fragmented, siloed university sub-stations. Every listener hears the exact same broadcast stream.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-1.5">
            <span className="text-xs font-bold text-radio-400 block">ONE Live Broadcast</span>
            <p className="text-xs text-slate-400">
              Synchronized audio stream delivered simultaneously to all campuses.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-1.5">
            <span className="text-xs font-bold text-cyan-300 block">ONE Show Schedule</span>
            <p className="text-xs text-slate-400">
              A shared weekly lineup featuring top university presenters and student debates.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-1.5">
            <span className="text-xs font-bold text-emerald-400 block">ONE Public Interface</span>
            <p className="text-xs text-slate-400">
              No multiple portals, no university sub-domains, and zero fragmentation.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 space-y-1.5">
            <span className="text-xs font-bold text-purple-400 block">ONE Shared Community</span>
            <p className="text-xs text-slate-400">
              Students from different universities interact on the same song request queue.
            </p>
          </div>
        </div>
      </div>

      {/* Why We Ask For Your University: Audience Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-radio-500/10 border border-radio-500/30 flex items-center justify-center text-radio-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why Select Your University?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            University selection on UniCast is <strong>strictly for audience analytics</strong> — not content personalization.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            It helps the station measure which universities listen most, track listening volumes by campus, and see audience growth across East Africa.
          </p>
        </div>

        <div className="md:col-span-7 space-y-3">
          <Card className="border-navy-750 bg-navy-850/80 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">What selecting your university does:</h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 pl-6 list-disc">
              <li>Counts your session toward your university&apos;s audience score</li>
              <li>Helps your campus climb the nationwide UniCast listener ranking</li>
              <li>Allows presenters to give shoutouts to the most active campuses</li>
            </ul>
          </Card>

          <Card className="border-navy-750 bg-navy-850/80 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">What it does NOT do:</h4>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5 pl-6 list-disc">
              <li>It does NOT alter the music, news, or programmes you receive</li>
              <li>It does NOT create a separate or private university portal</li>
              <li>It never requires student registration or passwords</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Privacy Commitment */}
      <div className="p-8 rounded-3xl bg-navy-850 border border-navy-750 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Privacy-Conscious Audience Analytics
            </h3>
            <p className="text-xs text-slate-400">
              Student privacy is a foundational pillar of UniCast.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          UniCast does not collect names, phone numbers, student ID numbers, physical addresses, or campus portal credentials from public listeners. We identify sessions using anonymous client tokens stored locally in your browser. Administrators only see aggregate totals (e.g. <em>&quot;Kyambogo University: 1,245 listeners&quot;</em>) and never individual identities.
        </p>

        <div className="pt-4 flex flex-wrap items-center gap-4">
          <Link href="/listen">
            <Button variant="live" size="md" leftIcon={<Radio className="w-4 h-4" />}>
              Start Listening Now
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="md">
              Contact Radio Desk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
