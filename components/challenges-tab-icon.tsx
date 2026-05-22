import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useChallengeTimer } from '@/contexts/challenge-timer-context';

type ChallengesTabIconProps = {
  color: string;
};

export function ChallengesTabIcon({ color }: ChallengesTabIconProps) {
  const { isRunning } = useChallengeTimer();

  return (
    <View style={styles.wrapper}>
      <IconSymbol size={28} name="paperplane.fill" color={color} />
      {isRunning ? <View style={styles.dot} /> : null}
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
    backgroundColor: '#F97316',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
