import "../globals.css";
import { SideNav } from "../side-nav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="container mx-auto pt-12">
      <div className="flex">
        <SideNav />

        <div className="w-full">
          {children}
        </div>
      </div>
    </main>
  );
}
