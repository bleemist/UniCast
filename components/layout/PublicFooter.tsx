import Link from "next/link";
import { Radio, Heart, Shield, Music, Calendar, Phone, Mail, MapPin } from "lucide-react";
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
                KYAMBOGO<span className="text-radio-400">RADIO</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The official broadcasting voice of Kyambogo University. Informing,
              entertaining, and empowering students across campus and worldwide on 107.4 FM & Online.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="gold">107.4 FM Kampala</Badge>
              <Badge variant="category">Digital Web</Badge>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/live"
                  className="hover:text-radio-400 transition-colors flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-radio-400" />
                  Live Radio Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/schedule"
                  className="hover:text-radio-400 transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-radio-400" />
                  Show Schedule & Lineup
                </Link>
              </li>
              <li>
                <Link
                  href="/requests"
                  className="hover:text-radio-400 transition-colors flex items-center gap-1.5"
                >
                  <Music className="w-3.5 h-3.5 text-radio-400" />
                  Request a Song & Dedication
                </Link>
              </li>
              <li>
                <Link
                  href="/podcasts"
                  className="hover:text-radio-400 transition-colors"
                >
                  Recorded Shows & Podcasts
                </Link>
              </li>
              <li>
                <Link
                  href="/presenters"
                  className="hover:text-radio-400 transition-colors"
                >
                  Meet Our Presenters
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-radio-400 transition-colors"
                >
                  Campus News & Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Studio Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Studio & Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-radio-400 flex-shrink-0 mt-0.5" />
                <span>Radio House, Main Campus, Kyambogo University, Kampala, Uganda</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-radio-400 flex-shrink-0" />
                <span>+256 700 000 000 (Studio Line)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-radio-400 flex-shrink-0" />
                <span>radio@kyu.ac.ug</span>
              </li>
            </ul>
          </div>

          {/* Broadcast & Admin Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Broadcasting Desk
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorized university DJs and station staff can log into the studio
              dashboard to manage programmes, live requests, and stream controls.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 hover:text-white border border-navy-700 text-xs font-medium transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-radio-400" />
                Studio / Admin Access
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Kyambogo University Radio 107.4 FM. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for Kyambogo University Students
          </p>
        </div>
      </div>
    </footer>
  );
}
