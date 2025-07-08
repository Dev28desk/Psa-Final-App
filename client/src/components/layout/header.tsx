import { Search, Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students, coaches, payments..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-accent text-white text-xs">
              3
            </Badge>
          </Button>
          
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
          
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
            <Avatar className="h-9 w-9 ring-2 ring-gray-100">
              <AvatarImage src="/api/placeholder/32/32" alt="Admin" />
              <AvatarFallback className="bg-primary text-white font-medium">AD</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
