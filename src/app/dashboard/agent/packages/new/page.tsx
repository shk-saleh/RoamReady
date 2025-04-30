'use client';

import { PackageForm } from '@/components/packages/package-form';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewPackagePage() {
   const { isAdmin, loading } = useAuth();
   const router = useRouter();

   useEffect(() => {
     if (!loading && !isAdmin) {
       router.replace('/dashboard'); // Redirect if not an admin
     }
   }, [isAdmin, loading, router]);

   if (loading || !isAdmin) {
      // Optional: Show loading or unauthorized state
      return <div className="container mx-auto p-8 text-center">Loading...</div>;
   }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Package</h1>
       <PackageForm /> {/* Use the reusable form component */}
    </div>
  );
}
