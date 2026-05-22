import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';

const ACTIVITIES = [
  {
    key: 'activity-1',
    title: 'Parachute Drop Challenge',
    description: 'Design and test parachutes to safely land a small toy.',
    image: require('@/assets/images/partial-react-logo.png'),
    route: 'activity-1',
  },
  {
    key: 'activity-2',
    title: 'Sound Pollution Hunter',
    description: 'Sound Pollution Hunter description.',
    image: require('@/assets/images/partial-react-logo.png'),
    route: 'activity-2',
  },
  {
    key: 'activity-3',
    title: 'Hand Fan Challenge',
    description: 'Hand Fan Challenge description.',
    image: require('@/assets/images/partial-react-logo.png'),
    route: 'activity-3',
  },
];

export default function ActivitiesScreen() {
  const router = useRouter();
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadRatings = async () => {
        try {
          const storedRatings = await Promise.all(
            ACTIVITIES.map(async (activity) => {
              const storedValue = await AsyncStorage.getItem(`${activity.key}-rating`);
              return [activity.key, storedValue ? parseInt(storedValue, 10) : 0] as const;
            })
          );

          if (isActive) {
            setRatings(Object.fromEntries(storedRatings));
          }
        } catch (error) {
          console.error('Error loading ratings:', error);
        }
      };

      loadRatings();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <AppScreen style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        Activities
      </ThemedText>
      <ScrollView contentContainerStyle={styles.list}>
        {ACTIVITIES.map((a) => (
          <View key={a.key} style={styles.card}>
            <Image source={a.image} style={styles.image} />
            <View style={styles.cardBody}>
              <ThemedText type="subtitle">{a.title}</ThemedText>
              <ThemedText style={styles.description}>{a.description}</ThemedText>
              {ratings[a.key] > 0 && (
                <ThemedText style={styles.ratingSummary}>⭐ {ratings[a.key]}/5</ThemedText>
              )}
              <Pressable
                onPress={() => router.push(a.route)}
                style={({ pressed }) => [styles.rectButton, { opacity: pressed ? 0.85 : 1 }]}>
                <ThemedText style={styles.rectButtonText}>Learn More</ThemedText>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  list: {
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 110,
    height: 110,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingSummary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  rectButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#0a7ea4',
  },
  rectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
});
