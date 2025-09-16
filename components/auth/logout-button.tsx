"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={className || "text-gray-700 hover:text-teal-700 transition-colors"}
    >
      {isLoading ? "Signing out..." : (children || "Sign Out")}
    </button>
  );
}