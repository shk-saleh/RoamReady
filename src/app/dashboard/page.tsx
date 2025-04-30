'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function DashboardRedirectPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (role === 'agent') {
        router.replace('/dashboard/agent');
      } else if (role === 'traveler') {
        router.replace('/dashboard/traveler');
      } else {
        // Not logged in or role not defined, redirect to login
        router.replace('/auth/login');
      }
    }
  }, [role, loading, router]);

  // Display a loading state while determining the role
  return (
     <div className="container mx-auto p-4 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
     </div>
   );
}
