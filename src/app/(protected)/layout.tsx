import { NavBar } from "@/components/nav-bar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </>
  );
}
