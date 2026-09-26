import AdminLayout from "@/components/layouts/AdminLayout";
import { requireAdmin } from "@/lib/auth/session";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();
  return <AdminLayout>{children}</AdminLayout>;
}
