import { supabase } from '@/lib/supabase';

export interface ExportUploadResult {
  key: string;
  url: string;
}

export async function uploadExportToR2(
  blob: Blob,
  filename: string
): Promise<ExportUploadResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const response = await fetch('/api/upload-export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename,
      contentType: blob.type,
      data: base64,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return await response.json();
}

export function getExportUrl(key: string): string {
  const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  return `${publicUrl}/${key}`;
}
