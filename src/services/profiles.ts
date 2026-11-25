import { requireSupabase } from '@/lib/supabase';
import type { LiveStatus, Profile } from '@/types';

const PROFILE_COLUMNS = 'id, full_name, email, phone, created_at';

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
  };
}

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .order('created_at', { ascending: false })
    .order('id', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as ProfileRow[]).map(toProfile);
}

export type ProfileChange =
  | { type: 'upsert'; profile: Profile }
  | { type: 'delete'; id: string };

interface ProfileSubscriptionHandlers {
  onChange: (change: ProfileChange) => void;
  onStatus: (status: LiveStatus) => void;
}

let channelCounter = 0;

export function subscribeToProfiles({ onChange, onStatus }: ProfileSubscriptionHandlers): () => void {
  const client = requireSupabase();
  let closedByUs = false;
  channelCounter += 1;

  const channel = client
    .channel(`directorio-perfiles-${channelCounter}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
      if (payload.eventType === 'DELETE') {
        const id = (payload.old as Partial<ProfileRow>).id;
        if (id) onChange({ type: 'delete', id });
        return;
      }
      const row = payload.new as ProfileRow;
      if (row?.id) onChange({ type: 'upsert', profile: toProfile(row) });
    })
    .subscribe((status) => {
      if (closedByUs) return;
      if (status === 'SUBSCRIBED') onStatus('connected');
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        onStatus('disconnected');
      }
    });

  return () => {
    closedByUs = true;
    void client.removeChannel(channel);
  };
}
