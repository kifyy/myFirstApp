import { StyleSheet, View, type ViewProps } from 'react-native';

import { StemmLabHeader } from '@/components/stemm-lab-header';
import { ThemedView } from '@/components/themed-view';

type AppScreenProps = ViewProps & {
  children: React.ReactNode;
};

export function AppScreen({ children, style, ...rest }: AppScreenProps) {
  return (
    <ThemedView style={[styles.screen, style]} {...rest}>
      <StemmLabHeader />
      <View style={styles.content}>{children}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
