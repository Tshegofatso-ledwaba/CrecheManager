import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

interface MessageThreadProps {
  messages: Message[];
  selectedConversation?: {
    userId: number;
    userName: string;
    userRole: string;
  };
}

export function MessageThread({ messages, selectedConversation }: MessageThreadProps) {
  const { user } = useAuth();

  // Function to generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Function to format date
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      // Format as date if more than a week old
      return date.toLocaleDateString();
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No messages yet.</p>
        {selectedConversation && (
          <p className="text-sm">Start a conversation with {selectedConversation.userName}.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex max-w-[75%] ${message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className={message.senderRole === "admin" ? "bg-primary-700 text-white" : "bg-secondary-600 text-white"}>
                {getInitials(message.senderName)}
              </AvatarFallback>
            </Avatar>

            <div className={`mx-2 space-y-1 ${message.senderId === user?.id ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{message.senderName}</span>
                {message.senderRole === "admin" && <Badge className="bg-primary">Admin</Badge>}
                <span className="text-xs text-gray-500">{formatMessageDate(message.createdAt)}</span>
              </div>
              
              <div 
                className={`rounded-lg p-3 inline-block ${
                  message.senderId === user?.id
                    ? 'bg-primary-100 text-primary-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
