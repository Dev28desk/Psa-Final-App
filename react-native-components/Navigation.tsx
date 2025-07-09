import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import AppSelector from '../screens/auth/AppSelector';

// Coach Screens
import CoachDashboard from '../screens/coach/CoachDashboard';
import CoachClasses from '../screens/coach/CoachClasses';
import CoachAttendance from '../screens/coach/CoachAttendance';
import CoachProfile from '../screens/coach/CoachProfile';

// Student Screens
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentSchedule from '../screens/student/StudentSchedule';
import StudentAttendance from '../screens/student/StudentAttendance';
import StudentPayments from '../screens/student/StudentPayments';
import StudentAchievements from '../screens/student/StudentAchievements';
import StudentProfile from '../screens/student/StudentProfile';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Coach Tab Navigator
const CoachTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'Classes':
              iconName = 'calendar';
              break;
            case 'Attendance':
              iconName = 'check-circle';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#0066cc',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={CoachDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Classes" 
        component={CoachClasses}
        options={{ title: 'My Classes' }}
      />
      <Tab.Screen 
        name="Attendance" 
        component={CoachAttendance}
        options={{ title: 'Attendance' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={CoachProfile}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Student Tab Navigator
const StudentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'Schedule':
              iconName = 'calendar';
              break;
            case 'Attendance':
              iconName = 'check-circle';
              break;
            case 'Payments':
              iconName = 'credit-card';
              break;
            case 'Achievements':
              iconName = 'award';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#0066cc',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={StudentDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={StudentSchedule}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen 
        name="Attendance" 
        component={StudentAttendance}
        options={{ title: 'Attendance' }}
      />
      <Tab.Screen 
        name="Payments" 
        component={StudentPayments}
        options={{ title: 'Payments' }}
      />
      <Tab.Screen 
        name="Achievements" 
        component={StudentAchievements}
        options={{ title: 'Badges' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={StudentProfile}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Auth Navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0066cc',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="AppSelector" 
        component={AppSelector}
        options={{ 
          title: 'Parmanand Sports Academy',
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ 
          title: 'Login',
          headerBackTitle: 'Back'
        }}
      />
    </Stack.Navigator>
  );
};

// Main Navigator
interface MainNavigatorProps {
  isAuthenticated: boolean;
  userType: 'coach' | 'student' | null;
}

const MainNavigator: React.FC<MainNavigatorProps> = ({ isAuthenticated, userType }) => {
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (userType === 'coach') {
    return <CoachTabNavigator />;
  }

  if (userType === 'student') {
    return <StudentTabNavigator />;
  }

  // Fallback to auth if user type is unknown
  return <AuthNavigator />;
};

// Root Navigation Container
interface AppNavigationProps {
  isAuthenticated: boolean;
  userType: 'coach' | 'student' | null;
}

const AppNavigation: React.FC<AppNavigationProps> = ({ isAuthenticated, userType }) => {
  return (
    <NavigationContainer>
      <MainNavigator isAuthenticated={isAuthenticated} userType={userType} />
    </NavigationContainer>
  );
};

export default AppNavigation;