// app/owner/dashboard/layout.js
import AppSidebar from "@/app/components/sidebar/page";
import HeaderPage from "@/app/components/header/page";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }) {
  return (
<SidebarProvider>
  <div className="flex flex-col h-screen w-full">
    <HeaderPage />
    <div className="flex flex-1 overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-4">
        {children}
      </main>
    </div>
  </div>
</SidebarProvider>
  );
}