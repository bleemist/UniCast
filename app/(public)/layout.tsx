import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PersistentPlayerBar } from "@/components/audio/PersistentPlayerBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative bg-navy-900 text-slate-100">
      <PublicHeader />
      <main className="flex-1 relative">{children}</main>
      <PublicFooter />
      <PersistentPlayerBar />
    </div>
  );
}
