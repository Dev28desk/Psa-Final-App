import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Banknote, 
  Calendar, 
  BarChart3, 
  Sparkles, 
  MessageSquare,
  Trophy,
  Grid3X3,
  Zap
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Students", href: "/students", icon: Users, badge: "342" },
  { name: "Coaches", href: "/coaches", icon: Zap },
  { name: "Batches", href: "/batches", icon: Grid3X3 },
  { name: "Fees & Payments", href: "/fees", icon: Banknote, badge: "23" },
  { name: "Attendance", href: "/attendance", icon: Calendar },
  { name: "Sports", href: "/sports", icon: Trophy },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "AI Insights", href: "/ai-insights", icon: Sparkles },
  { name: "Communications", href: "/communications", icon: MessageSquare },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 overflow-y-auto z-50 -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary to-accent">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Parmanand</h1>
            <p className="text-xs sm:text-sm text-white/80">Sports Academy</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 group relative",
                  isActive 
                    ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-l-4 border-primary shadow-sm" 
                    : "text-gray-700 dark:text-gray-300 hover:text-primary"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-primary"
                )} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
        <div className="text-center text-xs text-gray-500">
          <p>© 2025 Parmanand Sports Academy</p>
          <p className="mt-1">Admin Panel v2.0</p>
        </div>
      </div>
    </aside>
  );
}
