'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/providers/auth-provider';
import { useFirebase } from '@/providers/firebase-provider';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp, doc, getDoc, setDoc, getDocs, limit } from 'firebase/firestore';
import { Loader2, Send, Paperclip, Smile } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: Timestamp | null;
  imageUrl?: string; // Optional image URL
  packageSuggestionIds?: string[]; // Optional array of suggested package IDs
}

interface ChatUser {
   id: string;
   name: string;
   avatarUrl?: string;
}

const getInitials = (name?: string | null) => {
   if (!name) return '?';
   const names = name.split(' ');
   if (names.length === 1) return names[0].charAt(0).toUpperCase();
   return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
 };

// Placeholder for AI suggestion function
async function triggerPackageSuggestion(chatHistoryText: string): Promise<string[]> {
   console.log("Triggering AI suggestion with history:", chatHistoryText);
   // In a real app, call your Genkit flow here
   // import { suggestTravelPackages } from '@/ai/flows/suggest-travel-packages';
   // try {
   //   const suggestions = await suggestTravelPackages({ chatHistory: chatHistoryText });
   //   return suggestions;
   // } catch (error) {
   //   console.error("AI suggestion failed:", error);
   //   return [];
   // }

   // Mock response:
   await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing time
   if (chatHistoryText.toLowerCase().includes("beach") || chatHistoryText.toLowerCase().includes("relax")) {
     return ['2']; // Suggest Bali (ID '2' from mock data)
   }
   if (chatHistoryText.toLowerCase().includes("paris") || chatHistoryText.toLowerCase().includes("city")) {
      return ['1']; // Suggest Paris (ID '1' from mock data)
   }
   return [];
}


export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const { db } = useFirebase();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPartner, setChatPartner] = useState<ChatUser | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);


  // Determine chat partner based on query params (e.g., ?agentId=xyz or ?travelerId=abc)
   const agentIdParam = searchParams.get('agentId');
   const travelerIdParam = searchParams.get('travelerId');
   // Add packageIdParam if needed for context
   const packageIdParam = searchParams.get('packageId');


   // Function to get or create chat ID
   const getOrCreateChatId = useCallback(async (user1: string, user2: string): Promise<string> => {
      const chatIdFormat1 = `${user1}_${user2}`;
      const chatIdFormat2 = `${user2}_${user1}`;

      const chatsRef = collection(db, 'chats');
      const q1 = query(chatsRef, where('__name__', '==', chatIdFormat1), limit(1));
      const q2 = query(chatsRef, where('__name__', '==', chatIdFormat2), limit(1));

      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      if (!snapshot1.empty) return snapshot1.docs[0].id;
      if (!snapshot2.empty) return snapshot2.docs[0].id;

      // If no chat exists, create one (using format1 by default)
      const newChatRef = doc(db, 'chats', chatIdFormat1);
      await setDoc(newChatRef, {
          participants: [user1, user2],
          createdAt: serverTimestamp(),
          lastMessageTimestamp: serverTimestamp(),
          // Add packageId if relevant
          ...(packageIdParam && { packageContextId: packageIdParam }),
      });
      return chatIdFormat1;
   }, [db, packageIdParam]);


   useEffect(() => {
    if (authLoading || !user) return;

    const partnerId = agentIdParam || travelerIdParam;
    if (!partnerId) {
      setIsLoadingMessages(false);
      console.error("No chat partner specified.");
      // Handle error: show message or redirect
      return;
    }

    const fetchChatData = async () => {
       setIsLoadingMessages(true);
       try {
         // 1. Fetch chat partner details
         const partnerDocRef = doc(db, 'users', partnerId);
         const partnerDocSnap = await getDoc(partnerDocRef);
         if (partnerDocSnap.exists()) {
            const partnerData = partnerDocSnap.data();
            setChatPartner({
               id: partnerId,
               name: partnerData.name || 'Chat Partner',
               avatarUrl: partnerData.avatarUrl, // Assuming avatarUrl field exists
            });
         } else {
             throw new Error("Chat partner not found");
         }

         // 2. Get or create Chat ID
          const currentChatId = await getOrCreateChatId(user.uid, partnerId);
          setChatId(currentChatId);

          // 3. Set up message listener
          const messagesRef = collection(db, 'chats', currentChatId, 'messages');
          const q = query(messagesRef, orderBy('timestamp', 'asc'));

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Message[];
            setMessages(msgs);
            setIsLoadingMessages(false);
            // Scroll to bottom after messages load/update
             scrollToBottom();
          }, (error) => {
             console.error("Error fetching messages:", error);
             toast({ variant: "destructive", title: "Error", description: "Could not load messages." });
             setIsLoadingMessages(false);
          });

          return unsubscribe; // Return unsubscribe function for cleanup

       } catch (error) {
          console.error("Error initializing chat:", error);
          toast({ variant: "destructive", title: "Error", description: "Could not start chat." });
          setIsLoadingMessages(false);
          setChatPartner(null); // Clear partner info on error
          setChatId(null);
       }
     };

    const unsubscribePromise = fetchChatData();

    // Cleanup listener on component unmount or when user/partner changes
     return () => {
        unsubscribePromise.then(unsubscribe => {
           if (unsubscribe) unsubscribe();
        });
     };

  }, [user, authLoading, agentIdParam, travelerIdParam, db, toast, getOrCreateChatId]);


   const scrollToBottom = () => {
      setTimeout(() => { // Delay slightly to ensure DOM is updated
         if (scrollAreaRef.current) {
             const scrollableView = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
             if (scrollableView) {
                scrollableView.scrollTop = scrollableView.scrollHeight;
             }
         }
      }, 100);
   };

  const handleSendMessage = async (suggestedPackageIds?: string[]) => {
    if (!newMessage.trim() && !suggestedPackageIds?.length) return;
    if (!user || !chatId || !chatPartner) {
       toast({ variant: "destructive", title: "Error", description: "Cannot send message. Chat not initialized." });
       return;
    }

    setIsSending(true);
    const messageText = newMessage; // Store text before clearing
    setNewMessage(''); // Clear input immediately

    const messageData: Omit<Message, 'id' | 'timestamp'> & { timestamp: any } = {
      text: messageText,
      senderId: user.uid,
      receiverId: chatPartner.id,
      timestamp: serverTimestamp(),
      ...(suggestedPackageIds && { packageSuggestionIds: suggestedPackageIds }),
    };

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, messageData);

      // Update last message timestamp on chat document (optional but useful)
       await setDoc(doc(db, 'chats', chatId), { lastMessageTimestamp: serverTimestamp() }, { merge: true });

       // Trigger AI suggestion *after* sending the user's message
       if (messageText.trim()) { // Only trigger if there was user text
         handleAISuggestion();
       }
        scrollToBottom(); // Scroll after sending

    } catch (error) {
      console.error('Error sending message:', error);
      toast({ variant: "destructive", title: "Error", description: "Could not send message." });
      setNewMessage(messageText); // Restore input if sending failed
    } finally {
      setIsSending(false);
    }
  };

   const handleAISuggestion = useCallback(async () => {
      if (isSuggesting || !chatId || messages.length === 0) return; // Don't trigger if already suggesting or no history

      setIsSuggesting(true);
      try {
         // Prepare chat history string (simple concatenation for now)
         const chatHistoryText = messages.map(msg => `${msg.senderId === user?.uid ? 'User' : 'Agent'}: ${msg.text}`).join('\n');

         const suggestedIds = await triggerPackageSuggestion(chatHistoryText);

         if (suggestedIds.length > 0) {
            // Send a system-like message with suggestions
            const suggestionMessageData: Omit<Message, 'id' | 'timestamp'> & { timestamp: any } = {
              text: `Based on our conversation, you might like these packages:`,
              senderId: 'system', // Or agentId if agent triggers suggestion
              receiverId: user!.uid, // Or travelerId
              timestamp: serverTimestamp(),
              packageSuggestionIds: suggestedIds,
            };
             const messagesRef = collection(db, 'chats', chatId, 'messages');
             await addDoc(messagesRef, suggestionMessageData);
              scrollToBottom();
              toast({ title: "Suggestion Added", description: "AI found some relevant packages." });
         } else {
            // Optional: Notify user if no suggestions found
            // toast({ title: "No Suggestions", description: "AI couldn't find relevant packages based on the current chat." });
         }

      } catch (error) {
          console.error("Error during AI suggestion:", error);
          // Don't necessarily show error to user, log it
      } finally {
          setIsSuggesting(false);
      }
   }, [chatId, messages, user, db, toast, isSuggesting]);


   // Placeholder for Package Suggestion Card
   const SuggestionCard = ({ packageId }: { packageId: string }) => {
      // In real app, fetch package details by ID
      const mockPackage = packageId === '1' ? { name: 'Paris City Tour', price: 1999 } :
                           packageId === '2' ? { name: 'Bali Relaxation', price: 1499 } :
                           null;

       if (!mockPackage) return null;

      return (
         <Card className="mt-2 bg-secondary/50 border-primary/30 w-full max-w-xs">
            <CardContent className="p-3">
               <p className="font-semibold text-sm">{mockPackage.name}</p>
               <p className="text-xs text-muted-foreground">Starting from ${mockPackage.price}</p>
               <Button variant="link" size="sm" className="px-0 h-auto py-0 mt-1" asChild>
                  <Link href={`/packages/${packageId}`} target="_blank">View Details</Link>
               </Button>
            </CardContent>
         </Card>
      );
   };


  if (authLoading) {
     return <div className="container mx-auto p-4 flex justify-center items-center h-[calc(100vh-8rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
  }

   if (!user) {
      // Should be handled by layout, but as a fallback
      return <div className="container mx-auto p-4 text-center">Please log in to chat.</div>;
    }

    if (!chatPartner && !isLoadingMessages) {
        return (
            <div className="container mx-auto p-4 md:p-8 text-center">
                <h2 className="text-xl font-semibold text-destructive mb-4">Chat Partner Not Found</h2>
                <p className="text-muted-foreground mb-6">Could not find the user you're trying to chat with.</p>
                <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }


  return (
     <div className="container mx-auto p-0 md:p-4 lg:p-8 h-[calc(100vh-4rem)] flex flex-col">
       <Card className="flex flex-col flex-grow shadow-lg overflow-hidden">
         <CardHeader className="flex flex-row items-center p-4 border-b">
           {chatPartner ? (
             <>
               <Avatar className="h-10 w-10 mr-3">
                 <AvatarImage src={chatPartner.avatarUrl} alt={chatPartner.name} />
                 <AvatarFallback>{getInitials(chatPartner.name)}</AvatarFallback>
               </Avatar>
               <div className="flex-grow">
                 <CardTitle className="text-lg">{chatPartner.name}</CardTitle>
                  {/* Add online status indicator if available */}
               </div>
                {/* Optional: Add call/video call buttons */}
             </>
           ) : (
              <div className="flex items-center w-full">
                 <Skeleton className="h-10 w-10 rounded-full mr-3" />
                 <div className="space-y-2 flex-grow">
                    <Skeleton className="h-4 w-32" />
                 </div>
              </div>
           )}
         </CardHeader>

         <CardContent ref={scrollAreaRef} className="flex-grow p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              {isLoadingMessages ? (
                 <div className="flex justify-center items-center h-full">
                   <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 </div>
              ) : messages.length === 0 ? (
                 <div className="flex justify-center items-center h-full text-muted-foreground">
                    Start the conversation!
                 </div>
              ) : (
                 <div className="space-y-4">
                   {messages.map((message) => (
                     <div
                       key={message.id}
                       className={cn(
                         "flex items-end gap-2",
                         message.senderId === user.uid ? "justify-end" : "justify-start",
                         message.senderId === 'system' && "justify-center" // Center system messages
                       )}
                     >
                       {message.senderId !== user.uid && message.senderId !== 'system' && chatPartner && (
                         <Avatar className="h-8 w-8 hidden sm:flex">
                           <AvatarImage src={chatPartner.avatarUrl} />
                           <AvatarFallback>{getInitials(chatPartner.name)}</AvatarFallback>
                         </Avatar>
                       )}
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg px-3 py-2",
                             message.senderId === user.uid
                              ? "bg-primary text-primary-foreground"
                              : message.senderId === 'system'
                              ? "bg-muted text-muted-foreground text-xs italic text-center w-full" // System message style
                              : "bg-secondary text-secondary-foreground"
                          )}
                        >
                           <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
                            {/* Render package suggestions if present */}
                           {message.packageSuggestionIds && message.packageSuggestionIds.length > 0 && (
                              <div className="mt-2 space-y-1">
                                 {message.packageSuggestionIds.map(id => <SuggestionCard key={id} packageId={id} />)}
                              </div>
                           )}

                           {message.timestamp && (
                              <p className={cn(
                                 "text-xs mt-1",
                                 message.senderId === user.uid ? "text-primary-foreground/70 text-right" : "text-secondary-foreground/70 text-left",
                                 message.senderId === 'system' && "text-center"
                                 )}>
                                {message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                           )}

                       </div>
                        {message.senderId === user.uid && (
                         <Avatar className="h-8 w-8 hidden sm:flex">
                           <AvatarImage src={user.photoURL || undefined} />
                           <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                         </Avatar>
                       )}
                     </div>
                   ))}
                    {isSuggesting && (
                       <div className="flex justify-center items-center text-xs text-muted-foreground italic py-2">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin"/> Checking for suggestions...
                       </div>
                    )}
                 </div>
              )}
           </ScrollArea>
         </CardContent>

         <CardFooter className="p-4 border-t">
           <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex w-full items-center gap-2"
            >
               {/* Optional buttons for attachments, emojis etc. */}
               {/* <Button type="button" variant="ghost" size="icon" className="text-muted-foreground"><Paperclip className="h-5 w-5" /></Button> */}
               {/* <Button type="button" variant="ghost" size="icon" className="text-muted-foreground"><Smile className="h-5 w-5" /></Button> */}

              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending || isLoadingMessages || !chatId}
                className="flex-grow"
              />
              <Button type="submit" size="icon" disabled={isSending || !newMessage.trim() || isLoadingMessages || !chatId}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                 <span className="sr-only">Send</span>
              </Button>
           </form>
         </CardFooter>
       </Card>
     </div>
  );
}
