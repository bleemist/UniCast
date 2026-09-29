import { Mail, Phone, MapPin, Radio, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact Kyambogo Radio",
  description: "Get in touch with Kyambogo University Online Radio studio and management.",
};

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            Station Enquiries
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Contact Kyambogo Radio 107.4 FM
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Have an announcement, advert inquiry, news tip, or feedback on our programmes? Reach out to our station team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Contact Form */}
        <div className="lg:col-span-7">
          <Card className="border-navy-700/80 bg-navy-850/80 shadow-2xl">
            <CardHeader className="pb-4 border-b border-navy-750">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Send Us a Message</CardTitle>
                <Badge variant="category" size="sm">STATION DESK</Badge>
              </div>
              <CardDescription className="text-xs">
                We review inquiries during working hours (Monday to Friday, 8:00 AM - 5:00 PM).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ContactForm />
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Cols: Contact Details */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-navy-800 bg-navy-850/70">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Studio Location & Lines
                </h3>
                <p className="text-xs text-slate-400">
                  Main campus broadcasting headquarters
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-radio-500/10 border border-radio-500/30 flex items-center justify-center text-radio-400 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Studio Location</strong>
                    <span className="text-slate-400">
                      Radio House, Kyambogo University Main Campus, Kampala, Uganda
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-radio-500/10 border border-radio-500/30 flex items-center justify-center text-radio-400 flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Studio Hotline</strong>
                    <span className="text-slate-400">+256 700 000 000 / +256 414 000 000</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-radio-500/10 border border-radio-500/30 flex items-center justify-center text-radio-400 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Official Email</strong>
                    <span className="text-slate-400">radio@kyu.ac.ug</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-radio-500/10 border border-radio-500/30 flex items-center justify-center text-radio-400 flex-shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Frequency</strong>
                    <span className="text-slate-400">107.4 FM Kampala & Worldwide Web Stream</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
