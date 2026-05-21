import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const ACTIVITIES = [
  {
    key: 'parachute',
    title: 'Parachute Drop Challenge',
    description: 'Design and test parachutes to safely land a small toy.',
    image: require('@/assets/images/partial-react-logo.png'),
    route: 'parachute',
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

  return (
    <ThemedView style={styles.container}>
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
              <Pressable
                onPress={() => router.push(a.route)}
                style={({ pressed }) => [styles.rectButton, { opacity: pressed ? 0.85 : 1 }]}>
                <ThemedText style={styles.rectButtonText}>Learn More</ThemedText>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
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
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
});
