import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Send, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { MessageThread } from "@/components/shared/message-thread";

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  receiverId: number;
  receiverName: string;
  subject: string;
  content: string;
  status: string;
  createdAt: string;
}

interface MessagesProps {
  isAdmin?: boolean;
}

export function Messages({ isAdmin = false }: MessagesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [newMessageData, setNewMessageData] = useState({
    receiverId: "",
    subject: "",
    content: ""
  });

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: availableReceivers } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      // In a real app, this would be an API call to get all admin users or parents
      // For now, return a mock list of users based on the current user role
      if (isAdmin) {
        return [
          { id: 2, name: "Sarah Johnson", role: "parent" },
          { id: 3, name: "Michael Parker", role: "parent" },
          { id: 4, name: "Jennifer Lee", role: "parent" },
        ];
      } else {
        return [
          { id: 1, name: "Admin User", role: "admin" },
        ];
      }
    },
    staleTime: Infinity,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: number; subject: string; content: string }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setComposeDialogOpen(false);
      setReplyContent("");
      setNewMessageData({
        receiverId: "",
        subject: "",
        content: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyContent.trim()) return;

    sendMessageMutation.mutate({
      receiverId: selectedMessage.senderId === user?.id ? selectedMessage.receiverId : selectedMessage.senderId,
      subject: `RE: ${selectedMessage.subject}`,
      content: replyContent
    });

    setMessageDialogOpen(false);
    setReplyContent("");
  };

  const handleSendNewMessage = () => {
    if (!newMessageData.receiverId || !newMessageData.subject || !newMessageData.content.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields to send a message.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      receiverId: parseInt(newMessageData.receiverId),
      subject: newMessageData.subject,
      content: newMessageData.content
    });
  };

  const filteredMessages = messages?.filter(message => 
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Message Center</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                className="flex items-center"
                onClick={() => setComposeDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMessages && filteredMessages.length > 0 ? (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isAdmin ? "From/To" : "From"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <tr 
                      key={message.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOpenMessage(message)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {message.senderId === user?.id ? (
                          <div className="flex items-center">
                            <span>To: {message.receiverName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span>{message.senderName}</span>
                            {message.senderRole === "admin" && (
                              <Badge className="ml-2 bg-primary">Admin</Badge>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {message.senderId !== user?.id && message.status === "unread" && (
                            <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                          )}
                          <span className={message.senderId !== user?.id && message.status === "unread" ? "font-semibold" : ""}>
                            {message.subject}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {message.senderId !== user?.id ? (
                          <Badge className={message.status === "unread" ? "bg-blue-500" : "bg-green-500"}>
                            {message.status === "unread" ? "Unread" : "Read"}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500">Sent</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No messages match your search." : "No messages yet. Start a conversation!"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.senderName} • {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
              {selectedMessage?.content}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Reply:</h4>
              <Textarea 
                placeholder="Type your reply here..." 
                rows={6}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Close
            </Button>
            <Button 
              className="flex items-center"
              onClick={handleSendReply}
              disabled={!replyContent.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose New Message Dialog */}
      <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Compose New Message</DialogTitle>
            <DialogDescription>
              Send a message to the {isAdmin ? "parent" : "administration"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">To:</label>
              <Select 
                value={newMessageData.receiverId} 
                onValueChange={(value) => setNewMessageData({...newMessageData, receiverId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {availableReceivers?.map((receiver) => (
                    <SelectItem key={receiver.id} value={receiver.id.toString()}>
                      {receiver.name} {receiver.role === "admin" && "(Admin)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject:</label>
              <Input 
                placeholder="Enter subject" 
                value={newMessageData.subject}
                onChange={(e) => setNewMessageData({...newMessageData, subject: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message:</label>
              <Textarea 
                placeholder="Type your message here..." 
                rows={8}
                value={newMessageData.content}
                onChange={(e) => setNewMessageData({...newMessageData, content: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="flex items-center"
              onClick={handleSendNewMessage}
              disabled={
                !newMessageData.receiverId || 
                !newMessageData.subject.trim() || 
                !newMessageData.content.trim() || 
                sendMessageMutation.isPending
              }
            >
              {sendMessageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
