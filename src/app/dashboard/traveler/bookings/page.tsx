'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { History, ArrowLeft } from "lucide-react";
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp

// Mock Booking Interface (replace with actual interface based on Firestore structure)
interface Booking {
   id: string;
   packageId: string;
   packageName: string; // Denormalized for easier display
   bookingDate: Timestamp | Date; // Use Timestamp from Firestore or Date
   travelDate?: Timestamp | Date; // Optional travel date
   status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
   pricePaid: number;
   agentId: string;
}

// Mock Function to fetch bookings for the current traveler
async function getTravelerBookings(travelerId: string): Promise<Booking[]> {
   console.log("Fetching bookings for traveler:", travelerId);
   // In a real Firestore scenario, query the 'bookings' collection where('travelerId', '==', travelerId)
   await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
   // Mock data - replace with actual Firestore query result
   const now = new Date();
   const pastDate = new Date(); pastDate.setMonth(now.getMonth() - 2);
   const futureDate = new Date(); futureDate.setMonth(now.getMonth() + 1);

    if (travelerId === 'mockTravelerId1') { // Simulate a specific user having bookings
        return [
           { id: 'book101', packageId: 'pkgX', packageName: 'Parisian Dream', bookingDate: pastDate, travelDate: futureDate, status: 'Confirmed', pricePaid: 1999, agentId: 'agent123' },
           { id: 'book102', packageId: 'pkgY', packageName: 'Bali Escape', bookingDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), travelDate: pastDate, status: 'Completed', pricePaid: 1450, agentId: 'agent456' },
           { id: 'book103', packageId: 'pkgZ', packageName: 'Mountain Trek', bookingDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), status: 'Pending', pricePaid: 999, agentId: 'agent123' },
           { id: 'book104', packageId: 'pkgW', packageName: 'City Hopper', bookingDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), status: 'Cancelled', pricePaid: 750, agentId: 'agent456' },
        ];
    }
    return []; // Default to no bookings for other users
}

// Helper to format date/timestamp
const formatDate = (date: Timestamp | Date | undefined): string => {
   if (!date) return 'N/A';
   const d = date instanceof Date ? date : date.toDate();
   return d.toLocaleDateString();
};

// Helper to determine Badge variant based on status
const getStatusVariant = (status: Booking['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Confirmed': return 'default'; // Use primary color
        case 'Completed': return 'secondary';
        case 'Pending': return 'outline';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
};


export default function TravelerBookingsPage() {
   const { user, role, loading: authLoading } = useAuth();
   const router = useRouter();

   // Fetch bookings for the current traveler
   const { data: bookings, isLoading: bookingsLoading, error } = useQuery<Booking[]>({
       queryKey: ['travelerBookings', user?.uid],
       // Use a more specific ID like 'mockTravelerId1' for testing without real auth
       queryFn: () => getTravelerBookings(user?.uid || 'mockTravelerId1'),
       enabled: !!user && role === 'traveler' && !authLoading, // Only run if user is a traveler and loaded
   });

   const isLoading = authLoading || bookingsLoading;

    if (!authLoading && role !== 'traveler') {
        // Handle unauthorized access
        return <div className="container mx-auto p-8 text-center text-destructive">Access Denied.</div>;
    }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
       <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
         <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
       </Button>

      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-7 w-7" /> My Booking History
        </h1>
        {/* Optional: Add filtering/sorting options */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
          <CardDescription>
            Review details of your past and upcoming trips booked through RoamReady.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-2">
               {[...Array(5)].map((_, i) => ( <Skeleton key={i} className="h-12 w-full" /> ))}
             </div>
          ) : error ? (
              <p className="text-center text-destructive py-8">Failed to load your booking history. Please try again later.</p>
          ) : bookings && bookings.length > 0 ? (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Package Name</TableHead>
                   <TableHead>Booking Date</TableHead>
                   <TableHead className="hidden sm:table-cell">Travel Date</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="text-right">Price Paid</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {bookings.map((booking) => (
                   <TableRow key={booking.id}>
                     <TableCell className="font-medium">
                        {/* Link to package details if possible */}
                        <Link href={`/packages/${booking.packageId}`} className="hover:underline">
                            {booking.packageName}
                        </Link>
                     </TableCell>
                     <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                     <TableCell className="hidden sm:table-cell">{formatDate(booking.travelDate)}</TableCell>
                     <TableCell>
                       <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                     </TableCell>
                     <TableCell className="text-right">${booking.pricePaid.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                         {/* Add relevant actions like 'View Details', 'Contact Agent' */}
                         <Button variant="ghost" size="sm" asChild>
                            <Link href={`/chat?agentId=${booking.agentId}&bookingId=${booking.id}`}>
                                Contact Agent
                            </Link>
                         </Button>
                         {/* Add View Booking Details button if a separate details page exists */}
                         {/* <Button variant="outline" size="sm">Details</Button> */}
                      </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          ) : (
             <div className="text-center text-muted-foreground py-16 space-y-4">
                 <p>You haven't booked any trips yet.</p>
                 <Button asChild>
                     <Link href="/packages">Explore Packages</Link>
                 </Button>
             </div>
          )}
        </CardContent>
        {bookings && bookings.length > 0 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Displaying <strong>{bookings.length}</strong> booking(s).
              </div>
              {/* TODO: Add pagination if list can be long */}
            </CardFooter>
         )}
      </Card>
    </div>
  );
}
