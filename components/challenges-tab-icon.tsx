import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useChallengeTimer } from '@/contexts/challenge-timer-context';
import { useAppTheme } from '@/hooks/use-app-theme';

type ChallengesTabIconProps = {
  color: string;
};

export function ChallengesTabIcon({ color }: ChallengesTabIconProps) {
  const { isRunning } = useChallengeTimer();
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <IconSymbol size={28} name="paperplane.fill" color={color} />
      {isRunning ? (
        <View style={[styles.dot, { backgroundColor: colors.tabDot, borderColor: colors.tabDotBorder }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: -1,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
});
