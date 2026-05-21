import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RecordResultsScreen() {
  const router = useRouter();
  const [test1, setTest1] = useState('');
  const [test2, setTest2] = useState('');
  const [test3, setTest3] = useState('');

  const handleSubmit = async () => {
    try {
      const attempt = {
        test1,
        test2,
        test3,
        createdAt: new Date().toISOString(),
      };
      const saved = await AsyncStorage.getItem('activity-1-attempts');
      const attempts = saved ? (JSON.parse(saved) as Array<{ test1: string; test2: string; test3: string; createdAt: string }>) : [];
      attempts.push(attempt);
      await AsyncStorage.setItem('activity-1-attempts', JSON.stringify(attempts));
      router.back();
    } catch (error) {
      console.error('Error saving attempt:', error);
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        Record Results
      </ThemedText>

      <ThemedText style={styles.label}>Test 1 Result</ThemedText>
      <TextInput
        value={test1}
        onChangeText={setTest1}
        placeholder="Enter Test 1 result"
        style={styles.input}
      />

      <ThemedText style={styles.label}>Test 2 Result</ThemedText>
      <TextInput
        value={test2}
        onChangeText={setTest2}
        placeholder="Enter Test 2 result"
        style={styles.input}
      />

      <ThemedText style={styles.label}>Test 3 Result</ThemedText>
      <TextInput
        value={test3}
        onChangeText={setTest3}
        placeholder="Enter Test 3 result"
        style={styles.input}
      />

      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [styles.submitButton, { opacity: pressed ? 0.7 : 1 }]}
      >
        <ThemedText style={styles.submitButtonText}>Save Results</ThemedText>
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.7 : 1 }]}
      >
        <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  header: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
});
