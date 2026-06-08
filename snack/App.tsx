import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './screens/LoginScreen';
import EventsScreen from './screens/EventsScreen';
import DashboardScreen from './screens/DashboardScreen';
import ScannerScreen from './screens/ScannerScreen';
import GuestsScreen from './screens/GuestsScreen';
import AddGuestScreen from './screens/AddGuestScreen';

export type AppUser = {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'organizer' | 'hostess' | 'readonly';
};

export const AuthContext = React.createContext<{
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
}>({ user: null, setUser: () => {} });

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function GuestsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuestsList" component={GuestsScreen} />
      <Stack.Screen name="AddGuest" component={AddGuestScreen} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0A0A0F', borderTopColor: '#1E1E2E' },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#4A4A6A',
      }}
    >
      <Tab.Screen
        name="Eventos"
        component={EventsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="qr-code" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Invitados"
        component={GuestsStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <Stack.Screen name="App" component={AppTabs} />
            ) : (
              <Stack.Screen name="Login" component={LoginScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}
