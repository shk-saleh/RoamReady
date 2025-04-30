import Link from 'next/link';
import { Plane } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
             <Plane className="h-6 w-6" />
             <span>RoamReady</span>
           </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Your Name/Team. The source code is available on{' '}
            <a
              href="#" // Replace with your actual repo link
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-right">
          &copy; {new Date().getFullYear()} RoamReady. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
