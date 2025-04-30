'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, BookCheck, MessageSquarePlus, PlusCircle } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


// Mock data - replace with actual data fetching
const activePackages = [
  { id: 'pkgA', name: 'Alpine Adventure', bookings: 5 },
  { id: 'pkgB', name: 'Tropical Bliss', bookings: 12 },
];
const bookingRequests = [
   { id: 'req1', travelerName: 'Alice Wonderland', packageName: 'Alpine Adventure' },
   { id: 'req2', travelerName: 'Bob The Builder', packageName: 'Custom Request' },
];
const ongoingConversations = [
  { id: 'conv1', travelerName: 'Charlie Chaplin', lastMessage: 'Regarding the flight details...' },
];

export default function AgentDashboardPage() {
   const { user, role, loading } = useAuth();
   const router = useRouter();

   useEffect(() => {
     // Redirect if not an agent or still loading
     if (!loading && role !== 'agent') {
        router.replace('/dashboard'); // Or redirect to login/home
     }
   }, [user, role, loading, router]);

    if (loading || role !== 'agent') {
      // Optionally show a loading or unauthorized state
      return <div className="container mx-auto p-4 md:p-8 text-center">Loading agent dashboard...</div>; // Simple loading
    }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
         <Button asChild>
            <Link href="/dashboard/agent/packages/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Package
            </Link>
         </Button>
      </div>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Active Packages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
             <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{activePackages.length}</div>
              <p className="text-xs text-muted-foreground mb-4">
                Total packages currently offered
              </p>
             {activePackages.length > 0 ? (
               activePackages.slice(0, 2).map(pkg => ( // Show recent 2
                 <div key={pkg.id} className="mb-2 last:mb-0">
                   <p className="font-semibold">{pkg.name}</p>
                   <p className="text-xs text-muted-foreground">{pkg.bookings} current bookings</p>
                 </div>
               ))
             ) : (
               <p className="text-sm text-muted-foreground">No active packages.</p>
             )}
             <Button variant="link" size="sm" className="px-0 mt-2" asChild>
               <Link href="/dashboard/agent/packages">Manage Packages</Link>
             </Button>
          </CardContent>
        </Card>

        {/* Booking Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking Requests</CardTitle>
            <BookCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingRequests.length}</div>
            <p className="text-xs text-muted-foreground mb-4">
              Pending booking requests
            </p>
            {bookingRequests.length > 0 ? (
               bookingRequests.slice(0, 2).map(req => (
                 <div key={req.id} className="mb-2 last:mb-0">
                   <p className="font-semibold">{req.travelerName}</p>
                   <p className="text-xs text-muted-foreground">Request for: {req.packageName}</p>
                 </div>
               ))
             ) : (
               <p className="text-sm text-muted-foreground">No pending requests.</p>
             )}
              <Button variant="link" size="sm" className="px-0 mt-2" asChild>
                <Link href="/dashboard/agent/bookings">View All Requests</Link>
              </Button>
          </CardContent>
        </Card>

        {/* Ongoing Conversations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing Conversations</CardTitle>
            <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{ongoingConversations.length}</div>
              <p className="text-xs text-muted-foreground mb-4">
                 Active chats with travelers
               </p>
             {ongoingConversations.length > 0 ? (
               ongoingConversations.slice(0,1).map(conv => ( // Show 1 recent
                 <div key={conv.id} className="mb-2 last:mb-0">
                   <p className="font-semibold">Chat with {conv.travelerName}</p>
                   <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                 </div>
               ))
             ) : (
               <p className="text-sm text-muted-foreground">No active conversations.</p>
             )}
             <Button variant="link" size="sm" className="px-0 mt-2" asChild>
               <Link href="/dashboard/agent/chats">View All Chats</Link>
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
