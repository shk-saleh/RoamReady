'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookCheck, Check, X, MessageSquare, ArrowLeft } from "lucide-react";
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp
import { useToast } from '@/hooks/use-toast';
// import { updateBookingStatus } from '@/services/booking-service'; // Assume this service exists

// Mock Booking Interface (Agent's view, might include traveler info)
interface AgentBookingRequest {
   id: string; // Booking ID
   packageId: string;
   packageName: string;
   travelerId: string;
   travelerName: string; // Denormalized traveler name
   travelerEmail: string; // Denormalized traveler email
   requestDate: Timestamp | Date;
   travelDate?: Timestamp | Date;
   status: 'Pending' | 'Confirmed' | 'Cancelled'; // Agent likely sees only these initially
   price: number; // Proposed price
   notes?: string; // Optional notes from traveler
}

// Mock Function to fetch booking requests for the current agent
async function getAgentBookingRequests(agentId: string): Promise<AgentBookingRequest[]> {
   console.log("Fetching booking requests for agent:", agentId);
   // In Firestore, query 'bookings' where('agentId', '==', agentId) and where('status', '==', 'Pending')
   await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate loading

   const now = new Date();
   const futureDate1 = new Date(); futureDate1.setMonth(now.getMonth() + 1);
   const futureDate2 = new Date(); futureDate2.setMonth(now.getMonth() + 2);

    if (agentId === 'agent123') { // Simulate requests for a specific agent
        return [
           { id: 'req201', packageId: 'pkgA', packageName: 'Alpine Adventure', travelerId: 'travelerABC', travelerName: 'Alice Wonderland', travelerEmail: 'alice@example.com', requestDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), travelDate: futureDate1, status: 'Pending', price: 1199, notes: 'Interested in the scenic train ride option.' },
           { id: 'req202', packageId: 'customXYZ', packageName: 'Custom Italy Trip', travelerId: 'travelerDEF', travelerName: 'Bob The Builder', travelerEmail: 'bob@example.com', requestDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), travelDate: futureDate2, status: 'Pending', price: 4500, notes: 'Focus on food and wine.' },
        ];
    }
     if (agentId === 'agent456') {
         return [
             { id: 'req203', packageId: 'pkgB', packageName: 'Tropical Bliss', travelerId: 'travelerGHI', travelerName: 'Charlie Chaplin', travelerEmail: 'charlie@example.com', requestDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), status: 'Pending', price: 1599 },
         ];
     }
    return []; // Default to no requests
}

// Mock Function to update booking status - replace with actual Firebase update
async function updateBookingStatus(bookingId: string, newStatus: 'Confirmed' | 'Cancelled'): Promise<void> {
    console.log(`Updating booking ${bookingId} to ${newStatus}`);
    // In Firestore: await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate update delay
     // Simulate potential error
     // if (bookingId === 'req201') throw new Error("Simulated update error");
}


// Helper to format date/timestamp
const formatDate = (date: Timestamp | Date | undefined): string => {
   if (!date) return 'N/A';
   const d = date instanceof Date ? date : date.toDate();
   return d.toLocaleDateString();
};


export default function AgentBookingsPage() {
   const { user, isAdmin, loading: authLoading } = useAuth();
   const router = useRouter();
   const queryClient = useQueryClient();
   const { toast } = useToast();
   const [updatingStatus, setUpdatingStatus] = useState<string | null>(null); // Track which booking is being updated


   // Fetch booking requests for the current agent
   const { data: requests, isLoading: requestsLoading, error } = useQuery<AgentBookingRequest[]>({
       queryKey: ['agentBookingRequests', user?.uid],
       // Use a specific ID like 'agent123' for testing without real auth
       queryFn: () => getAgentBookingRequests(user?.uid || 'agent123'),
       enabled: !!user && isAdmin && !authLoading,
   });

    const updateStatusMutation = useMutation({
       mutationFn: (data: { bookingId: string; status: 'Confirmed' | 'Cancelled' }) =>
           updateBookingStatus(data.bookingId, data.status),
       onMutate: ({ bookingId }) => {
           setUpdatingStatus(bookingId);
       },
       onSuccess: (_, { bookingId, status }) => {
           toast({ title: `Booking ${status}`, description: `The booking request has been ${status.toLowerCase()}.` });
           // Invalidate and refetch the booking requests
           queryClient.invalidateQueries({ queryKey: ['agentBookingRequests', user?.uid] });
            // Optional: You might also need to update related queries if you show counts elsewhere
       },
       onError: (error: any, { bookingId, status }) => {
           console.error(`Error updating booking ${bookingId} to ${status}:`, error);
           toast({ variant: "destructive", title: "Update Failed", description: error.message || "Could not update the booking status." });
       },
       onSettled: () => {
           setUpdatingStatus(null); // Clear updating state
       }
   });

   const handleUpdateStatus = (bookingId: string, status: 'Confirmed' | 'Cancelled') => {
       updateStatusMutation.mutate({ bookingId, status });
   };


   const isLoading = authLoading || requestsLoading;

    if (!authLoading && !isAdmin) {
        return <div className="container mx-auto p-8 text-center text-destructive">Access Denied.</div>;
    }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
       <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
         <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
       </Button>

      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookCheck className="h-7 w-7" /> Booking Requests
        </h1>
        {/* Optional: Tabs for Pending/Confirmed/All */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Review and manage incoming booking requests from travelers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-2">
               {[...Array(3)].map((_, i) => ( <Skeleton key={i} className="h-16 w-full" /> ))}
             </div>
          ) : error ? (
              <p className="text-center text-destructive py-8">Failed to load booking requests. Please try again.</p>
          ) : requests && requests.length > 0 ? (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Traveler</TableHead>
                   <TableHead>Package</TableHead>
                   <TableHead className="hidden md:table-cell">Request Date</TableHead>
                   <TableHead className="hidden lg:table-cell">Travel Date</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {requests.map((req) => (
                   <TableRow key={req.id}>
                     <TableCell>
                        <div className="font-medium">{req.travelerName}</div>
                        <div className="text-xs text-muted-foreground">{req.travelerEmail}</div>
                     </TableCell>
                     <TableCell>
                         {/* Link to package details */}
                         <Link href={`/packages/${req.packageId}`} className="hover:underline">
                            {req.packageName}
                         </Link>
                         <div className="text-xs text-muted-foreground">${req.price.toLocaleString()}</div>
                     </TableCell>
                     <TableCell className="hidden md:table-cell">{formatDate(req.requestDate)}</TableCell>
                     <TableCell className="hidden lg:table-cell">{formatDate(req.travelDate)}</TableCell>
                     <TableCell className="text-right space-x-1">
                         <Button
                             variant="ghost"
                             size="icon"
                             className="text-primary hover:text-primary hover:bg-primary/10"
                             onClick={() => handleUpdateStatus(req.id, 'Confirmed')}
                             disabled={updatingStatus === req.id}
                             title="Confirm Booking"
                          >
                             {updatingStatus === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />}
                             <span className="sr-only">Confirm</span>
                         </Button>
                         <Button
                             variant="ghost"
                             size="icon"
                             className="text-destructive hover:text-destructive hover:bg-destructive/10"
                             onClick={() => handleUpdateStatus(req.id, 'Cancelled')}
                             disabled={updatingStatus === req.id}
                             title="Cancel Booking"
                          >
                             {updatingStatus === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4" />}
                              <span className="sr-only">Cancel</span>
                         </Button>
                         <Button
                             variant="ghost"
                             size="icon"
                             className="text-muted-foreground hover:text-foreground"
                             asChild
                             title="Chat with Traveler"
                          >
                              <Link href={`/chat?travelerId=${req.travelerId}&bookingId=${req.id}`}>
                                 <MessageSquare className="h-4 w-4" />
                                  <span className="sr-only">Chat</span>
                              </Link>
                         </Button>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          ) : (
             <p className="text-center text-muted-foreground py-16">No pending booking requests.</p>
          )}
        </CardContent>
         {requests && requests.length > 0 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>{requests.length}</strong> pending request(s).
              </div>
              {/* TODO: Add pagination if list can be long */}
            </CardFooter>
         )}
      </Card>
    </div>
  );
}
