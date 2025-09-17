"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";

const sidebarItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: "📊",
  },
  {
    name: "My Posts",
    href: "/dashboard/posts",
    icon: "📝",
  },
  {
    name: "New Post",
    href: "/dashboard/posts/new",
    icon: "➕",
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: "🏷️",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white shadow-sm border-r fixed left-0 top-[73px] h-[calc(100vh-73px)] flex flex-col shrink-0 z-10">
      <nav className="pt-12 px-4 pb-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-teal-700"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Logout Button - outside scrollable area to ensure visibility */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <LogoutButton className="flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-700 w-full text-left">
          <span className="text-lg">🚪</span>
          <span className="font-medium text-sm">Sign Out</span>
        </LogoutButton>
      </div>
    </aside>
  );
}