import Link from 'next/link';
import { FileText } from 'lucide-react';
import { getUserIdFromToken } from '@/lib/auth';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function Header() {
  const userId = await getUserIdFromToken();
  const isLoggedIn = !!userId;

  return (
    <header className="bg-surface-bright border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 text-indigo-600">
            <FileText className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight">ResumeBuilder</span>
          </Link>
          
          <nav className="flex gap-4 items-center">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                  Dashboard
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}