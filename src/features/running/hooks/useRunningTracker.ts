// src/features/running/hooks/useRunningTracker.ts
import { useCallback, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { GPS_UPDATE_INTERVAL_MS, GPS_DISTANCE_INTERVAL_METERS } from '@/shared/config/constants';
import { calcDistanceMeters } from '@/shared/lib/routeParser';
import { useRunningStore } from '../store/runningStore';

export function useRunningTracker() {
  const {
    phase,
    trackedCoords,
    setPhase,
    appendCoord,
    setElapsedSeconds,
    setDistanceMeters,
    setCurrentPace,
    distanceMeters,
    elapsedSeconds,
    reset,
  } = useRunningStore();

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const accumulatedDistRef = useRef<number>(0);

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('위치 권한이 필요합니다.');
    }

    await Location.requestBackgroundPermissionsAsync();

    setPhase('running');
    startTimeRef.current = Date.now();
    accumulatedDistRef.current = 0;
    lastCoordRef.current = null;

    // 타이머 시작
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    // GPS 위치 추적 시작
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: GPS_UPDATE_INTERVAL_MS,
        distanceInterval: GPS_DISTANCE_INTERVAL_METERS,
      },
      ({ coords }) => {
        const newCoord = { latitude: coords.latitude, longitude: coords.longitude };
        appendCoord(newCoord);

        if (lastCoordRef.current) {
          const delta = calcDistanceMeters(lastCoordRef.current, newCoord);
          accumulatedDistRef.current += delta;
          setDistanceMeters(accumulatedDistRef.current);

          const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
          if (accumulatedDistRef.current > 0 && elapsed > 0) {
            const paceSecPerKm = elapsed / (accumulatedDistRef.current / 1000);
            setCurrentPace(Math.round(paceSecPerKm));
          }
        }

        lastCoordRef.current = newCoord;
      }
    );
  }, [appendCoord, setPhase, setElapsedSeconds, setDistanceMeters, setCurrentPace]);

  const stopTracking = useCallback(() => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase('finished');
  }, [setPhase]);

  const pauseTracking = useCallback(() => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPhase('paused');
  }, [setPhase]);

  useEffect(() => {
    return () => {
      locationSubscription.current?.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    phase,
    trackedCoords,
    distanceMeters,
    elapsedSeconds,
    startTracking,
    stopTracking,
    pauseTracking,
    reset,
  };
}
