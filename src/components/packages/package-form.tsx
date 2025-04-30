'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from 'lucide-react';
import type { TravelPackage } from '@/services/package-service';
import { createPackage, updatePackage } from '@/services/package-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// Import storage functions if handling image uploads directly
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { useFirebase } from '@/providers/firebase-provider';


// Schema for package form validation
const packageSchema = z.object({
  destination: z.string().min(3, { message: 'Destination must be at least 3 characters.' }),
  type: z.string().min(2, { message: 'Please select or enter a package type.' }),
  duration: z.coerce.number().int().positive({ message: 'Duration must be a positive number of days.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  budget: z.coerce.number().positive({ message: 'Budget must be a positive number.' }).optional(), // Make budget optional
  itinerary: z.string().min(20, { message: 'Itinerary details must be at least 20 characters.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }).optional(), // Initially optional, handle upload later
   // Consider adding image file upload validation if implementing direct upload
   // imageFile: z.instanceof(File).optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

interface PackageFormProps {
  existingPackage?: TravelPackage; // Optional prop for editing
}

// Mock types for selection - replace or fetch dynamically
const packageTypes = ['City Tour', 'Relaxation', 'Adventure', 'Cultural', 'Beach', 'Mountains'];


export function PackageForm({ existingPackage }: PackageFormProps) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  // const { storage } = useFirebase(); // Uncomment if using direct image upload
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [imageFile, setImageFile] = useState<File | null>(null); // State for image file upload


  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      destination: existingPackage?.destination || '',
      type: existingPackage?.type || '',
      duration: existingPackage?.duration || undefined,
      price: existingPackage?.price || undefined,
      budget: existingPackage?.budget || undefined,
      itinerary: existingPackage?.itinerary || '',
      imageUrl: existingPackage?.imageUrl || '',
    },
  });

   // --- Mutations for Creating/Updating ---
   const createMutation = useMutation({
      mutationFn: createPackage,
      onSuccess: (newPackageId) => {
         toast({ title: "Package Created", description: "The new package has been added successfully." });
         queryClient.invalidateQueries({ queryKey: ['agentPackages', user?.uid] }); // Refetch agent's packages
         router.push('/dashboard/agent/packages'); // Redirect to package list
      },
      onError: (error: any) => {
         console.error("Error creating package:", error);
         toast({ variant: "destructive", title: "Creation Failed", description: error.message || "Could not create the package." });
      },
      onSettled: () => setIsSubmitting(false),
    });

   const updateMutation = useMutation({
      mutationFn: (data: { packageId: string; packageData: Partial<TravelPackage> }) =>
         updatePackage(data.packageId, data.packageData),
      onSuccess: () => {
         toast({ title: "Package Updated", description: "The package has been updated successfully." });
         queryClient.invalidateQueries({ queryKey: ['agentPackages', user?.uid] }); // Refetch agent's packages
         queryClient.invalidateQueries({ queryKey: ['package', existingPackage?.id] }); // Refetch this specific package
         router.push('/dashboard/agent/packages'); // Redirect to package list
      },
      onError: (error: any) => {
         console.error("Error updating package:", error);
         toast({ variant: "destructive", title: "Update Failed", description: error.message || "Could not update the package." });
      },
       onSettled: () => setIsSubmitting(false),
    });


  // Handler for image file selection (if implementing direct upload)
   // const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
   //    if (event.target.files && event.target.files[0]) {
   //       setImageFile(event.target.files[0]);
   //       // Optional: Preview image
   //    }
   // };

   // Function to upload image (if implementing direct upload)
   // const uploadImage = async (): Promise<string | undefined> => {
   //    if (!imageFile || !user) return existingPackage?.imageUrl; // Return existing URL if no new file or user

   //    const storageRef = ref(storage, `package_images/${user.uid}/${Date.now()}_${imageFile.name}`);
   //    try {
   //       const snapshot = await uploadBytes(storageRef, imageFile);
   //       const downloadURL = await getDownloadURL(snapshot.ref);
   //       return downloadURL;
   //    } catch (error) {
   //       console.error("Image upload error:", error);
   //       toast({ variant: "destructive", title: "Image Upload Failed", description: "Could not upload the package image." });
   //       throw error; // Re-throw to stop form submission
   //    }
   // };


  const onSubmit = async (data: PackageFormValues) => {
    if (!user || !isAdmin) {
      toast({ variant: "destructive", title: "Unauthorized", description: "You must be logged in as an agent." });
      return;
    }

    setIsSubmitting(true);

    try {
      // Handle image upload first if implemented
      // const uploadedImageUrl = await uploadImage();

       const packagePayload = {
         ...data,
         // imageUrl: uploadedImageUrl || data.imageUrl || `https://picsum.photos/seed/${data.destination}/600/400`, // Use uploaded, existing, or default
         imageUrl: data.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(data.destination)}/600/400`, // Use URL field or default for now
         agentId: user.uid,
         // Ensure numbers are numbers if using coerce
         duration: Number(data.duration),
         price: Number(data.price),
         budget: data.budget ? Number(data.budget) : undefined,
      };


      if (existingPackage) {
        // Update existing package
        updateMutation.mutate({ packageId: existingPackage.id, packageData: packagePayload });
      } else {
        // Create new package
        createMutation.mutate(packagePayload);
      }

    } catch (error) {
      // Error handling is mostly done within mutations, but catch prevents uncaught promise rejection
       console.error("Form submission error:", error);
        setIsSubmitting(false); // Ensure loading state is reset on direct upload failure
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardHeader>
             {/* Title changes based on add/edit mode */}
             <CardTitle>{existingPackage ? 'Edit Package Details' : 'Enter Package Details'}</CardTitle>
             <CardDescription>Provide the information for the travel package.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Romantic Paris Getaway" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select a type" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           {packageTypes.map(type => (
                             <SelectItem key={type} value={type}>{type}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
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
                        <Input type="number" placeholder="e.g., 7" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                 control={form.control}
                 name="price"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Price (USD)</FormLabel>
                     <FormControl>
                       <Input type="number" step="0.01" placeholder="e.g., 1999.99" {...field} disabled={isSubmitting} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
                 {/* Optional Budget Field */}
                 <FormField
                     control={form.control}
                     name="budget"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Estimated Budget (Optional)</FormLabel>
                         <FormControl>
                           <Input type="number" step="1" placeholder="e.g., 2500" {...field} disabled={isSubmitting} />
                         </FormControl>
                          <FormDescription>Rough estimate for traveler planning.</FormDescription>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
            </div>

             <FormField
               control={form.control}
               name="imageUrl"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Image URL</FormLabel>
                   <FormControl>
                     <Input placeholder="https://example.com/image.jpg" {...field} disabled={isSubmitting} />
                   </FormControl>
                    <FormDescription>Enter a URL for the package's main image.</FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />
              {/* Alternate Image Upload Field (if implementing direct upload) */}
             {/* <FormField
                 control={form.control}
                 name="imageFile" // Use a different name if needed
                 render={({ field }) => ( // Use field only for error reporting, handle value via state
                   <FormItem>
                     <FormLabel>Upload Image</FormLabel>
                     <FormControl>
                        <div className="flex items-center gap-2">
                           <Input
                              id="imageFile"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="flex-grow"
                              disabled={isSubmitting}
                            />
                           <Button type="button" variant="outline" size="icon" disabled><Upload className="h-4 w-4"/></Button>
                         </div>
                      </FormControl>
                       {imageFile && <p className="text-sm text-muted-foreground mt-1">Selected: {imageFile.name}</p>}
                       {existingPackage?.imageUrl && !imageFile && <p className="text-sm text-muted-foreground mt-1">Current image: <a href={existingPackage.imageUrl} target="_blank" rel="noreferrer" className="underline">View</a></p>}
                      <FormDescription>Upload an image for the package (or provide URL above).</FormDescription>
                     <FormMessage />
                   </FormItem>
                 )}
               /> */}


            <FormField
              control={form.control}
              name="itinerary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Itinerary Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the day-by-day plan, included activities, highlights, etc."
                      className="min-h-[150px]"
                      {...field}
                       disabled={isSubmitting}
                    />
                  </FormControl>
                   <FormDescription>Use Markdown for basic formatting if needed.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || authLoading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingPackage ? 'Save Changes' : 'Create Package'}
            </Button>
             {/* Optional: Add a cancel button */}
             <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting} className="ml-2">
                Cancel
             </Button>

          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
