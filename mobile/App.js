import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from './src/context/ThemeContext';
import { registerForPushNotifications } from './src/services/notificationService';
import SplashScreen               from './src/screens/SplashScreen';
import LoginScreen                from './src/screens/LoginScreen';
import RegisterScreen             from './src/screens/RegisterScreen';
import DashboardScreen            from './src/screens/DashboardScreen';
import MedicationScheduleScreen   from './src/screens/MedicationScheduleScreen';
import PrescriptionHistoryScreen  from './src/screens/PrescriptionHistoryScreen';
import RenewalRequestScreen       from './src/screens/RenewalRequestScreen';
import ProfileScreen              from './src/screens/ProfileScreen';
import NotificationsScreen        from './src/screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useRef(null);
  const notifListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications();

    // Foreground notification listener
    notifListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Tap on notification — navigate to correct screen
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.current) {
        navigationRef.current.navigate(screen);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notifListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="light" />
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash"              component={SplashScreen} />
          <Stack.Screen name="Login"               component={LoginScreen} />
          <Stack.Screen name="Register"            component={RegisterScreen} />
          <Stack.Screen name="Dashboard"           component={DashboardScreen} />
          <Stack.Screen name="MedicationSchedule"  component={MedicationScheduleScreen} />
          <Stack.Screen name="PrescriptionHistory" component={PrescriptionHistoryScreen} />
          <Stack.Screen name="RenewalRequest"      component={RenewalRequestScreen} />
          <Stack.Screen name="Profile"             component={ProfileScreen} />
          <Stack.Screen name="Notifications"       component={NotificationsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}