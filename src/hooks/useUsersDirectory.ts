import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { fetchProfiles, subscribeToProfiles, type ProfileChange } from '@/services/profiles';
import type { LiveStatus, Profile } from '@/types';
import { toDataErrorMessage } from '@/utils/errors';
import { matchesQuery } from '@/utils/search';

type ProfilesById = Map<string, Profile>;

function applyChange(map: ProfilesById, change: ProfileChange) {
  if (change.type === 'delete') map.delete(change.id);
  else map.set(change.profile.id, change.profile);
}

function sortProfiles(a: Profile, b: Profile) {
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
  return a.id < b.id ? -1 : 1;
}

export function useUsersDirectory(userId: string | null) {
  const [profilesById, setProfilesById] = useState<ProfilesById>(() => new Map());
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('connecting');
  const [query, setQuery] = useState('');
  const [channelVersion, setChannelVersion] = useState(0);

  const requestId = useRef(0);
  const pendingChanges = useRef<ProfileChange[] | null>(null);
  const liveStatusRef = useRef<LiveStatus>('connecting');

  const sync = useCallback(async () => {
    const current = ++requestId.current;
    pendingChanges.current = [];
    setIsSyncing(true);
    try {
      const rows = await fetchProfiles();
      if (current !== requestId.current) return;
      const next: ProfilesById = new Map(rows.map((profile) => [profile.id, profile]));
      for (const change of pendingChanges.current ?? []) applyChange(next, change);
      setProfilesById(next);
      setHasLoaded(true);
      setError(null);
    } catch (cause) {
      if (current !== requestId.current) return;
      setError(toDataErrorMessage(cause, 'los usuarios registrados'));
    } finally {
      if (current === requestId.current) {
        pendingChanges.current = null;
        setIsSyncing(false);
      }
    }
  }, []);

  const handleChange = useCallback((change: ProfileChange) => {
    pendingChanges.current?.push(change);
    setProfilesById((previous) => {
      const next = new Map(previous);
      applyChange(next, change);
      return next;
    });
  }, []);

  const handleStatus = useCallback(
    (status: LiveStatus) => {
      const wasConnected = liveStatusRef.current === 'connected';
      liveStatusRef.current = status;
      setLiveStatus(status);
      if (status === 'connected' && !wasConnected) void sync();
    },
    [sync],
  );

  const refresh = useCallback(() => {
    if (liveStatusRef.current === 'disconnected') {
      liveStatusRef.current = 'connecting';
      setLiveStatus('connecting');
      setChannelVersion((version) => version + 1);
    }
    void sync();
  }, [sync]);

  useEffect(() => {
    if (!userId) return;
    return subscribeToProfiles({ onChange: handleChange, onStatus: handleStatus });
  }, [userId, channelVersion, handleChange, handleStatus]);

  useEffect(() => {
    return () => {
      requestId.current += 1;
      pendingChanges.current = null;
      liveStatusRef.current = 'connecting';
      setProfilesById(new Map());
      setHasLoaded(false);
      setError(null);
      setLiveStatus('connecting');
    };
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) void sync();
    }, [userId, sync]),
  );

  useEffect(() => {
    if (!userId) return;
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    if (Platform.OS !== 'web' || typeof window === 'undefined') return () => appState.remove();
    const onOffline = () => handleStatus('disconnected');
    window.addEventListener('online', refresh);
    window.addEventListener('offline', onOffline);
    return () => {
      appState.remove();
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', onOffline);
    };
  }, [userId, refresh, handleStatus]);

  const allProfiles = useMemo(() => Array.from(profilesById.values()).sort(sortProfiles), [profilesById]);

  const profiles = useMemo(
    () => allProfiles.filter((profile) => matchesQuery(query, [profile.fullName, profile.email, profile.phone])),
    [allProfiles, query],
  );

  return {
    profiles,
    total: allProfiles.length,
    isLoading: !hasLoaded && error === null,
    hasLoaded,
    isSyncing,
    error,
    liveStatus,
    query,
    setQuery,
    refresh,
  };
}
