import { useState } from "react";
import { Home, Compass, Bookmark, HelpCircle, User, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "compass", label: "Daily Compass", icon: Compass, href: "/compass" },
  { id: "saved", label: "Saved Articles", icon: Bookmark, href: "/saved" },
  { id: "support", label: "Support", icon: HelpCircle, href: "/support" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

interface SideNavProps {
  className?: string;
}

export const SideNav = ({ className }: SideNavProps) => {
  const [activeItem, setActiveItem] = useState("home");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <nav
      className={cn(
        "fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out group z-50",
        isHovered ? "w-64" : "w-16",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={cn(
              "text-white font-bold text-xl transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}
          >
            Terra
          </h1>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full h-12 px-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 relative",
                  isHovered ? "justify-start" : "justify-center",
                  isActive && "bg-gray-800 text-white border-l-2 border-blue-500"
                )}
                onClick={() => setActiveItem(item.id)}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isHovered && "mr-3")} />
                <span
                  className={cn(
                    "text-sm font-medium transition-all duration-300",
                    isHovered ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                  )}
                >
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}; 