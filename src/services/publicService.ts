import { supabase } from '@/lib/supabaseClient';

export async function getPublicBioBySlug(slug: string) {
  // Return only public fields
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, public_bio, public_slug')
    .eq('public_slug', slug)
    .eq('is_public_bio', true)
    .limit(1)
    .maybeSingle();

  if (error) return { data: null, error };
  return { data, error: null };
}
