import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder?: string; filename?: string } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:         options.folder ?? 'brazilianclean',
        public_id:      options.filename,
        resource_type:  'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(url: string) {
  try {
    // Extract public_id from the Cloudinary URL
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (match?.[1]) {
      await cloudinary.uploader.destroy(match[1]);
    }
  } catch {
    // Non-critical — just log
    console.warn('[cloudinary] delete failed for', url);
  }
}
