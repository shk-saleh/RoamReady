'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Sun, MountainSnow, DollarSign, CalendarDays, Filter, Loader2 } from 'lucide-react';
import { getPackages, TravelPackage } from '@/services/package-service'; // Assuming service exists
import { useQuery } from '@tanstack/react-query';
import { Slider } from '@/components/ui/slider';
import { debounce } from 'lodash'; // Install lodash: npm install lodash @types/lodash

// Mock types for filtering - replace if getPackages provides distinct types
const packageTypes = ['All', 'City Tour', 'Relaxation', 'Adventure', 'Cultural'];

export default function PackagesPage() {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState<number | undefined>(5000); // Default max budget
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [type, setType] = useState<string>('All');

  // Debounced destination input handler
  const debouncedSetDestination = useMemo(() => debounce(setDestination, 300), []);

   // Fetch packages using React Query
   const { data: packages, isLoading, error } = useQuery<TravelPackage[]>({
       queryKey: ['packages', destination, budget, duration, type === 'All' ? undefined : type],
       queryFn: () => getPackages(
           destination || undefined,
           budget,
           duration,
           type === 'All' ? undefined : type
       ),
     // Keep previous data while loading new data for smoother experience
     // staleTime: 1000 * 60 * 1, // Cache for 1 minute
   });

   const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     debouncedSetDestination(e.target.value);
   };

   const handleBudgetChange = (value: number[]) => {
     setBudget(value[0]);
   };

    const handleDurationChange = (value: string) => {
       const num = parseInt(value);
       setDuration(isNaN(num) || num <= 0 ? undefined : num);
     };


  const getIcon = (packageType: string) => {
     switch (packageType) {
       case 'Relaxation': return <Sun className="h-5 w-5 text-accent" />;
       case 'Adventure': return <MountainSnow className="h-5 w-5 text-primary" />;
       case 'City Tour': return <MapPin className="h-5 w-5 text-secondary-foreground" />;
       default: return <MapPin className="h-5 w-5 text-muted-foreground" />;
     }
   };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Explore Travel Packages</h1>

      {/* Filters Section */}
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5"/> Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Destination Filter */}
           <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="e.g., Paris, Bali"
                onChange={handleDestinationChange}
                defaultValue={destination}
              />
            </div>

            {/* Budget Filter */}
            <div className="space-y-2">
               <Label htmlFor="budget">Max Budget (${budget?.toLocaleString() ?? 'Any'})</Label>
               <div className="flex items-center gap-2 pt-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                   <Slider
                     id="budget"
                     min={0}
                     max={10000} // Adjust max budget as needed
                     step={100}
                     value={[budget ?? 10000]}
                     onValueChange={handleBudgetChange}
                   />
                </div>
            </div>

            {/* Duration Filter */}
             <div className="space-y-2">
               <Label htmlFor="duration">Duration (Days)</Label>
               <Input
                 id="duration"
                 type="number"
                 min="1"
                 placeholder="e.g., 7"
                 value={duration ?? ''}
                 onChange={(e) => handleDurationChange(e.target.value)}
               />
             </div>

           {/* Type Filter */}
           <div className="space-y-2">
             <Label htmlFor="type">Package Type</Label>
             <Select value={type} onValueChange={setType}>
               <SelectTrigger id="type">
                 <SelectValue placeholder="Select type" />
               </SelectTrigger>
               <SelectContent>
                 {packageTypes.map(t => (
                   <SelectItem key={t} value={t}>{t}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
        </CardContent>
        {/* Optional: Add Clear Filters button */}
         {/* <CardFooter> <Button variant="outline" onClick={() => { setDestination(''); setBudget(5000); setDuration(undefined); setType('All'); }}> Clear Filters </Button> </CardFooter> */}
      </Card>

      {/* Packages Grid */}
      {isLoading ? (
         <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg text-muted-foreground">Loading packages...</span>
         </div>
      ) : error ? (
         <div className="text-center py-16 text-destructive">
            <p>Failed to load packages. Please try again later.</p>
            {/* Optionally show error details: <p className="text-sm">{error.message}</p> */}
         </div>
      ) : packages && packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg flex flex-col">
              <CardHeader className="p-0 relative">
                <Image
                  src={pkg.imageUrl || `https://picsum.photos/seed/${pkg.id}/600/400`} // Fallback image
                  alt={pkg.destination}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
                 {/* Optional: Badge for type */}
                 {/* <Badge variant="secondary" className="absolute top-2 right-2">{pkg.type}</Badge> */}
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                 <CardTitle className="text-xl font-semibold mb-2 flex items-center gap-2">
                    {getIcon(pkg.type)} {pkg.destination}
                  </CardTitle>
                <CardDescription className="text-muted-foreground mb-4 line-clamp-2">
                   {/* Placeholder for a short description if available */}
                   {pkg.duration} Days | {pkg.type} Experience
                 </CardDescription>
                 <p className="text-lg font-bold text-primary">${pkg.price.toLocaleString()}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0 mt-auto">
                <Button asChild className="w-full">
                  <Link href={`/packages/${pkg.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No packages found matching your criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
