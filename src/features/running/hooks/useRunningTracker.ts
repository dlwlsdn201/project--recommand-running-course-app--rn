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
    setStartedAt,
    distanceMeters,
    elapsedSeconds,
    reset,
  } = useRunningStore();

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const accumulatedDistRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('위치 권한이 필요합니다.');
    }

    await Location.requestBackgroundPermissionsAsync();

    setPhase('running');
    setStartedAt(new Date());
    startTimeRef.current = Date.now();
    accumulatedDistRef.current = 0;
    lastCoordRef.current = null;
    pausedElapsedRef.current = 0;

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
  }, [appendCoord, setPhase, setElapsedSeconds, setDistanceMeters, setCurrentPace, setStartedAt]);

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
    pausedElapsedRef.current = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
    setPhase('paused');
  }, [setPhase]);

  const resumeTracking = useCallback(async () => {
    // 이전 경과 시간을 보존하도록 시작 시간 재조정
    startTimeRef.current = Date.now() - pausedElapsedRef.current * 1000;
    setPhase('running');

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

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
    resumeTracking,
    reset,
  };
}
