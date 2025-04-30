import { db } from '@/config/firebase';
import { collection, query, where, getDocs, limit, startAfter, orderBy, DocumentData, QueryConstraint } from 'firebase/firestore';

/**
 * Represents a travel package stored in Firestore.
 */
export interface TravelPackage {
  id: string; // Firestore document ID
  destination: string;
  budget?: number; // Make budget optional as filter might not always use it directly
  duration: number;
  type: string;
  imageUrl: string;
  itinerary: string;
  price: number;
  agentId: string;
  createdAt?: Timestamp; // Optional timestamp
}

// Import Timestamp type if you use it
import type { Timestamp } from 'firebase/firestore';

/**
 * Asynchronously retrieves travel packages from Firestore based on filter criteria.
 *
 * @param destination The destination to filter by (case-insensitive partial match if needed).
 * @param maxBudget The maximum budget to filter by. Packages with price <= maxBudget.
 * @param minDuration The minimum duration to filter by. Packages with duration >= minDuration.
 * @param type The type to filter by.
 * @param count The maximum number of packages to retrieve.
 * @param startAfterDoc The document to start after for pagination.
 * @returns A promise that resolves to an array of TravelPackage objects.
 */
export async function getPackages(
  destination?: string,
  maxBudget?: number,
  minDuration?: number,
  type?: string,
  count: number = 12, // Default limit
  startAfterDoc?: DocumentData // For pagination
): Promise<TravelPackage[]> {
  const packagesRef = collection(db, 'packages');
  const constraints: QueryConstraint[] = [];

  // --- Filtering ---
  if (destination) {
     // Basic equality filter. For partial/case-insensitive, you'd need a different approach (e.g., backend search service like Algolia/Elasticsearch)
     // constraints.push(where('destination', '==', destination));
     // Simple workaround: filter client-side or use >= and <= for range if indexed properly
      console.warn("Firestore destination filtering is exact match. Partial search needs external service.");
      // Example: If you indexed a lowercase version
      // constraints.push(where('destination_lowercase', '>=', destination.toLowerCase()));
      // constraints.push(where('destination_lowercase', '<=', destination.toLowerCase() + '\uf8ff'));
       constraints.push(where('destination', '==', destination)); // Keep exact match for now
  }
  if (maxBudget !== undefined && maxBudget > 0) {
    constraints.push(where('price', '<=', maxBudget));
  }
   if (minDuration !== undefined && minDuration > 0) {
     // Firestore doesn't support !=, <, <=, >, >= on different fields simultaneously in basic queries.
     // You might need to combine filters or do some filtering client-side if complex.
     // Assuming simple duration filter here.
     constraints.push(where('duration', '>=', minDuration));
     // If filtering by both price and duration, ensure composite index exists in Firestore.
   }
  if (type && type !== 'All') {
    constraints.push(where('type', '==', type));
  }

  // --- Ordering & Pagination ---
  constraints.push(orderBy('createdAt', 'desc')); // Order by creation date, newest first (or price, etc.)
  constraints.push(limit(count));
  if (startAfterDoc) {
    constraints.push(startAfter(startAfterDoc));
  }

  try {
    const q = query(packagesRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const packages: TravelPackage[] = [];
    querySnapshot.forEach((doc) => {
      // console.log(doc.id, " => ", doc.data()); // Debugging
      packages.push({
        id: doc.id,
        ...doc.data(),
      } as TravelPackage); // Type assertion
    });

     // Client-side destination filter (temporary workaround for partial match)
     if (destination) {
       const lowerDest = destination.toLowerCase();
       return packages.filter(pkg => pkg.destination.toLowerCase().includes(lowerDest));
     }


    return packages;
  } catch (error) {
    console.error("Error getting packages: ", error);
    throw new Error("Failed to fetch travel packages."); // Throw error for React Query to catch
  }
}


/**
 * Retrieves a single travel package by its ID from Firestore.
 *
 * @param packageId The ID of the package document.
 * @returns A promise that resolves to the TravelPackage object or null if not found.
 */
export async function getPackageById(packageId: string): Promise<TravelPackage | null> {
   if (!packageId) return null;
   try {
     const packageRef = doc(db, 'packages', packageId);
     const docSnap = await getDoc(packageRef);

     if (docSnap.exists()) {
       return { id: docSnap.id, ...docSnap.data() } as TravelPackage;
     } else {
       console.log("No such package document!");
       return null;
     }
   } catch (error) {
     console.error("Error getting package by ID: ", error);
     throw new Error("Failed to fetch package details.");
   }
}

// Add functions for creating, updating, deleting packages (primarily for agents)
import { addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
* Creates a new travel package in Firestore.
* Requires agent authentication context (pass agentId).
*/
export async function createPackage(packageData: Omit<TravelPackage, 'id' | 'createdAt'>): Promise<string> {
 try {
   const packagesRef = collection(db, 'packages');
   const docRef = await addDoc(packagesRef, {
     ...packageData,
     createdAt: serverTimestamp() // Add server timestamp on creation
   });
   return docRef.id;
 } catch (error) {
   console.error("Error creating package: ", error);
   throw new Error("Failed to create package.");
 }
}

/**
* Updates an existing travel package in Firestore.
* Requires agent authentication context.
*/
export async function updatePackage(packageId: string, packageData: Partial<Omit<TravelPackage, 'id' | 'createdAt'>>): Promise<void> {
 if (!packageId) throw new Error("Package ID is required for update.");
 try {
   const packageRef = doc(db, 'packages', packageId);
   await updateDoc(packageRef, packageData);
 } catch (error) {
   console.error("Error updating package: ", error);
   throw new Error("Failed to update package.");
 }
}

/**
* Deletes a travel package from Firestore.
* Requires agent authentication context.
*/
export async function deletePackage(packageId: string): Promise<void> {
 if (!packageId) throw new Error("Package ID is required for deletion.");
 try {
   const packageRef = doc(db, 'packages', packageId);
   await deleteDoc(packageRef);
 } catch (error) {
   console.error("Error deleting package: ", error);
   throw new Error("Failed to delete package.");
 }
}

// Note: Remember to set up Firestore security rules to control access
// (e.g., only agents can write to the 'packages' collection).
