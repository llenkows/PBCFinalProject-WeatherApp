import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Weather App',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="forecast" 
        options={{ 
          title: '5-Day Forecast',
          headerShown: true,
          headerStyle: { backgroundColor: '#4A90E2' },
          headerTintColor: '#fff'
        }} 
      />
    </Stack>
  );
}