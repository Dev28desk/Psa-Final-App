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
    <aside className="w-64 bg-primary text-white h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Parmanand</h1>
            <p className="text-sm text-blue-200">Sports Academy</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-active"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="bg-blue-800 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
