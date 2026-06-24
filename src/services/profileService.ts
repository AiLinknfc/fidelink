import { supabase } from '@/lib/supabaseClient';

export interface ProfileFull {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'business';
  avatarUrl: string | null;
  phone: string | null;
  publicBio: string | null;
  publicSlug: string | null;
  isPublicBio: boolean;
  publicLocation: string | null;
  publicSkills: string | null;
  publicTagline: string | null;
  profileBackgroundColor: string | null;
  createdAt: string;
}

export interface ServiceResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

const BASE_PROFILE_SELECT = 'id, email, name, role, avatar_url, phone, public_bio, public_slug, is_public_bio, created_at';
const FULL_PROFILE_SELECT = `${BASE_PROFILE_SELECT}, public_location, public_skills, public_tagline, profile_background_color`;

function isMissingProfileColumn(error: { message?: string; code?: string } | null): boolean {
  return Boolean(
    error &&
    (error.code === 'PGRST204' ||
      error.message?.includes('public_location') ||
      error.message?.includes('public_skills') ||
      error.message?.includes('public_tagline') ||
      error.message?.includes('profile_background_color'))
  );
}

function toCamel(row: any): ProfileFull {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    avatarUrl: row.avatar_url ?? null,
    phone: row.phone ?? null,
    publicBio: row.public_bio ?? null,
    publicSlug: row.public_slug ?? null,
    isPublicBio: row.is_public_bio ?? false,
    publicLocation: row.public_location ?? null,
    publicSkills: row.public_skills ?? null,
    publicTagline: row.public_tagline ?? null,
    profileBackgroundColor: row.profile_background_color ?? '#ffffff',
    createdAt: row.created_at,
  };
}

export async function getProfile(userId: string): Promise<ServiceResult<ProfileFull>> {
  const { data, error } = await supabase
    .from('profiles')
    .select(FULL_PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle();
  if (isMissingProfileColumn(error)) {
    const legacy = await supabase
      .from('profiles')
      .select(BASE_PROFILE_SELECT)
      .eq('id', userId)
      .maybeSingle();
    if (legacy.error) return { data: null, error: legacy.error };
    if (!legacy.data) return { data: null, error: null };
    return { data: toCamel(legacy.data), error: null };
  }
  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };
  return { data: toCamel(data), error: null };
}

export async function updateProfile(
  userId: string,
  patch: {
    name?: string;
    phone?: string | null;
    avatarUrl?: string | null;
    publicBio?: string | null;
    publicSlug?: string | null;
    isPublicBio?: boolean;
    publicLocation?: string | null;
    publicSkills?: string | null;
    publicTagline?: string | null;
    profileBackgroundColor?: string | null;
  }
): Promise<ServiceResult<ProfileFull>> {
  const payload: Record<string, any> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.phone !== undefined) payload.phone = patch.phone;
  if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl;
  if (patch.publicBio !== undefined) payload.public_bio = patch.publicBio;
  if (patch.publicSlug !== undefined) payload.public_slug = patch.publicSlug || null;
  if (patch.isPublicBio !== undefined) payload.is_public_bio = patch.isPublicBio;
  if (patch.publicLocation !== undefined) payload.public_location = patch.publicLocation;
  if (patch.publicSkills !== undefined) payload.public_skills = patch.publicSkills;
  if (patch.publicTagline !== undefined) payload.public_tagline = patch.publicTagline;
  if (patch.profileBackgroundColor !== undefined) payload.profile_background_color = patch.profileBackgroundColor || '#ffffff';

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select(FULL_PROFILE_SELECT)
    .single();
  if (isMissingProfileColumn(error)) {
    const {
      public_location: _publicLocation,
      public_skills: _publicSkills,
      public_tagline: _publicTagline,
      profile_background_color: _profileBackgroundColor,
      ...legacyPayload
    } = payload;

    const legacy = await supabase
      .from('profiles')
      .update(legacyPayload)
      .eq('id', userId)
      .select(BASE_PROFILE_SELECT)
      .single();
    if (legacy.error) return { data: null, error: legacy.error };
    return { data: toCamel(legacy.data), error: null };
  }
  if (error) return { data: null, error };
  return { data: toCamel(data), error: null };
}

export async function uploadAvatar(userId: string, file: File): Promise<ServiceResult<string>> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) return { data: null, error: upErr };

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  return { data: pub.publicUrl, error: null };
}
