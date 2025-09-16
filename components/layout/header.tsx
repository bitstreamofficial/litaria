'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, LogOut, PenTool, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-[#004D4D]">Litaria</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-[#004D4D] transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              href="/categories" 
              className="text-gray-700 hover:text-[#004D4D] transition-colors font-medium"
            >
              Categories
            </Link>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="border-[#004D4D] text-[#004D4D] hover:bg-[#004D4D] hover:text-white">
                    <PenTool className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Welcome, {session.user?.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-gray-700 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-[#004D4D]">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-[#004D4D] hover:bg-[#003333] text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-[#004D4D]"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Navigation Links */}
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-700 hover:text-[#004D4D] hover:bg-gray-50 rounded-md font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/categories" 
                className="block px-3 py-2 text-gray-700 hover:text-[#004D4D] hover:bg-gray-50 rounded-md font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              
              {/* Mobile Auth Section */}
              {session ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="block px-3 py-2 text-gray-700 hover:text-[#004D4D] hover:bg-gray-50 rounded-md font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Welcome, {session.user?.name}
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-[#004D4D]">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#004D4D] hover:bg-[#003333] text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}