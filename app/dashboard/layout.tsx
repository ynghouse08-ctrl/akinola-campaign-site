import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, blocked")
    .eq("id", user.id)
    .single();

  if (profile?.blocked) {
    await supabase.auth.signOut();
    redirect("/blocked");
  }

  return (
         <div className="flex min-h-screen flex-col bg-paper sm:flex-row">
      <Sidebar
        fullName={profile?.full_name ?? null}
        isAdmin={profile?.role === "admin"}
      />
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
