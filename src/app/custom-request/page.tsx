'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/providers/auth-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Loader2, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// TODO: Connect this form to a backend function (e.g., Firebase Function or API route)
// that creates a request record and potentially initiates a chat with an agent.


const requestSchema = z.object({
  destination: z.string().min(2, { message: 'Please enter a destination.' }),
  departureDate: z.date().optional(),
  duration: z.number().positive({ message: 'Duration must be a positive number.' }).optional(),
  budget: z.number().positive({ message: 'Budget must be a positive number.' }).optional(),
  travelers: z.number().int().min(1, { message: 'Must have at least 1 traveler.' }).optional(),
  preferences: z.string().min(10, { message: 'Please describe your preferences (at least 10 characters).' }),
  contactEmail: z.string().email(), // Pre-fill if logged in
});

type RequestFormValues = z.infer<typeof requestSchema>;

export default function CustomRequestPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill based on query params (e.g., from package page)
  const initialPackageId = searchParams.get('packageId');
  // TODO: Fetch package details if initialPackageId exists to pre-fill form

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      destination: '',
      // departureDate: undefined,
      // duration: undefined,
      // budget: undefined,
      // travelers: 1,
      preferences: '',
      contactEmail: user?.email || '', // Pre-fill email if user is logged in
    },
  });

   // Update email if user logs in after page load
   useState(() => {
      if (user && !form.getValues('contactEmail')) {
         form.setValue('contactEmail', user.email || '');
      }
   });


  const onSubmit = async (data: RequestFormValues) => {
    if (!user) {
      // Redirect to login if not logged in, preserving form data might be complex
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to submit a custom request." });
      router.push('/auth/login?redirect=/custom-request'); // Simple redirect
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting custom request:', data);

    // --- TODO: Backend Integration ---
    // 1. Send data to a Firebase Function or API endpoint.
    // 2. The backend should:
    //    - Create a 'customRequests' record in Firestore.
    //    - Assign the request to an agent (or put it in a queue).
    //    - Optionally, create a chat document between user and assigned agent.
    //    - Send a notification (email/in-app) to the agent.

    try {
       // Simulate API call
       await new Promise(resolve => setTimeout(resolve, 1500));

       toast({ title: "Request Submitted!", description: "An agent will review your request and contact you soon." });
       // Redirect to traveler dashboard or a confirmation page
       router.push('/dashboard/traveler');

    } catch (error) {
       console.error('Error submitting custom request:', error);
       toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit your request. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Request a Custom Travel Plan</CardTitle>
          <CardDescription>Tell us your dream trip, and we'll make it happen!</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination(s)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Italy, Japan" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                      control={form.control}
                      name="departureDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                           <FormLabel>Approx. Departure Date</FormLabel>
                           <Popover>
                             <PopoverTrigger asChild>
                               <FormControl>
                                 <Button
                                   variant={"outline"}
                                   className={cn(
                                     "w-full pl-3 text-left font-normal",
                                     !field.value && "text-muted-foreground"
                                   )}
                                    disabled={isSubmitting}
                                 >
                                   {field.value ? (
                                     format(field.value, "PPP")
                                   ) : (
                                     <span>Pick a date</span>
                                   )}
                                   <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                 </Button>
                               </FormControl>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-0" align="start">
                               <Calendar
                                 mode="single"
                                 selected={field.value}
                                 onSelect={field.onChange}
                                 disabled={(date) =>
                                   date < new Date(new Date().setHours(0,0,0,0)) // Disable past dates
                                 }
                                 initialFocus
                               />
                             </PopoverContent>
                           </Popover>
                           <FormMessage />
                         </FormItem>
                      )}
                    />
                   <FormField
                     control={form.control}
                     name="duration"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Duration (Days)</FormLabel>
                         <FormControl>
                           <Input type="number" placeholder="e.g., 10" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} disabled={isSubmitting} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="budget"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Approx. Budget (USD per person)</FormLabel>
                         <FormControl>
                           <Input type="number" placeholder="e.g., 3000" {...field} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} disabled={isSubmitting} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="travelers"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Number of Travelers</FormLabel>
                         <FormControl>
                           <Input type="number" min="1" placeholder="e.g., 2" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} disabled={isSubmitting}/>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="contactEmail"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Contact Email</FormLabel>
                         <FormControl>
                           <Input type="email" placeholder="your.email@example.com" {...field} disabled={isSubmitting || !!user} />
                         </FormControl>
                          <FormDescription>
                            We'll use this email to contact you.
                          </FormDescription>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
               </div>

               <FormField
                 control={form.control}
                 name="preferences"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Preferences & Interests</FormLabel>
                     <FormControl>
                       <Textarea
                         placeholder="Tell us about your travel style, must-see places, activities you enjoy, accommodation preferences, etc."
                         className="min-h-[100px]"
                         {...field}
                          disabled={isSubmitting}
                       />
                     </FormControl>
                      <FormDescription>
                         The more details you provide, the better we can tailor your plan.
                      </FormDescription>
                     <FormMessage />
                   </FormItem>
                 )}
               />

              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || loading}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
