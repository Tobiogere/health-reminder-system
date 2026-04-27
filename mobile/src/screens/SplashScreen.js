import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAROON = '#6B0F1A';
const GOLD   = '#C9A84C';

export default function SplashScreen({ navigation }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const checkAuth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const token = await AsyncStorage.getItem('token');
        if (token) {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('Login');
        }
      } catch (err) {
        navigation.replace('Login');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.circleLarge} />
      <View style={styles.circleSmall} />

      <Animated.View style={[
        styles.logoContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        <View style={styles.crest}>
          <Text style={styles.crestEmoji}>🏥</Text>
        </View>
        <Text style={styles.universityName}>Redeemer's University</Text>
        <Text style={styles.subtitle}>Health Centre</Text>
        <View style={styles.divider} />
        <Text style={styles.appName}>RUN Med Reminder</Text>
        <Text style={styles.tagline}>
          Your medication schedule, simplified.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, { backgroundColor: GOLD }]} />
          <View style={[styles.dot, { backgroundColor: GOLD, opacity: 0.6 }]} />
          <View style={[styles.dot, { backgroundColor: GOLD, opacity: 0.3 }]} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MAROON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLarge: {
    position: 'absolute',
    width: 400, height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.03)',
    top: -100, right: -100,
  },
  circleSmall: {
    position: 'absolute',
    width: 250, height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: -50, left: -60,
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  crest: {
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  crestEmoji: { fontSize: 44 },
  universityName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    width: 60, height: 2,
    backgroundColor: GOLD,
    borderRadius: 999,
    marginVertical: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: GOLD,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
});