/**
 * Client-side upload utility for Cloudflare R2 storage.
 * Bypasses Vercel serverless payload limits by using presigned URLs with fallback.
 */

export async function uploadFileToR2(
  file: File,
  folder = 'general',
  onProgress?: (percent: number) => void
): Promise<string> {
  const adminKey = typeof window !== 'undefined' ? (localStorage.getItem('ug_admin_key') || '') : '';

  // 1. Request presigned upload URL from server
  const presignRes = await fetch('/api/admin/upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-passkey': adminKey,
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || (file.name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'),
      folder,
    }),
  });

  if (!presignRes.ok) {
    const errData = await presignRes.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to get upload authorization (HTTP ${presignRes.status})`);
  }

  const { uploadUrl, publicUrl, contentType } = await presignRes.json();

  // 2. Direct upload to Cloudflare R2 using XMLHttpRequest (allows progress tracking and avoids CORS issue where possible)
  try {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', contentType || file.type || 'application/octet-stream');

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve();
        } else {
          reject(new Error(`Direct storage upload returned status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network or CORS error during direct storage upload'));
      };

      xhr.send(file);
    });

    return publicUrl;
  } catch (directErr) {
    console.warn('[uploadFileToR2] Direct PUT upload failed, checking fallback...', directErr);

    // Fallback: If file is under 4MB, upload via server endpoint /api/admin/upload
    if (file.size <= 4.2 * 1024 * 1024) {
      if (onProgress) onProgress(50);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);

      const fallbackRes = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-passkey': adminKey },
        body: fd,
      });

      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        if (data.success && data.url) {
          if (onProgress) onProgress(100);
          return data.url;
        }
      }
    }

    throw new Error(
      `Could not upload "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)}MB). If uploading large video, please ensure CORS is allowed on your R2 bucket, or paste a direct video link.`
    );
  }
}
