import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { SoundPollutionActivityAttempt } from '@/constants/sound-pollution-attempt';
import { formatDisplayDb } from '@/lib/decibel-metering';

type SoundPollutionAttemptSummaryProps = {
  attempt: SoundPollutionActivityAttempt;
};

export function SoundPollutionAttemptSummary({ attempt }: SoundPollutionAttemptSummaryProps) {
  return (
    <>
      {attempt.actions.map((action, index) => (
        <ThemedText key={index} style={styles.line}>
          Action {index + 1}: {formatDisplayDb(action.loudestDb)}
          {action.howMade ? ` · ${action.howMade}` : ''}
        </ThemedText>
      ))}
      {attempt.actions.map((action, index) =>
        action.location ? (
          <ThemedText key={`loc-${index}`} style={styles.line}>
            Action {index + 1} location: {action.location.latitude.toFixed(6)},{' '}
            {action.location.longitude.toFixed(6)} (±{Math.round(action.location.accuracy)} m)
          </ThemedText>
        ) : null
      )}
      {attempt.actions.map((action, index) =>
        action.soundZone ? (
          <ThemedText key={`zone-${index}`} style={styles.line}>
            Action {index + 1} sound zone: {action.soundZone.radiusM} m radius at{' '}
            {action.soundZone.latitude.toFixed(6)}, {action.soundZone.longitude.toFixed(6)}
          </ThemedText>
        ) : null
      )}
      {attempt.uploadedVideo ? (
        <ThemedText style={styles.line}>Video: {attempt.uploadedVideo}</ThemedText>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  line: { fontSize: 14, marginTop: 4 },
});
