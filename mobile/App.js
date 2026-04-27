import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

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
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
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
  );
}