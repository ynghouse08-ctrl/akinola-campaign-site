import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, blocked")
    .eq("id", user.id)
    .single();

  if (profile?.blocked) {
    await supabase.auth.signOut();
    redirect("/blocked");
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <AdminSidebar fullName={profile?.full_name ?? null} />
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
