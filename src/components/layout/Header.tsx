import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 text-indigo-600">
            <FileText className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight">ResumeBuilder</span>
          </Link>
          
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}