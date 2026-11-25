import { createHash } from 'node:crypto';
import { prisma } from './prisma';
import { imageType, publicUrl, putObject } from './storage';
import { logError, logInfo } from './logger';

// One-off move of the files uploaded to Cloudinary before the switch to Spaces.
// Runs at every boot and finds nothing once all are moved. A URL is only rewritten
// after its copy is stored, so a failure leaves the old, still-working URL in place.
// Keys come from a hash of the old URL, so two instances moving the same file write
// the same object. shortcut: delete this file and its call in instrumentation.ts
// once the admin log shows "0 left".
const OLD = '%res.cloudinary.com%';

type Row = { kind: 'avatars' | 'gallery' | 'leads' | 'private' | 'videos'; url: string; owner: string | null };

export async function migrateCloudinaryFiles(): Promise<void> {
  if (!process.env.SPACES_KEY) return; // storage not configured here (local dev)

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT 'avatars' AS kind, "avatarUrl" AS url, NULL AS owner FROM "User" WHERE "avatarUrl" LIKE ${OLD}
    UNION SELECT 'gallery', url, NULL FROM "WorkPhoto" WHERE url LIKE ${OLD}
    UNION SELECT 'leads', p, NULL FROM "Lead", unnest(photos) AS p WHERE p LIKE ${OLD}
    UNION SELECT 'private', d, "cleanerId" FROM "CleanerVerification",
          unnest(ARRAY["frontDocUrl", "backDocUrl", "selfieUrl"]) AS d WHERE d LIKE ${OLD}
    UNION SELECT 'videos', "heroVideoUrl", NULL FROM "SiteConfig" WHERE "heroVideoUrl" LIKE ${OLD}`;

  let moved = 0;
  for (const { kind, url, owner } of rows) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`download ${res.status}`);
      const bytes = Buffer.from(await res.arrayBuffer());
      const hash  = createHash('sha256').update(url).digest('hex');

      if (kind === 'videos') {
        const key = `videos/${hash.slice(0, 32)}.${url.split('.').pop()?.toLowerCase() ?? 'mp4'}`;
        await putObject(key, bytes, res.headers.get('content-type') ?? 'video/mp4', true);
        await prisma.$executeRaw`UPDATE "SiteConfig" SET "heroVideoUrl" = ${publicUrl(key)}, "heroVideoPublicId" = ${key} WHERE "heroVideoUrl" = ${url}`;
        moved++;
        continue;
      }

      const type = imageType(bytes);
      if (!type) throw new Error('not an image');

      if (kind === 'private') {
        // Same name shape as /api/upload, so /api/files serves it to the owner and admins.
        const id   = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
        const name = `v-${owner}-${id}.${type.ext}`;
        await putObject(`private/${name}`, bytes, type.mime, false);
        const next = `/api/files/${name}`;
        await prisma.$executeRaw`
          UPDATE "CleanerVerification" SET
            "frontDocUrl" = CASE WHEN "frontDocUrl" = ${url} THEN ${next} ELSE "frontDocUrl" END,
            "backDocUrl"  = CASE WHEN "backDocUrl"  = ${url} THEN ${next} ELSE "backDocUrl"  END,
            "selfieUrl"   = CASE WHEN "selfieUrl"   = ${url} THEN ${next} ELSE "selfieUrl"   END
          WHERE "cleanerId" = ${owner}`;
      } else {
        const key  = `${kind}/${hash.slice(0, 32)}.${type.ext}`;
        await putObject(key, bytes, type.mime, true);
        const next = publicUrl(key);
        if (kind === 'avatars') await prisma.$executeRaw`UPDATE "User" SET "avatarUrl" = ${next} WHERE "avatarUrl" = ${url}`;
        if (kind === 'gallery') await prisma.$executeRaw`UPDATE "WorkPhoto" SET url = ${next} WHERE url = ${url}`;
        if (kind === 'leads')   await prisma.$executeRaw`UPDATE "Lead" SET photos = array_replace(photos, ${url}::text, ${next}::text) WHERE ${url}::text = ANY(photos)`;
      }
      moved++;
    } catch (err) {
      logError(`[storage-migration] ${kind} ${url}`, err);
    }
  }

  if (rows.length > 0) logInfo('[storage-migration]', `moved ${moved} of ${rows.length} Cloudinary files to Spaces; ${rows.length - moved} left`);
}
