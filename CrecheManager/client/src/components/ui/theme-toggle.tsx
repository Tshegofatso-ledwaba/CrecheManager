import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 hover:bg-primary-100 transition duration-200"
        >
          <Sun className="h-6 w-6 text-amber-500 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-6 w-6 text-indigo-500 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="font-medium text-amber-600 hover:text-amber-800 hover:bg-amber-50 cursor-pointer"
        >
          <Sun className="mr-2 h-5 w-5 text-amber-500" />
          <span>Light Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 cursor-pointer"
        >
          <Moon className="mr-2 h-5 w-5 text-indigo-500" />
          <span>Dark Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 cursor-pointer"
        >
          <span className="mr-2 h-5 w-5 flex items-center justify-center">🖥️</span>
          <span>System Default</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}