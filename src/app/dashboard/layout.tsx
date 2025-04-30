'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading || !user) {
     // You can show a loading spinner or skeleton screen here
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

  return <>{children}</>;
}
