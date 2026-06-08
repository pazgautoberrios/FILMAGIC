import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentUser } from '@/hooks/useAuth';

export default function AppLayout() {
  const user = useCurrentUser();
  const isHostess = user?.role === 'hostess';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0A0A0F', borderTopColor: '#1E1E2E' },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#4A4A6A',
      }}
    >
      {!isHostess && (
        <Tabs.Screen
          name="index"
          options={{
            title: 'Eventos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
      )}
      {!isHostess && (
        <Tabs.Screen
          name="dashboard/[eventId]"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="scanner/[eventId]"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, size }) => <Ionicons name="qr-code" size={size} color={color} />,
        }}
      />
      {!isHostess && (
        <Tabs.Screen
          name="guests/[eventId]"
          options={{
            title: 'Invitados',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
      )}
    </Tabs>
  );
}
