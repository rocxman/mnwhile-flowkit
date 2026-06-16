import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set([
  'application/json',
  'application/pdf',
  'image/png',
  'image/svg+xml',
  'text/plain',
]);

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  return header.slice('Bearer '.length).trim();
}

function sanitizeFilename(filename: string): string {
  const basename = filename.split(/[\\/]/).pop() ?? 'export';
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+/, '')
    .slice(0, 120);

  return sanitized || 'export';
}

function decodeBase64Payload(data: unknown): Buffer | null {
  if (typeof data !== 'string' || data.length === 0) {
    return null;
  }

  const estimatedBytes = Math.floor((data.length * 3) / 4);
  if (estimatedBytes > MAX_UPLOAD_BYTES) {
    return null;
  }

  const buffer = Buffer.from(data, 'base64');
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_UPLOAD_BYTES) {
    return null;
  }

  return buffer;
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const supabase = createClient(
      getEnv('VITE_SUPABASE_URL'),
      getEnv('VITE_SUPABASE_ANON_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { filename, contentType, data } = req.body as {
      filename?: unknown;
      contentType?: unknown;
      data?: unknown;
    };

    if (typeof filename !== 'string' || typeof contentType !== 'string') {
      return res.status(400).json({ error: 'Missing filename or contentType' });
    }

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return res.status(415).json({ error: 'Unsupported content type' });
    }

    const body = decodeBase64Payload(data);
    if (!body) {
      return res.status(400).json({ error: 'Invalid or oversized upload data' });
    }

    const bucket = getEnv('R2_BUCKET_NAME');
    const publicUrl = getEnv('R2_PUBLIC_URL').replace(/\/$/, '');
    const safeFilename = sanitizeFilename(filename);
    const key = `exports/${userData.user.id}/${Date.now()}-${safeFilename}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    res.status(200).json({ key, url: `${publicUrl}/${key}` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error('R2 upload error:', message);
    res.status(500).json({ error: 'Upload failed' });
  }
}
