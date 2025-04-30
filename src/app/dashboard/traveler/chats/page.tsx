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

// Mock Chat Interface (Traveler's view)
interface TravelerChat {
   chatId: string; // e.g., travelerId_agentId
   agentId: string;
   agentName: string;
   agentAvatarUrl?: string;
   lastMessage: string;
   lastMessageTimestamp: Timestamp | Date;
   unreadCount?: number; // Optional unread count
}

// Mock Function to fetch chats for the current traveler
async function getTravelerChats(travelerId: string): Promise<TravelerChat[]> {
   console.log("Fetching chats for traveler:", travelerId);
   // In Firestore:
   // 1. Query 'chats' collection where('participants', 'array-contains', travelerId)
   // 2. For each chat, identify the other participant (agentId)
   // 3. Fetch agent details from 'users' collection using agentId
   // 4. Get last message details (text, timestamp) - might need subcollection query or denormalization
   await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading

   const now = new Date();

    if (travelerId === 'mockTravelerId1') { // Simulate chats for a specific user
       return [
          { chatId: 'mockTravelerId1_agent123', agentId: 'agent123', agentName: 'Alice Agent', agentAvatarUrl: 'https://picsum.photos/seed/alice/100/100', lastMessage: 'Okay, I will send the updated quote shortly.', lastMessageTimestamp: new Date(now.getTime() - 30 * 60 * 1000), unreadCount: 0 },
          { chatId: 'mockTravelerId1_agent456', agentId: 'agent456', agentName: 'Bob Broker', agentAvatarUrl: 'https://picsum.photos/seed/bob/100/100', lastMessage: 'Did you get a chance to look at the Bali options?', lastMessageTimestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), unreadCount: 1 },
          { chatId: 'mockTravelerId1_agent789', agentId: 'agent789', agentName: 'Carol Consultant', lastMessage: 'Welcome! How can I help you plan your trip?', lastMessageTimestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), unreadCount: 0 },
       ].sort((a, b) => (b.lastMessageTimestamp as Date).getTime() - (a.lastMessageTimestamp as Date).getTime()); // Sort by most recent
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


export default function TravelerChatsPage() {
   const { user, role, loading: authLoading } = useAuth();
   const router = useRouter();
   const [searchTerm, setSearchTerm] = useState('');

   // Fetch chats for the current traveler
   const { data: chats, isLoading: chatsLoading, error } = useQuery<TravelerChat[]>({
       queryKey: ['travelerChats', user?.uid],
       // Use a specific ID like 'mockTravelerId1' for testing
       queryFn: () => getTravelerChats(user?.uid || 'mockTravelerId1'),
       enabled: !!user && role === 'traveler' && !authLoading,
   });

   const isLoading = authLoading || chatsLoading;

    // Filter chats based on search term (agent name or last message)
    const filteredChats = chats?.filter(chat =>
       chat.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (!authLoading && role !== 'traveler') {
        return <div className="container mx-auto p-8 text-center text-destructive">Access Denied.</div>;
    }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
       <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
         <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
       </Button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-7 w-7" /> My Conversations
        </h1>
         <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
               type="search"
               placeholder="Search chats..."
               className="pl-8 w-full"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Chats</CardTitle>
          <CardDescription>
            Continue conversations with your travel agents.
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
              <p className="text-center text-destructive py-8">Failed to load your chats. Please try again later.</p>
          ) : filteredChats && filteredChats.length > 0 ? (
             <div className="divide-y">
               {filteredChats.map((chat) => (
                 <Link
                   key={chat.chatId}
                   href={`/chat?agentId=${chat.agentId}`} // Link to the specific chat page
                   className="flex items-center space-x-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                 >
                   <Avatar className="h-10 w-10">
                     <AvatarImage src={chat.agentAvatarUrl} alt={chat.agentName} />
                     <AvatarFallback>{getInitials(chat.agentName)}</AvatarFallback>
                   </Avatar>
                   <div className="flex-grow overflow-hidden">
                     <p className="font-medium truncate">{chat.agentName}</p>
                     <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                   </div>
                   <div className="flex flex-col items-end text-xs text-muted-foreground space-y-1">
                      <span>{formatTimeAgo(chat.lastMessageTimestamp)}</span>
                       {chat.unreadCount && chat.unreadCount > 0 && (
                          <Badge className="h-5 w-5 p-0 flex items-center justify-center">{chat.unreadCount}</Badge>
                       )}
                   </div>
                 </Link>
               ))}
             </div>
          ) : (
             <p className="text-center text-muted-foreground py-16">
                 {searchTerm ? 'No chats match your search.' : 'You have no active conversations.'}
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
