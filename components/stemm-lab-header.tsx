import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useUserProfile } from '@/contexts/user-profile-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export function StemmLabHeader() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { profile } = useUserProfile();
  const headerBandHeight = height * 0.03;
  const headerMuted = useThemeColor({}, 'headerMuted');

  return (
    <View style={[styles.container, { minHeight: headerBandHeight + insets.top, paddingTop: insets.top }]}>
      <ThemedText style={styles.title} lightColor={headerMuted} darkColor={headerMuted}>
        STEMM Lab
      </ThemedText>
      {profile ? (
        <ThemedText style={styles.details} lightColor={headerMuted} darkColor={headerMuted} numberOfLines={1}>
          {profile.firstName} · {profile.teamName} · {profile.yearLevel}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  details: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
});
