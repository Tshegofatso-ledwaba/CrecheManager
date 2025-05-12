import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Bell, Info, FileText, AlertTriangle, CheckCircle2, Check } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ["/api/notifications"],
  });
  
  // Mutation for marking a single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      console.log(`Marking notification ${notificationId} as read`);
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      console.log("Mark as read response:", response);
      return response;
    },
    onSuccess: () => {
      // Refetch notifications after marking as read
      console.log("Successfully marked notification as read, refetching...");
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Notification marked as read",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Failed to mark notification as read",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      console.log("Marking all notifications as read");
      const response = await apiRequest("PATCH", `/api/notifications/read-all`);
      console.log("Mark all as read response:", response);
      return response;
    },
    onSuccess: () => {
      // Refetch notifications after marking all as read
      console.log("Successfully marked all notifications as read, refetching...");
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "All notifications marked as read",
        description: "Your notifications have been updated",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Failed to mark notifications as read",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Function to handle marking a notification as read
  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };
  
  if (!user || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Default empty array if notifications is undefined
  const allNotifications = notifications || [];
  
  // Filter notifications based on active tab
  const filteredNotifications = allNotifications.filter((notification: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    return notification.type === activeTab;
  });
  
  // Count by type
  const unreadCount = allNotifications.filter((n: any) => !n.isRead).length;
  const infoCount = allNotifications.filter((n: any) => n.type === "info").length;
  const alertCount = allNotifications.filter((n: any) => n.type === "alert").length;
  const systemCount = allNotifications.filter((n: any) => n.type === "system").length;
  
  // Function to get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "system":
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  // If there are no notifications, display a message
  if (allNotifications.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">
              Stay updated with the latest news and updates from Little Stars Creche
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground opacity-25 mb-4" />
            <h3 className="text-xl font-medium">No notifications</h3>
            <p className="text-muted-foreground text-center max-w-md mt-2">
              You don't have any notifications at the moment. We'll notify you when there are updates or important messages.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">
              Stay updated with the latest news and updates from Little Stars Creche
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="auto-read" />
            <Label htmlFor="auto-read">Mark as read automatically</Label>
          </div>
        </div>
        
        <Separator />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="relative">
              All
              <Badge variant="secondary" className="ml-1 px-1 absolute -top-1 -right-1">
                {allNotifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="relative">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 absolute -top-1 -right-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="info" className="relative">
              Info
              {infoCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 absolute -top-1 -right-1">
                  {infoCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="alert" className="relative">
              Alerts
              {alertCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 absolute -top-1 -right-1">
                  {alertCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="system" className="relative">
              System
              {systemCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 absolute -top-1 -right-1">
                  {systemCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="py-8 flex flex-col items-center justify-center">
                    <Bell className="h-12 w-12 text-muted-foreground opacity-25 mb-4" />
                    <h3 className="text-lg font-medium">No {activeTab} notifications</h3>
                    <p className="text-muted-foreground text-center max-w-md mt-2">
                      You don't have any {activeTab === "all" ? "" : activeTab} notifications at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification: any, index: number) => (
                  <Card key={index} className={!notification.isRead ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {getNotificationIcon(notification.type)}
                          <CardTitle className="text-base">{notification.title}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <Badge variant="outline" className="bg-primary-50 text-primary border-primary">
                              New
                            </Badge>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {notification.createdAt ? format(new Date(notification.createdAt), "dd MMM, HH:mm") : "N/A"}
                            </span>
                            {!notification.isRead && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={markAsReadMutation.isPending}
                              >
                                {markAsReadMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                <span className="sr-only">Mark as read</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <CardDescription>
                        From {notification.sender}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{notification.message}</p>
                      
                      {notification.actionLink && (
                        <div className="mt-4">
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
              
              {filteredNotifications.length > 0 && (
                <div className="flex justify-between items-center pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                  >
                    {markAllAsReadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Mark All as Read
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}