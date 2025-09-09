"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function ThemeToggle({ inDropdown = false }: { inDropdown?: boolean }) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (inDropdown) {
    return (
      <div className="flex items-center justify-between w-full px-3 py-2">
        <span>Theme</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${theme === "light" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${theme === "system" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            onClick={() => setTheme("system")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${theme === "dark" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
