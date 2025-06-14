"use client";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const itemsOwner = [
  { title: "Manage Employee", url: "/owner/dashboard/manageEmployee" },
  { title: "Manage Task", url: "/owner/dashboard/task" },
  { title: "Message", url: "/owner/dashboard/message/" },
];

const itemsEmployee = [
  { title: "Tasks List", url: "/employee/dashboard/task" },
  { title: "Message", url: "/employee/dashboard/message/" },
];

export default function AppSidebar() {
  const role = typeof window !== "undefined" ? localStorage.getItem("selectedRole") : "employee"; // fallback để tránh lỗi SSR
  const menuItems = role === "owner" ? itemsOwner : itemsEmployee;

  return (
    <Sidebar>
      <div className="flex items-center justify-between p-8 bg-white text-black">
        logo
      </div>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}