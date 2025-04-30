'use client';

import { PackageForm } from '@/components/packages/package-form';
import { useAuth } from '@/providers/auth-provider';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPackageById, TravelPackage } from '@/services/package-service';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

export default function EditPackagePage() {
   const { user, isAdmin, loading: authLoading } = useAuth();
   const router = useRouter();
   const params = useParams();
   const packageId = params.id as string;

    // Fetch the existing package data
    const { data: packageData, isLoading: packageLoading, error } = useQuery<TravelPackage | null>({
       queryKey: ['package', packageId],
       queryFn: () => getPackageById(packageId),
       enabled: !!packageId && isAdmin && !authLoading, // Only run if ID exists, user is admin, and auth is loaded
    });

    useEffect(() => {
      // Redirect if not an admin or still loading auth
      if (!authLoading && !isAdmin) {
        router.replace('/dashboard');
      }
      // Redirect if package fetch failed (and not loading)
       if (!packageLoading && error) {
          console.error("Failed to load package for editing:", error);
          // Optionally show a toast message
          router.replace('/dashboard/agent/packages'); // Redirect back to list
       }
       // Redirect if package exists but belongs to another agent
       if (packageData && user && packageData.agentId !== user.uid) {
          console.warn("Attempted to edit package belonging to another agent.");
          // Optionally show a toast message
          router.replace('/dashboard/agent/packages'); // Redirect back to list
       }

    }, [isAdmin, authLoading, router, packageData, packageLoading, error, user]);


    const isLoading = authLoading || packageLoading;

    if (isLoading) {
       return (
          <div className="container mx-auto py-8 px-4 md:px-8 space-y-8">
             <Skeleton className="h-8 w-1/3 mb-8" />
              <div className="max-w-3xl mx-auto space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-24" />
              </div>
          </div>
       );
    }

    if (!packageData || (user && packageData.agentId !== user.uid)) {
       // Handle cases where package not found or doesn't belong to the user
       return (
          <div className="container mx-auto p-8 text-center">
             <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
             <h2 className="text-xl font-semibold text-destructive">Package Not Found or Access Denied</h2>
             <p className="text-muted-foreground mt-2">You cannot edit this package.</p>
              <Button variant="outline" onClick={() => router.push('/dashboard/agent/packages')} className="mt-6">
                 Back to Packages
              </Button>
          </div>
       );
    }


  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Package: {packageData.destination}</h1>
       <PackageForm existingPackage={packageData} /> {/* Pass existing data to the form */}
    </div>
  );
}
