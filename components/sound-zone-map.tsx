import { useMemo } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import MapView, { Circle, Marker, type MapPressEvent } from 'react-native-maps';

import { ThemedText } from '@/components/themed-text';
import type { SoundZoneMarker } from '@/constants/sound-pollution-attempt';
import { useAppTheme } from '@/hooks/use-app-theme';
import { parseOneDecimal, sanitizeDecimalInput } from '@/lib/measurement-input';

type SoundZoneMapProps = {
  soundZone: SoundZoneMarker | null;
  zoneRadiusM: string;
  mapCenter: { latitude: number; longitude: number } | null;
  onSoundZoneChange: (zone: SoundZoneMarker | null) => void;
  onZoneRadiusChange: (radius: string) => void;
};

const DEFAULT_REGION = {
  latitude: -33.8688,
  longitude: 151.2093,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export function SoundZoneMap({
  soundZone,
  zoneRadiusM,
  mapCenter,
  onSoundZoneChange,
  onZoneRadiusChange,
}: SoundZoneMapProps) {
  const { colors } = useAppTheme();

  const themed = useMemo(
    () =>
      StyleSheet.create({
        input: {
          borderColor: colors.borderStrong,
          backgroundColor: colors.inputBackground,
          color: colors.text,
        },
        mapPlaceholder: {
          borderColor: colors.borderStrong,
          backgroundColor: colors.card,
        },
        hint: { color: colors.muted },
      }),
    [colors]
  );

  const radiusM = parseOneDecimal(zoneRadiusM) ?? 10;

  const region = useMemo(() => {
    const center = soundZone ?? mapCenter;
    if (!center) {
      return DEFAULT_REGION;
    }
    return {
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    };
  }, [soundZone, mapCenter]);

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onSoundZoneChange({ latitude, longitude, radiusM });
  };

  const handleRadiusChange = (text: string) => {
    const sanitized = sanitizeDecimalInput(text);
    onZoneRadiusChange(sanitized);
    if (soundZone) {
      const nextRadius = parseOneDecimal(sanitized) ?? soundZone.radiusM;
      onSoundZoneChange({ ...soundZone, radiusM: nextRadius });
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.label}>Sound zone radius (metres)</ThemedText>
        <TextInput
          value={zoneRadiusM}
          onChangeText={handleRadiusChange}
          keyboardType="decimal-pad"
          placeholder="10.0"
          style={[styles.input, themed.input]}
          placeholderTextColor={colors.placeholder}
        />
        <View style={[styles.mapPlaceholder, themed.mapPlaceholder]}>
          <ThemedText style={[styles.hint, themed.hint]}>
            Map markers are available on iOS and Android. Tag a location and set the radius above.
          </ThemedText>
          {soundZone ? (
            <ThemedText style={styles.coords}>
              Zone: {soundZone.latitude.toFixed(6)}, {soundZone.longitude.toFixed(6)} ({soundZone.radiusM}{' '}
              m)
            </ThemedText>
          ) : mapCenter ? (
            <ThemedText style={styles.coords}>
              Tagged: {mapCenter.latitude.toFixed(6)}, {mapCenter.longitude.toFixed(6)}
            </ThemedText>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Map sound zone (tap map to place marker)</ThemedText>
      <ThemedText style={styles.label}>Circle radius (metres)</ThemedText>
      <TextInput
        value={zoneRadiusM}
        onChangeText={handleRadiusChange}
        keyboardType="decimal-pad"
        placeholder="10.0"
        style={[styles.input, themed.input]}
        placeholderTextColor={colors.placeholder}
      />
      <MapView style={styles.map} region={region} onPress={handleMapPress}>
        {soundZone ? (
          <>
            <Marker coordinate={{ latitude: soundZone.latitude, longitude: soundZone.longitude }} />
            <Circle
              center={{ latitude: soundZone.latitude, longitude: soundZone.longitude }}
              radius={soundZone.radiusM}
              fillColor="rgba(255, 140, 0, 0.25)"
              strokeColor="rgba(255, 140, 0, 0.9)"
              strokeWidth={2}
            />
          </>
        ) : null}
      </MapView>
      {soundZone ? (
        <ThemedText style={[styles.hint, themed.hint]}>
          Sound zone: {soundZone.latitude.toFixed(6)}, {soundZone.longitude.toFixed(6)} ·{' '}
          {soundZone.radiusM} m radius
        </ThemedText>
      ) : (
        <ThemedText style={[styles.hint, themed.hint]}>
          Tap the map to mark the loudest sound zone for this action.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  map: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 8,
  },
  mapPlaceholder: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
    gap: 8,
  },
  hint: { fontSize: 13 },
  coords: { fontSize: 14 },
});
