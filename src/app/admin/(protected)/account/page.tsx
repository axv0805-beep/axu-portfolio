import { requireUser } from "@/lib/auth";
import { PasswordForm } from "@/components/admin/password-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  return <PasswordForm username={user?.username ?? ""} displayName={user?.displayName ?? ""} />;
}
