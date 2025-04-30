'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, DollarSign, Info, MapPin, MessageSquare, User, Loader2, ArrowLeft, Star } from 'lucide-react';
import { getPackages, TravelPackage } from '@/services/package-service'; // Assuming service exists
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';


// Mock function to get agent info - replace with actual API call
const getAgentInfo = async (agentId: string) => {
   // Simulating API call
   await new Promise(resolve => setTimeout(resolve, 500));
   if (agentId === 'agent123') {
     return { name: 'Alice Agent', avatarUrl: 'https://picsum.photos/seed/alice/100/100', rating: 4.8 };
   }
   if (agentId === 'agent456') {
      return { name: 'Bob Broker', avatarUrl: 'https://picsum.photos/seed/bob/100/100', rating: 4.5 };
   }
   return { name: 'Unknown Agent', avatarUrl: '', rating: 0 };
};


export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const packageId = params.id as string;

  // Fetch package details using React Query
   const { data: pkg, isLoading: packageLoading, error: packageError } = useQuery<TravelPackage | null>({
      queryKey: ['package', packageId],
      queryFn: async () => {
         // In a real app, you'd fetch a SINGLE package by ID
         const allPackages = await getPackages();
         const foundPackage = allPackages.find(p => p.id === packageId);
         return foundPackage || null;
      },
       enabled: !!packageId, // Only run query if packageId exists
   });

   // Fetch agent details - depends on package details being loaded first
   const { data: agentInfo, isLoading: agentLoading } = useQuery({
      queryKey: ['agent', pkg?.agentId],
      queryFn: () => getAgentInfo(pkg!.agentId),
      enabled: !!pkg?.agentId, // Only run if package and agentId exist
   });


  const isLoading = authLoading || packageLoading || (pkg?.agentId && agentLoading);

  const handleBookNow = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/packages/${packageId}`);
    } else {
      // Navigate to booking page or open booking modal
      console.log('Navigate to booking page for package:', packageId);
       router.push(`/booking/${packageId}`); // Example booking route
    }
  };

  const handleChatWithAgent = () => {
     if (!user) {
       router.push(`/auth/login?redirect=/packages/${packageId}`);
     } else {
       // Navigate to chat page or open chat modal
       console.log('Initiate chat with agent:', agentInfo?.name);
       router.push(`/chat?agentId=${pkg?.agentId}&packageId=${packageId}`); // Example chat route
     }
   };

   if (isLoading) {
     return (
       <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[calc(100vh-8rem)]">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
     );
   }

   if (packageError || !pkg) {
      return (
        <div className="container mx-auto p-4 md:p-8 text-center">
           <h2 className="text-2xl font-semibold text-destructive mb-4">Package Not Found</h2>
           <p className="text-muted-foreground mb-6">
              {packageError ? 'There was an error loading the package details.' : 'The package you are looking for does not exist or may have been removed.'}
           </p>
           <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4"/> Go Back
           </Button>
        </div>
      );
   }

   const getInitials = (name?: string | null) => {
      if (!name) return 'AG';
      const names = name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
    };


  return (
    <div className="container mx-auto p-4 md:p-8">
       <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
         <ArrowLeft className="mr-2 h-4 w-4"/> Back to Packages
       </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image and Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
             <Image
               src={pkg.imageUrl || `https://picsum.photos/seed/${pkg.id}/1200/800`}
               alt={pkg.destination}
               width={1200}
               height={800}
               className="w-full h-64 md:h-96 object-cover"
               priority // Prioritize loading the main image
             />
             <CardHeader>
                <CardTitle className="text-3xl font-bold">{pkg.destination}</CardTitle>
                 <CardDescription className="text-lg text-muted-foreground">{pkg.type} Experience</CardDescription>
             </CardHeader>
             <CardContent className="grid grid-cols-2 gap-4 text-sm">
               <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <span>{pkg.duration} Days</span>
               </div>
                <div className="flex items-center gap-2">
                   <DollarSign className="h-5 w-5 text-primary" />
                   <span>${pkg.price.toLocaleString()} per person</span>
                </div>
                {/* Add more icons/info like location if available */}
                {/* <div className="flex items-center gap-2">
                   <MapPin className="h-5 w-5 text-primary" />
                   <span>Specific Location (if available)</span>
                </div> */}
             </CardContent>
          </Card>

           {/* Itinerary Section */}
           <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Itinerary</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-foreground/90">
                 {/* Render itinerary - ideally format this nicely (e.g., markdown or list) */}
                 <p>{pkg.itinerary || 'Detailed itinerary information is not available for this package.'}</p>
                 {/* Example of how you might render day-by-day if structured data */}
                 {/*
                 <ul>
                   <li><strong>Day 1:</strong> Arrival and City Tour</li>
                   <li><strong>Day 2:</strong> Museum Visits</li>
                   ...
                 </ul>
                 */}
              </CardContent>
           </Card>

        </div>

        {/* Right Column: Agent Info and Actions */}
        <div className="space-y-6">
           {/* Agent Info Card */}
           {agentInfo && (
              <Card>
                 <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><User className="h-5 w-5"/> Your Travel Agent</CardTitle>
                 </CardHeader>
                 <CardContent className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-20 w-20">
                       <AvatarImage src={agentInfo.avatarUrl || undefined} alt={agentInfo.name} />
                       <AvatarFallback>{getInitials(agentInfo.name)}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{agentInfo.name}</p>
                     {agentInfo.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                           <Star className="h-4 w-4 fill-yellow-400 text-yellow-500"/>
                           <span>{agentInfo.rating.toFixed(1)} Agent Rating</span>
                         </div>
                     )}
                     <Button variant="outline" size="sm" className="w-full" onClick={handleChatWithAgent} disabled={authLoading}>
                         <MessageSquare className="mr-2 h-4 w-4" /> Chat with Agent
                     </Button>
                 </CardContent>
              </Card>
           )}

          {/* Booking/Action Card */}
          <Card className="sticky top-24"> {/* Make booking card sticky */}
             <CardHeader>
                <CardTitle className="text-xl">Ready to Book?</CardTitle>
                <CardDescription>Starting from ${pkg.price.toLocaleString()}</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <Button size="lg" className="w-full" onClick={handleBookNow} disabled={authLoading}>
                 {authLoading ? 'Loading...' : user ? 'Book Now' : 'Log in to Book'}
               </Button>
               <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/custom-request?packageId=${pkg.id}`}>Request Custom Plan</Link>
               </Button>
                {/* Optional: Add to Wishlist */}
                {/* <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary"> <Heart className="mr-2 h-4 w-4" /> Add to Wishlist </Button> */}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
