'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { HeaderCategories } from './header-categories';
import { LanguageSwitcher } from './language-switcher';
import { SearchComponent, MobileSearch } from '@/components/ui/search';

export function LanguageAwareHeader() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentDate, setCurrentDate] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load language from URL or localStorage on mount and set current date
  useEffect(() => {
    const urlLanguage = searchParams.get('lang');
    const savedLanguage = localStorage.getItem('litaria-language') || 'en';
    const language = urlLanguage || savedLanguage;
    setCurrentLanguage(language);

    // Set current date based on language
    const now = new Date();
    let dateString = '';
    
    if (language === 'bn') {
      // Bengali date format
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      // For now, using English format - can be enhanced with Bengali calendar later
      dateString = now.toLocaleDateString('bn-BD', options);
    } else {
      // English date format
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      dateString = now.toLocaleDateString('en-US', options);
    }
    
    setCurrentDate(dateString);
  }, [searchParams]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('litaria-language', language);
    
    // Navigate to home with language parameter
    const currentPath = window.location.pathname;
    if (currentPath === '/') {
      // For home page, add language parameter
      router.push(`/?lang=${language}`);
    } else {
      // For other pages, reload to update categories
      window.location.reload();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row - Date, Logo, Search & Language */}
        <div className="flex justify-between items-center h-16">
          {/* Left - Date */}
          <div className="hidden md:block text-sm text-gray-600">
            {currentDate}
          </div>

          {/* Center - Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-[#004D4D]" style={{ fontFamily: 'Aclonica, sans-serif' }}>
              litaria
            </h1>
          </Link>

          {/* Right - Search & Language Toggle */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Search */}
            <SearchComponent />
            
            {/* Language Switcher */}
            <LanguageSwitcher 
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
            />
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

        {/* Second Row - Categories */}
        <div className="hidden md:flex justify-center pb-4">
          <HeaderCategories language={currentLanguage} />
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Date */}
              <div className="px-3 py-2 text-sm text-gray-600">
                {currentDate}
              </div>
              
              {/* Mobile Search */}
              <MobileSearch onClose={() => setIsMobileMenuOpen(false)} />
              
              {/* Language Switcher for Mobile */}
              <div className="px-3 py-2">
                <LanguageSwitcher 
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                />
              </div>

              {/* Mobile Categories */}
              <div className="px-3 py-2">
                <HeaderCategories language={currentLanguage} />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}