"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Litaria
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/dashboard" 
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/posts" 
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                My Posts
              </Link>
              <Link 
                href="/dashboard/posts/new" 
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                New Post
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-foreground hidden sm:block">
              Welcome, {user?.name}
            </span>
            
            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            
            <LogoutButton className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Out</span>
            </LogoutButton>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-secondary">
            <nav className="px-4 py-4 space-y-2">
              <Link 
                href="/dashboard" 
                className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/posts" 
                className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Posts
              </Link>
              <Link 
                href="/dashboard/posts/new" 
                className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                New Post
              </Link>
              <Link 
                href="/dashboard/categories" 
                className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-background rounded-md transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}