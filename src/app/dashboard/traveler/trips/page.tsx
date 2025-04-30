'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CalendarDays, PlaneTakeoff } from "lucide-react";
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import Link from "next/link";

// TODO: Fetch actual trip data based on confirmed bookings

const upcomingTrips = [
  { id: 'trip1', destination: 'Paris Getaway', date: '2024-09-15', bookingId: 'book101' },
];
const pastTrips = [
   { id: 'trip2', destination: 'Bali Retreat', date: '2024-05-10', bookingId: 'book102' },
   { id: 'trip3', destination: 'Tokyo Adventure', date: '2024-01-20', bookingId: 'book104' }, // Assuming book104 was completed/cancelled
];


export default function TravelerTripsPage() {
   const { user, role, loading: authLoading } = useAuth();
   const router = useRouter();

    if (!authLoading && role !== 'traveler') {
        return <div className="container mx-auto p-8 text-center text-destructive">Access Denied.</div>;
    }
     if (authLoading) {
         return <div className="container mx-auto p-8 text-center">Loading trips...</div>;
     }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
           <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Button>

      <h1 className="text-3xl font-bold tracking-tight mb-8 flex items-center gap-2">
         <PlaneTakeoff className="h-7 w-7"/> My Trips
      </h1>

       <Tabs defaultValue="upcoming" className="w-full">
         <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
           <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
           <TabsTrigger value="past">Past</TabsTrigger>
         </TabsList>
         <TabsContent value="upcoming" className="mt-6">
           <Card>
             <CardHeader>
               <CardTitle>Upcoming Adventures</CardTitle>
               <CardDescription>Your scheduled trips.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               {upcomingTrips.length > 0 ? (
                 upcomingTrips.map(trip => (
                   <div key={trip.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-md bg-secondary/30">
                     <div>
                       <p className="font-semibold">{trip.destination}</p>
                       <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-4 w-4"/> Departs: {trip.date}
                       </p>
                     </div>
                      <Button variant="outline" size="sm" asChild className="mt-2 sm:mt-0">
                         {/* Link to booking details or package page */}
                         <Link href={`/dashboard/traveler/bookings`}>View Booking</Link>
                      </Button>
                   </div>
                 ))
               ) : (
                 <p className="text-muted-foreground text-center py-4">No upcoming trips planned.</p>
               )}
             </CardContent>
           </Card>
         </TabsContent>
         <TabsContent value="past" className="mt-6">
            <Card>
             <CardHeader>
               <CardTitle>Past Journeys</CardTitle>
               <CardDescription>Memories from your previous travels.</CardDescription>
             </CardHeader>
              <CardContent className="space-y-4">
               {pastTrips.length > 0 ? (
                 pastTrips.map(trip => (
                   <div key={trip.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-md bg-muted/50">
                     <div>
                       <p className="font-semibold">{trip.destination}</p>
                       <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-4 w-4"/> Traveled: {trip.date}
                       </p>
                     </div>
                      <Button variant="outline" size="sm" asChild className="mt-2 sm:mt-0">
                         <Link href={`/dashboard/traveler/bookings`}>View Booking</Link>
                      </Button>
                   </div>
                 ))
               ) : (
                 <p className="text-muted-foreground text-center py-4">No past trip history found.</p>
               )}
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
    </div>
  );
}
