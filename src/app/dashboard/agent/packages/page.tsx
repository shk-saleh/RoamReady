'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPackages, deletePackage, TravelPackage } from '@/services/package-service'; // Assuming service includes agent-specific fetching
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


// Function to fetch packages specifically created by the current agent
async function getAgentPackages(agentId: string): Promise<TravelPackage[]> {
   // In a real Firestore scenario, you'd query where('agentId', '==', agentId)
   console.log("Fetching packages for agent:", agentId);
   const allPackages = await getPackages(); // Using generic getPackages for now
   return allPackages.filter(pkg => pkg.agentId === agentId);
}


export default function AgentPackagesPage() {
   const { user, isAdmin, loading: authLoading } = useAuth();
   const queryClient = useQueryClient();
   const { toast } = useToast();
   const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track which package is being deleted


   // Fetch packages created by the current agent
   const { data: packages, isLoading: packagesLoading, error } = useQuery<TravelPackage[]>({
       queryKey: ['agentPackages', user?.uid],
       queryFn: () => getAgentPackages(user!.uid),
       enabled: !!user && isAdmin && !authLoading, // Only run if user is an agent and loaded
   });

   const deleteMutation = useMutation({
      mutationFn: deletePackage,
      onMutate: (packageId) => {
         setIsDeleting(packageId);
      },
      onSuccess: (_, packageId) => {
         toast({ title: "Package Deleted", description: "The package has been successfully deleted." });
         // Invalidate and refetch the agentPackages query
         queryClient.invalidateQueries({ queryKey: ['agentPackages', user?.uid] });
      },
      onError: (error: any, packageId) => {
         console.error("Error deleting package:", error);
         toast({ variant: "destructive", title: "Deletion Failed", description: error.message || "Could not delete the package." });
      },
      onSettled: () => {
         setIsDeleting(null); // Clear deleting state regardless of outcome
      }
   });


   const handleDelete = (packageId: string) => {
      deleteMutation.mutate(packageId);
   };


   const isLoading = authLoading || packagesLoading;

   if (!authLoading && !isAdmin) {
      // Handle unauthorized access (though layout should prevent this)
       return <div className="container mx-auto p-8 text-center text-destructive">Access Denied. Only agents can manage packages.</div>;
   }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Manage Packages</h1>
        <Button asChild>
          <Link href="/dashboard/agent/packages/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Package
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Packages</CardTitle>
          <CardDescription>
            View, edit, or delete the travel packages you offer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-4">
               {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                     <div className="space-y-2">
                       <Skeleton className="h-5 w-48" />
                       <Skeleton className="h-4 w-32" />
                     </div>
                      <Skeleton className="h-8 w-20" />
                  </div>
               ))}
             </div>
          ) : error ? (
              <p className="text-center text-destructive">Failed to load your packages. Please try again.</p>
          ) : packages && packages.length > 0 ? (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Destination</TableHead>
                   <TableHead>Type</TableHead>
                   <TableHead className="text-right">Price</TableHead>
                   <TableHead className="hidden md:table-cell">Duration</TableHead>
                   {/* <TableHead className="hidden md:table-cell">Status</TableHead> */}
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {packages.map((pkg) => (
                   <TableRow key={pkg.id}>
                     <TableCell className="font-medium">{pkg.destination}</TableCell>
                     <TableCell>
                       <Badge variant="secondary">{pkg.type}</Badge>
                     </TableCell>
                     <TableCell className="text-right">${pkg.price.toLocaleString()}</TableCell>
                     <TableCell className="hidden md:table-cell">{pkg.duration} Days</TableCell>
                      {/* <TableCell className="hidden md:table-cell"><Badge>Active</Badge></TableCell> */}
                     <TableCell className="text-right">
                        <AlertDialog>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button aria-haspopup="true" size="icon" variant="ghost" disabled={!!isDeleting}>
                                   <MoreHorizontal className="h-4 w-4" />
                                   <span className="sr-only">Toggle menu</span>
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                 <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                     <Link href={`/packages/${pkg.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link>
                                  </DropdownMenuItem>
                                 <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/agent/packages/edit/${pkg.id}`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
                                 </DropdownMenuItem>
                                  <AlertDialogTrigger asChild>
                                     <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={isDeleting === pkg.id}>
                                       <Trash2 className="mr-2 h-4 w-4" /> Delete
                                     </DropdownMenuItem>
                                  </AlertDialogTrigger>
                              </DropdownMenuContent>
                           </DropdownMenu>
                            <AlertDialogContent>
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   This action cannot be undone. This will permanently delete the package titled "{pkg.destination}".
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel disabled={isDeleting === pkg.id}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                     onClick={() => handleDelete(pkg.id)}
                                     disabled={isDeleting === pkg.id}
                                   >
                                    {isDeleting === pkg.id ? 'Deleting...' : 'Yes, delete it'}
                                  </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                       </AlertDialog>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          ) : (
             <p className="text-center text-muted-foreground py-8">You haven't created any packages yet.</p>
          )}
        </CardContent>
         {packages && packages.length > 0 && (
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>{packages.length}</strong> packages.
              </div>
              {/* TODO: Add pagination if needed */}
            </CardFooter>
         )}
      </Card>
    </div>
  );
}
