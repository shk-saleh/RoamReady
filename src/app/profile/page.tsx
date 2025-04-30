'use client';

import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// TODO: Add functionality to update profile information (name, potentially password, avatar)

export default function ProfilePage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

   useEffect(() => {
      if (!loading && !user) {
        router.replace('/auth/login'); // Redirect if not logged in
      }
    }, [user, loading, router]);

  const getInitials = (name?: string | null) => {
    if (!name) return 'RR';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

   if (loading || !user) {
      return (
        <div className="container mx-auto p-4 md:p-8">
           <Card className="max-w-2xl mx-auto">
              <CardHeader className="items-center text-center">
                 <Skeleton className="h-24 w-24 rounded-full mb-4" />
                 <Skeleton className="h-6 w-32 mb-2" />
                 <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                 </div>
                  <div className="space-y-2">
                     <Skeleton className="h-4 w-16" />
                     <Skeleton className="h-10 w-full" />
                  </div>
                   <Skeleton className="h-10 w-24" />
              </CardContent>
           </Card>
        </div>
      );
    }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
             <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
             <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
           </Avatar>
          <CardTitle className="text-2xl">{user.displayName || 'User Profile'}</CardTitle>
           <CardDescription>Manage your account details.</CardDescription>
           {role && <p className="text-sm font-medium text-primary capitalize">Account Type: {role}</p>}
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
             <Label htmlFor="name">Full Name</Label>
             <Input id="name" value={user.displayName || ''} readOnly disabled />
              {/* TODO: Add edit functionality */}
           </div>
           <div className="space-y-2">
             <Label htmlFor="email">Email Address</Label>
             <Input id="email" type="email" value={user.email || ''} readOnly disabled />
              {/* Note: Email change usually requires re-authentication */}
           </div>
           {/* Add password change section if needed */}
           {/* <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Button variant="outline" disabled>Change Password</Button>
           </div> */}

           <Button disabled> {/* TODO: Enable when update logic is added */}
             {/* <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
              Save Changes
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
