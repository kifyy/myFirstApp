import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { ParachuteActivityAttempt } from '@/constants/parachute-attempt';
import { formatVelocityEquation } from '@/lib/measurement-input';

type ParachuteAttemptSummaryProps = {
  attempt: ParachuteActivityAttempt;
};

export function ParachuteAttemptSummary({ attempt }: ParachuteAttemptSummaryProps) {
  return (
    <>
      <ThemedText style={styles.line}>
        Baseline Velocity:{' '}
        {formatVelocityEquation(attempt.dropHeightM, attempt.baselineTimeS)}
      </ThemedText>
      {attempt.parachutes.map((parachute, index) => (
        <ThemedText key={index} style={styles.line}>
          Parachute {index + 1} Velocity:{' '}
          {formatVelocityEquation(attempt.dropHeightM, parachute.timeS)}
        </ThemedText>
      ))}
      {attempt.uploadedVideo ? (
        <ThemedText style={styles.line}>Video: {attempt.uploadedVideo}</ThemedText>
      ) : null}
      {attempt.location ? (
        <ThemedView style={styles.locationBlock}>
          <ThemedText style={styles.line}>Tagged location:</ThemedText>
          <ThemedText style={styles.locationDetail}>
            {attempt.location.latitude.toFixed(6)}, {attempt.location.longitude.toFixed(6)}{' '}
            (±{Math.round(attempt.location.accuracy)} m)
          </ThemedText>
        </ThemedView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  line: { fontSize: 14, marginTop: 4 },
  locationBlock: { marginTop: 4 },
  locationDetail: { fontSize: 14, marginTop: 2 },
});
