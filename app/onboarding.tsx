import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function Onboarding() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeen = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (hasSeen) {
        router.replace('/chats');
      } else {
        setLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  const handleNext = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/chats');
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {/* Placeholder image */}
        <View style={styles.placeholderImage} />
      </View>
      <Text style={styles.title}>Chat anytime, anywhere</Text>
      <Text style={styles.subtitle}>
        ConvoFlow makes conversations smarter and more intuitive.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      <View style={styles.dotsContainer}>
        <View style={styles.dotActive} />
        <View style={styles.dotInactive} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  placeholderImage: {
    width: 260,
    height: 180,
    backgroundColor: '#4F8EF7',
    borderRadius: 24,
    marginTop: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 64,
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    marginHorizontal: 4,
  },
  dotInactive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
}); 