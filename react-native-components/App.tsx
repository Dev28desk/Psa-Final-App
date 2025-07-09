import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'react-native';
import AppNavigation from './Navigation';
import AuthService from './services/AuthService';
import SplashScreen from './components/SplashScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'coach' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AuthService.checkAuthStatus();
      setIsAuthenticated(authStatus.isAuthenticated);
      
      if (authStatus.isAuthenticated && authStatus.user) {
        setUserType(authStatus.user.type);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUserType(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="light-content" backgroundColor="#0066cc" />
      <AppNavigation isAuthenticated={isAuthenticated} userType={userType} />
    </QueryClientProvider>
  );
};

export default App;