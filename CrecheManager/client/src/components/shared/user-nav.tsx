import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Bell
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function UserNav() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
  });

  // Function to generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Count unread notifications
  const unreadCount = notifications?.filter((notification: any) => !notification.isRead)?.length || 0;

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-primary-100 transition duration-200"
          onClick={() => navigateTo('/notifications')}
        >
          <Bell className="h-6 w-6 text-primary-500" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[20px] h-[20px] text-[11px] font-bold flex items-center justify-center bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary-500 hover:bg-primary-100 transition duration-200">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary-700 text-white text-sm font-bold">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-medium">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-primary-700">{user?.name}</p>
              <p className="text-xs font-medium leading-none text-gray-600">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => navigateTo('/profile')}
              className="font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 cursor-pointer"
            >
              <User className="mr-2 h-5 w-5 text-primary-500" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigateTo('/settings')}
              className="font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 cursor-pointer"
            >
              <Settings className="mr-2 h-5 w-5 text-primary-500" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigateTo('/help')}
              className="font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 cursor-pointer"
            >
              <HelpCircle className="mr-2 h-5 w-5 text-primary-500" />
              <span>Help</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout} 
            disabled={logoutMutation.isPending}
            className="font-medium text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="mr-2 h-5 w-5 text-red-500" />
            <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
