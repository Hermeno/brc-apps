import { AwsClient } from 'aws4fetch';

// File storage on DigitalOcean Spaces (S3-compatible). Public files (avatars, lead
// and gallery photos, the hero video) are served from the Space's CDN. Private ones
// (ID documents) are only readable through /api/files, after an auth check.
const BUCKET   = process.env.SPACES_BUCKET ?? '';
const ENDPOINT = `https://${BUCKET}.${process.env.SPACES_REGION}.digitaloceanspaces.com`;

let client: AwsClient | null = null;
const s3 = () => client ??= new AwsClient({
  accessKeyId:     process.env.SPACES_KEY ?? '',
  secretAccessKey: process.env.SPACES_SECRET ?? '',
  service: 's3',
  region:  'us-east-1', // what DigitalOcean documents for signing against any Spaces region
});

export const publicUrl = (key: string) => `${process.env.SPACES_CDN_URL ?? ENDPOINT}/${key}`;

export async function putObject(key: string, body: Buffer, contentType: string, isPublic: boolean): Promise<void> {
  const res = await s3().fetch(`${ENDPOINT}/${key}`, {
    method: 'PUT',
    body: new Uint8Array(body.buffer as ArrayBuffer, body.byteOffset, body.byteLength), // a view, no copy
    headers: {
      'Content-Type':  contentType,
      'x-amz-acl':     isPublic ? 'public-read' : 'private',
      'Cache-Control': isPublic ? 'public, max-age=31536000, immutable' : 'private, no-store',
    },
  });
  if (!res.ok) throw new Error(`Spaces PUT ${key}: ${res.status} ${await res.text()}`);
}

export const getObject = (key: string) => s3().fetch(`${ENDPOINT}/${key}`);

export async function deleteObject(key: string): Promise<void> {
  const res = await s3().fetch(`${ENDPOINT}/${key}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error(`Spaces DELETE ${key}: ${res.status}`);
}

// The browser's MIME type is only a claim: trust the file's first bytes instead.
// Cloudinary used to reject non-images by decoding them; this keeps that guarantee.
export function imageType(b: Uint8Array): { mime: string; ext: string } | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...b.subarray(from, to));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)                  return { mime: 'image/jpeg', ext: 'jpg' };
  if (b[0] === 0x89 && ascii(1, 4) === 'PNG')                           return { mime: 'image/png',  ext: 'png' };
  if (ascii(0, 4) === 'GIF8')                                            return { mime: 'image/gif',  ext: 'gif' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP')                 return { mime: 'image/webp', ext: 'webp' };
  return null;
}
