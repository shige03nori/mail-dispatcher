import { getSession } from "@/lib/auth/session";
import { HamburgerMenu } from "./HamburgerMenu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const role = (session?.role ?? "VIEWER") as "ADMIN" | "EDITOR" | "VIEWER";

  return (
    <>
      <HamburgerMenu role={role} />
      {children}
    </>
  );
}
