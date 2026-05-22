import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet } from 'react-native';

export default function Activity3() {
  return (
    <AppScreen style={styles.container}>
      <ThemedText type="title">Hand Fan Challenge</ThemedText>
      <ThemedText style={styles.subtitle}>
        Hand Fan Challenge description.
      </ThemedText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  subtitle: { textAlign: 'center', lineHeight: 22, marginTop: 8 },
});
