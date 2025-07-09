import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

// Mobile Pages
import CoachApp from "./pages/CoachApp";
import StudentApp from "./pages/StudentApp";
import MobileLogin from "./pages/MobileLogin";
import AppSelector from "./pages/AppSelector";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function MobileAppRouter() {
  const [userType, setUserType] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in and get user type
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/mobile/auth/check');
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserType(data.userType);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/mobile/login" component={MobileLogin} />
        <Route path="/mobile" component={AppSelector} />
        <Route path="/mobile/*" component={AppSelector} />
        <Route>
          <AppSelector />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/mobile/coach" component={CoachApp} />
      <Route path="/mobile/student" component={StudentApp} />
      <Route path="/mobile">
        {userType === 'coach' ? <CoachApp /> : <StudentApp />}
      </Route>
      <Route path="/mobile/*">
        {userType === 'coach' ? <CoachApp /> : <StudentApp />}
      </Route>
      <Route>
        {userType === 'coach' ? <CoachApp /> : <StudentApp />}
      </Route>
    </Switch>
  );
}

export default function MobileApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="mobile-ui-theme">
        <div className="min-h-screen bg-background">
          <MobileAppRouter />
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}