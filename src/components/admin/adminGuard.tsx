'use client';

import { useAdminGuard } from '@/src/hooks/useAdminGuard';
import { ShieldAlert } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isLoading, isChecking, isAuthorized, showDenied } = useAdminGuard();

  if (isLoading || (isChecking && !showDenied)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (showDenied) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">        <div className="relative bg-white p-8 shadow-2xl max-w-md w-full mx-4 animate-shake">
          <div className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="text-red-600" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              🚨 ACCESS DENIED 🚨
            </h2>
            <div className="space-y-3 text-gray-800">
              <p className="text-xl font-semibold">Nice try, buddy! 😏</p>
              <p className="text-lg">
                This area is <span className="font-bold text-red-600">ADMINS ONLY</span>
              </p>
              <p className="text-sm text-gray-600">
                You need special privileges to access this page.
              </p>
              <p className="text-xs text-gray-500 mt-4">
                Redirecting you back in 3 seconds...
              </p>
            </div>
            <div className="mt-6 text-6xl animate-bounce">🛑</div>
          </div>
        </div>

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
          }
          .animate-shake { animation: shake 0.5s ease-in-out; }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}