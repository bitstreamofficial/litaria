'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { Header } from './header';
import { LanguageAwareHeader } from './language-aware-header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on dashboard pages
  if (pathname.startsWith('/dashboard')) {
    return null;
  }
  
  return (
    <Suspense fallback={<Header />}>
      <LanguageAwareHeader />
    </Suspense>
  );
}