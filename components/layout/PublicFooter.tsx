import Link from "next/link";
import { Radio, Heart, Shield, Music, Calendar, Phone, Mail, MapPin, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-navy-950 border-t border-navy-800 text-slate-400 text-sm mt-auto pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Station Identity Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-radio-500/20 border border-radio-500/40 flex items-center justify-center text-radio-400">
                <Radio className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                UNI<span className="text-radio-400">CAST</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Your Campus Pulse. One single online university radio platform designed to unite students across campuses with live music, student debates, varsity sports, and career insights.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="live">Live Network</Badge>
              <Badge variant="category">Digital Web Player</Badge>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Explore UniCast
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/listen"
                  className="hover:text-radio-400 transition-colors flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-radio-400" />
                  Listen Live Stream
                </Link>
              </li>
              <li>
                <Link
                  href="/schedule"
                  className="hover:text-radio-400 transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-radio-400" />
                  Weekly Show Schedule
                </Link>
              </li>
              <li>
                <Link
                  href="/programmes"
                  className="hover:text-radio-400 transition-colors flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-radio-400" />
                  Radio Programmes
                </Link>
              </li>
              <li>
                <Link
                  href="/request"
                  className="hover:text-radio-400 transition-colors flex items-center gap-1.5"
                >
                  <Music className="w-3.5 h-3.5 text-radio-400" />
                  Song Requests & Shoutouts
                </Link>
              </li>
              <li>
                <Link
                  href="/podcasts"
                  className="hover:text-radio-400 transition-colors"
                >
                  Recorded Podcasts
                </Link>
              </li>
              <li>
                <Link
                  href="/presenters"
                  className="hover:text-radio-400 transition-colors"
                >
                  Meet On-Air Hosts
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-radio-400 transition-colors"
                >
                  Campus News & Sports
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Audience Analytics */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Audience & Privacy
            </h4>
            <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Shield className="w-4 h-4" />
                <span>Anonymous Measurement</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                UniCast measures which universities listen most using anonymous session identifiers. No student names, emails, or student numbers are ever requested.
              </p>
              <Link href="/about" className="text-[11px] text-radio-400 hover:underline block pt-1">
                Read our analytics policy →
              </Link>
            </div>
          </div>

          {/* Broadcast & Admin Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Broadcasting Desk
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorized station DJs, editors, and administrators can log in to manage schedules, approve requests, and review university audience metrics.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 hover:text-white border border-navy-700 text-xs font-medium transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-radio-400" />
                Studio / Admin Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} UniCast. Your Campus Pulse. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            One Radio. Every Campus. Powered by <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for University Students
          </p>
        </div>
      </div>
    </footer>
  );
}
