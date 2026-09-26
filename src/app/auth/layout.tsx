import AuthLayout from "@/components/layouts/AuthLayout";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  if (await getAdminSession()) redirect("/dashboard");
  return <AuthLayout>{children}</AuthLayout>;
}
