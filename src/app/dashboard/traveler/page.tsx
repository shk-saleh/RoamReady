'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, History, MessageSquare } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


// Mock data - replace with actual data fetching
const upcomingTrips = [
  { id: 'trip1', destination: 'Paris Getaway', date: '2024-09-15' },
];
const bookingHistory = [
   { id: 'book1', destination: 'Bali Retreat', date: '2024-05-10', status: 'Completed' },
   { id: 'book2', destination: 'Tokyo Adventure', date: '2024-01-20', status: 'Completed' },
];
const activeChats = [
  { id: 'chat1', agentName: 'Agent Smith', lastMessage: 'Sounds good, let me check...' },
];

export default function TravelerDashboardPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not a traveler or still loading
    if (!loading && role !== 'traveler') {
       router.replace('/dashboard'); // Or redirect to login/home
    }
  }, [user, role, loading, router]);

   if (loading || role !== 'traveler') {
     // Optionally show a loading or unauthorized state
     return <div className="container mx-auto p-4 md:p-8 text-center">Loading traveler dashboard...</div>; // Simple loading
   }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.displayName || 'Traveler'}!</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
             <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {upcomingTrips.length > 0 ? (
              upcomingTrips.map(trip => (
                <div key={trip.id} className="mb-2 last:mb-0">
                  <p className="font-semibold">{trip.destination}</p>
                  <p className="text-xs text-muted-foreground">Date: {trip.date}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming trips booked.</p>
            )}
             <Button variant="link" size="sm" className="px-0 mt-2" asChild>
               <Link href="/dashboard/traveler/trips">View All Trips</Link>
             </Button>
          </CardContent>
        </Card>

        {/* Booking History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking History</CardTitle>
             <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {bookingHistory.length > 0 ? (
               bookingHistory.slice(0, 2).map(booking => ( // Show recent 2
                 <div key={booking.id} className="mb-2 last:mb-0">
                   <p className="font-semibold">{booking.destination}</p>
                   <p className="text-xs text-muted-foreground">Date: {booking.date} ({booking.status})</p>
                 </div>
               ))
             ) : (
               <p className="text-sm text-muted-foreground">No past bookings found.</p>
             )}
              <Button variant="link" size="sm" className="px-0 mt-2" asChild>
                <Link href="/dashboard/traveler/bookings">View Full History</Link>
              </Button>
          </CardContent>
        </Card>

        {/* Active Chats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {activeChats.length > 0 ? (
               activeChats.map(chat => (
                 <div key={chat.id} className="mb-2 last:mb-0">
                   <p className="font-semibold">Chat with {chat.agentName}</p>
                   <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                 </div>
               ))
             ) : (
               <p className="text-sm text-muted-foreground">No active conversations.</p>
             )}
             <Button variant="link" size="sm" className="px-0 mt-2" asChild>
               <Link href="/dashboard/traveler/chats">View All Chats</Link>
             </Button>
          </CardContent>
        </Card>
      </div>

       <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Explore & Plan</CardTitle>
              <CardDescription>Ready for your next adventure?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
               <Button asChild>
                  <Link href="/packages">Browse Packages</Link>
               </Button>
               <Button variant="outline" asChild>
                  <Link href="/custom-request">Request Custom Plan</Link>
               </Button>
            </CardContent>
          </Card>
        </div>

    </div>
  );
}
