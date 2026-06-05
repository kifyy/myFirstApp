import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { EarthquakeActivityAttempt } from '@/constants/earthquake-attempt';
import { formatOneDecimal } from '@/lib/measurement-input';

type EarthquakeAttemptSummaryProps = {
  attempt: EarthquakeActivityAttempt;
};

export function EarthquakeAttemptSummary({ attempt }: EarthquakeAttemptSummaryProps) {
  return (
    <>
      {attempt.designs.map((design, index) => (
        <ThemedText key={index} style={styles.line}>
          Design {index + 1}: {design.description || '—'} · {formatOneDecimal(design.movementCm)} cm
        </ThemedText>
      ))}
      {attempt.uploadedVideo ? (
        <ThemedText style={styles.line}>Video: {attempt.uploadedVideo}</ThemedText>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  line: { fontSize: 14, marginTop: 4 },
});
