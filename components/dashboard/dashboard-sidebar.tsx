"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
    <aside className="w-64 bg-white shadow-sm border-r min-h-[calc(100vh-73px)]">
      <nav className="p-6">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-teal-700"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}