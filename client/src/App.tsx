import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Fees from "@/pages/fees";
import Attendance from "@/pages/attendance";
import Reports from "@/pages/reports";
import AIInsights from "@/pages/ai-insights";
import Settings from "@/pages/settings";
import Sports from "@/pages/sports";
import Coaches from "@/pages/coaches";
import Batches from "@/pages/batches";
import Communications from "@/pages/communications";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

function Router() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/students" component={Students} />
              <Route path="/fees" component={Fees} />
              <Route path="/attendance" component={Attendance} />
              <Route path="/reports" component={Reports} />
              <Route path="/ai-insights" component={AIInsights} />
              <Route path="/settings" component={Settings} />
              <Route path="/sports" component={Sports} />
              <Route path="/coaches" component={Coaches} />
              <Route path="/batches" component={Batches} />
              <Route path="/communications" component={Communications} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
