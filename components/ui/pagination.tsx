'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl,
  className 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, window.location.origin);
    if (page > 1) {
      url.searchParams.set('page', page.toString());
    }
    return url.pathname + url.search;
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav 
      className={cn("flex justify-center items-center space-x-2", className)}
      aria-label="Pagination"
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link href={getPageUrl(currentPage - 1)}>
          <Button variant="outline" size="sm" className="flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled className="flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className="px-2 py-1 text-gray-500">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrentPage = pageNum === currentPage;

          return (
            <Link key={pageNum} href={getPageUrl(pageNum)}>
              <Button
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                className={cn(
                  "min-w-[40px]",
                  isCurrentPage && "bg-teal-700 hover:bg-teal-800"
                )}
              >
                {pageNum}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link href={getPageUrl(currentPage + 1)}>
          <Button variant="outline" size="sm" className="flex items-center">
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled className="flex items-center">
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </nav>
  );
}