import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Sun, MountainSnow } from 'lucide-react';

// Mock data for featured packages
const featuredPackages = [
  {
    id: '1',
    destination: 'Coastal Paradise',
    duration: 7,
    type: 'Relaxation',
    price: 1499,
    imageUrl: 'https://picsum.photos/seed/coastal/600/400',
    icon: <Sun className="h-5 w-5 text-accent" />,
  },
  {
    id: '2',
    destination: 'Mountain Escape',
    duration: 5,
    type: 'Adventure',
    price: 1199,
    imageUrl: 'https://picsum.photos/seed/mountain/600/400',
    icon: <MountainSnow className="h-5 w-5 text-primary" />,
  },
   {
    id: '3',
    destination: 'City Explorer',
    duration: 3,
    type: 'City Tour',
    price: 899,
    imageUrl: 'https://picsum.photos/seed/city/600/400',
     icon: <MapPin className="h-5 w-5 text-secondary-foreground" />,
  },
];


export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-primary/10 to-background text-center">
        <div className="container px-4 md:px-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary">
            RoamReady
          </h1>
          <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl mt-4">
            Discover your next adventure. Personalized travel packages curated just for you.
          </p>
          <div className="mt-8 space-x-4">
            <Button asChild size="lg">
              <Link href="/packages">Explore Packages</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/#contact">Contact Agent</Link>
            </Button>
          </div>
           {/* Placeholder for 3D element - requires Spline integration */}
           <div className="mt-12 h-64 w-full flex items-center justify-center bg-secondary/50 rounded-lg">
             <p className="text-muted-foreground">3D Travel Animation Placeholder (Spline)</p>
           </div>
        </div>
      </section>

      {/* Featured Packages Section */}
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
            Featured Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPackages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <CardHeader className="p-0">
                   <Image
                      src={pkg.imageUrl}
                      alt={pkg.destination}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover"
                    />
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl font-semibold mb-2 flex items-center gap-2">
                    {pkg.icon} {pkg.destination}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">
                    {pkg.duration} Days | {pkg.type}
                  </CardDescription>
                   <p className="text-lg font-bold text-primary">${pkg.price}</p>
                </CardContent>
                 <CardFooter className="p-6 pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/packages/${pkg.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
              </Card>
            ))}
          </div>
           <div className="text-center mt-12">
             <Button asChild variant="link" className="text-lg">
               <Link href="/packages">View All Packages</Link>
             </Button>
           </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="contact" className="w-full py-16 md:py-24 lg:py-32 bg-secondary/50">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
            Ready for your next adventure?
          </h2>
          <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl mb-8">
            Let our expert travel agents craft the perfect custom itinerary for you.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/auth/signup?role=traveler">Get Started</Link>
          </Button>
           <p className="mt-4 text-sm text-muted-foreground">
             Are you an agent? <Link href="/auth/signup?role=agent" className="underline">Join us</Link>
           </p>
        </div>
      </section>
    </div>
  );
}
