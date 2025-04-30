'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Search } from "lucide-react";
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import type { Timestamp } from 'firebase/firestore';
import { Input } from '@/components/ui/input';


// Mock Chat Interface (Agent's view)
interface AgentChat {
   chatId: string; // e.g., travelerId_agentId
   travelerId: string;
   travelerName: string;
   travelerAvatarUrl?: string;
   lastMessage: string;
   lastMessageTimestamp: Timestamp | Date;
   unreadCount?: number; // Optional unread count (from traveler's perspective)
}

// Mock Function to fetch chats for the current agent
async function getAgentChats(agentId: string): Promise<AgentChat[]> {
   console.log("Fetching chats for agent:", agentId);
   // In Firestore:
   // 1. Query 'chats' collection where('participants', 'array-contains', agentId)
   // 2. For each chat, identify the other participant (travelerId)
   // 3. Fetch traveler details from 'users' collection using travelerId
   // 4. Get last message details
   await new Promise(resolve => setTimeout(resolve, 900)); // Simulate loading

   const now = new Date();

    if (agentId === 'agent123') { // Simulate chats for a specific agent
       return [
           { chatId: 'mockTravelerId1_agent123', travelerId: 'mockTravelerId1', travelerName: 'Alice Traveler', travelerAvatarUrl: 'https://picsum.photos/seed/aliceT/100/100', lastMessage: 'Okay, I will send the updated quote shortly.', lastMessageTimestamp: new Date(now.getTime() - 30 * 60 * 1000), unreadCount: 0 },
           { chatId: 'travelerXYZ_agent123', travelerId: 'travelerXYZ', travelerName: 'Xavier Example', lastMessage: 'What are the visa requirements for Japan?', lastMessageTimestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), unreadCount: 2 },
       ].sort((a, b) => (b.lastMessageTimestamp as Date).getTime() - (a.lastMessageTimestamp as Date).getTime());
   }
    if (agentId === 'agent456') {
       return [
           { chatId: 'mockTravelerId1_agent456', travelerId: 'mockTravelerId1', travelerName: 'Alice Traveler', travelerAvatarUrl: 'https://picsum.photos/seed/aliceT/100/100', lastMessage: 'Did you get a chance to look at the Bali options?', lastMessageTimestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), unreadCount: 0 }, // Agent doesn't see traveler's unread
       ].sort((a, b) => (b.lastMessageTimestamp as Date).getTime() - (a.lastMessageTimestamp as Date).getTime());
    }
   return []; // Default to no chats
}

// Helper to format relative time or date
const formatTimeAgo = (date: Timestamp | Date | undefined): string => {
   if (!date) return '';
   const d = date instanceof Date ? date : date.toDate();
   const now = new Date();
   const diffSeconds = Math.round((now.getTime() - d.getTime()) / 1000);
   const diffMinutes = Math.round(diffSeconds / 60);
   const diffHours = Math.round(diffMinutes / 60);
   const diffDays = Math.round(diffHours / 24);

   if (diffSeconds < 60) return `${diffSeconds}s ago`;
   if (diffMinutes < 60) return `${diffMinutes}m ago`;
   if (diffHours < 24) return `${diffHours}h ago`;
   if (diffDays === 1) return 'Yesterday';
   if (diffDays < 7) return `${diffDays}d ago`;
   return d.toLocaleDateString();
};

const getInitials = (name?: string | null) => {
   if (!name) return '?';
   const names = name.split(' ');
   if (names.length === 1) return names[0].charAt(0).toUpperCase();
   return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
 };


export default function AgentChatsPage() {
   const { user, isAdmin, loading: authLoading } = useAuth();
   const router = useRouter();
   const [searchTerm, setSearchTerm] = useState('');

   // Fetch chats for the current agent
   const { data: chats, isLoading: chatsLoading, error } = useQuery<AgentChat[]>({
       queryKey: ['agentChats', user?.uid],
       // Use specific ID for testing
       queryFn: () => getAgentChats(user?.uid || 'agent123'),
       enabled: !!user && isAdmin && !authLoading,
   });

   const isLoading = authLoading || chatsLoading;

    // Filter chats based on search term (traveler name or last message)
    const filteredChats = chats?.filter(chat =>
       chat.travelerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (!authLoading && !isAdmin) {
        return <div className="container mx-auto p-8 text-center text-destructive">Access Denied.</div>;
    }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
       <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
         <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
       </Button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-7 w-7" /> Traveler Conversations
        </h1>
         <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
               type="search"
               placeholder="Search travelers..."
               className="pl-8 w-full"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Chats</CardTitle>
          <CardDescription>
            Manage conversations with travelers interested in your packages or custom plans.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="space-y-1 p-4">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex items-center space-x-4 p-3">
                     <Skeleton className="h-10 w-10 rounded-full" />
                     <div className="space-y-2 flex-grow">
                       <Skeleton className="h-4 w-2/3" />
                       <Skeleton className="h-3 w-1/2" />
                     </div>
                      <Skeleton className="h-3 w-12" />
                  </div>
               ))}
             </div>
          ) : error ? (
              <p className="text-center text-destructive py-8">Failed to load chats. Please try again later.</p>
          ) : filteredChats && filteredChats.length > 0 ? (
             <div className="divide-y">
               {filteredChats.map((chat) => (
                 <Link
                   key={chat.chatId}
                   href={`/chat?travelerId=${chat.travelerId}`} // Link to the specific chat page
                   className="flex items-center space-x-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                 >
                   <Avatar className="h-10 w-10">
                     <AvatarImage src={chat.travelerAvatarUrl} alt={chat.travelerName} />
                     <AvatarFallback>{getInitials(chat.travelerName)}</AvatarFallback>
                   </Avatar>
                   <div className="flex-grow overflow-hidden">
                     <p className="font-medium truncate">{chat.travelerName}</p>
                     <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                   </div>
                   <div className="flex flex-col items-end text-xs text-muted-foreground space-y-1">
                      <span>{formatTimeAgo(chat.lastMessageTimestamp)}</span>
                       {/* Agent doesn't usually see traveler's unread count directly
                       {chat.unreadCount && chat.unreadCount > 0 && (
                          <Badge className="h-5 w-5 p-0 flex items-center justify-center">{chat.unreadCount}</Badge>
                       )}
                       */}
                   </div>
                 </Link>
               ))}
             </div>
          ) : (
             <p className="text-center text-muted-foreground py-16">
                {searchTerm ? 'No travelers match your search.' : 'You have no active conversations.'}
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
