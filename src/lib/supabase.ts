import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export const AUDIT_PHOTOS_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'experience-audit-photos';

/**
 * Upload an image blob to Supabase Storage.
 * Returns public URL or null if storage fails/is not configured.
 */
export async function uploadPhotoToSupabase(blob: Blob): Promise<{ url: string } | null> {
  if (!supabase) return null;

  try {
    const ext = blob.type.split('/')[1] || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `photos/${fileName}`;

    let targetBucket = AUDIT_PHOTOS_BUCKET;
    let uploadRes = await supabase.storage
      .from(targetBucket)
      .upload(filePath, blob, {
        contentType: blob.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    // Fallback secundario a 'audit-photos' por si el bucket fue creado con ese nombre
    if (uploadRes.error && targetBucket !== 'audit-photos') {
      const fallbackRes = await supabase.storage
        .from('audit-photos')
        .upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });
      if (!fallbackRes.error) {
        targetBucket = 'audit-photos';
        uploadRes = fallbackRes;
      }
    }

    if (uploadRes.error) {
      console.warn('Supabase storage upload error (will fallback to Data URL):', uploadRes.error.message);
      return null;
    }

    const { data } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (err) {
    console.warn('Failed to upload photo to Supabase storage:', err);
    return null;
  }
}
