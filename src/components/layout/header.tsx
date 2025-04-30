'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/auth-provider';
import { LogOut, User as UserIcon, LayoutDashboard, Plane } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useFirebase } from '@/providers/firebase-provider';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const { user, loading, role, isAdmin } = useAuth();
  const { auth } = useFirebase();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect or update state handled by AuthProvider
    } catch (error) {
      console.error('Error signing out:', error);
      // Handle logout error (e.g., show toast)
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'RR';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
          <Plane className="h-6 w-6" />
          <span>RoamReady</span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <Link href="/packages" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Packages
          </Link>
          {/* Add other common links here */}

          {loading ? (
             <Skeleton className="h-9 w-20" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {role && <p className="text-xs leading-none text-primary capitalize">({role})</p>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                   <Link href={isAdmin ? "/dashboard/agent" : "/dashboard/traveler"}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                 </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
               <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                   <Link href="/auth/signup">Sign Up</Link>
                 </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
