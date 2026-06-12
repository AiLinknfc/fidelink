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
  createdAt: string;
}

export interface ServiceResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
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
    createdAt: row.created_at,
  };
}

export async function getProfile(userId: string): Promise<ServiceResult<ProfileFull>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, role, avatar_url, phone, public_bio, public_slug, is_public_bio, created_at')
    .eq('id', userId)
    .maybeSingle();
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
  }
): Promise<ServiceResult<ProfileFull>> {
  const payload: Record<string, any> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.phone !== undefined) payload.phone = patch.phone;
  if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl;
  if (patch.publicBio !== undefined) payload.public_bio = patch.publicBio;
  if (patch.publicSlug !== undefined) payload.public_slug = patch.publicSlug || null;
  if (patch.isPublicBio !== undefined) payload.is_public_bio = patch.isPublicBio;

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('id, email, name, role, avatar_url, phone, public_bio, public_slug, is_public_bio, created_at')
    .single();
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
