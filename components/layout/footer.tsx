import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#F8F9FA] border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="mb-2">
              <h2 className="text-lg font-bold text-[#004D4D]">Litaria</h2>
            </Link>
            <p className="text-gray-600 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Litaria. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end space-x-6">
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-[#004D4D] text-sm transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-[#004D4D] text-sm transition-colors font-medium"
            >
              Contact
            </Link>
            <Link 
              href="/privacy" 
              className="text-gray-600 hover:text-[#004D4D] text-sm transition-colors font-medium"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-gray-600 hover:text-[#004D4D] text-sm transition-colors font-medium"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}