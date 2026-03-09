import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { authOptions } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface-50)" }}>
      <Sidebar />

      {/* Desktop: margin kiri untuk sidebar */}
      {/* Mobile: padding atas untuk header, padding bawah untuk bottom nav */}
      <main className="
        md:ml-60
        pt-16 pb-24
        md:pt-0 md:pb-0
      ">
        <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}