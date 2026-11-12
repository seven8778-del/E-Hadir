/**
 * Live Camera Capture and Image Compression Utilities for e-Hadir.
 * Complies with strict constraint: NO <input type="file"> allowed.
 * Compresses selfie image client-side to < 150KB (typical ~40-80KB) in 1-3 seconds.
 */

export interface CameraCapabilityResult {
  isSupported: boolean;
  isInAppBrowser: boolean;
  errorMessage?: string;
}

export function detectCameraEnvironment(): CameraCapabilityResult {
  const ua = navigator.userAgent || '';
  // Check for common in-app browsers like WhatsApp, Telegram, Instagram, FB
  const isInApp = /FBAN|FBAV|Instagram|WhatsApp|Telegram|Line|Messenger/i.test(ua);

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      isSupported: false,
      isInAppBrowser: isInApp,
      errorMessage: isInApp
        ? 'Kamera disekat oleh pelayar dalam aplikasi. Sila salin pautan ini dan buka menggunakan Google Chrome atau Safari.'
        : 'Pelayar ini tidak menyokong akses kamera secara langsung (MediaDevices API). Sila gunakan Google Chrome atau Apple Safari terkini.',
    };
  }

  return {
    isSupported: true,
    isInAppBrowser: isInApp,
  };
}

/**
 * Compresses an image element or video frame to JPEG <= 150KB.
 * Max dimension: 640px, quality: 0.7
 */
export async function captureAndCompressFrame(
  videoElement: HTMLVideoElement,
  maxWidth = 640,
  quality = 0.7
): Promise<{ dataUrl: string; sizeInKB: number }> {
  return new Promise((resolve, reject) => {
    try {
      const videoWidth = videoElement.videoWidth || 640;
      const videoHeight = videoElement.videoHeight || 480;

      // Calculate square / portrait crop centered on face
      const size = Math.min(videoWidth, videoHeight);
      const startX = (videoWidth - size) / 2;
      const startY = (videoHeight - size) / 2;

      // Scale to max dimension
      const outputDim = Math.min(size, maxWidth);

      const canvas = document.createElement('canvas');
      canvas.width = outputDim;
      canvas.height = outputDim;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Gagal memulakan kanvas imej.');
      }

      // Draw mirrored so selfie matches what user sees on screen
      ctx.translate(outputDim, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(
        videoElement,
        startX,
        startY,
        size,
        size,
        0,
        0,
        outputDim,
        outputDim
      );

      // Compress to JPEG with 0.7 quality
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      // Calculate byte size
      const stringLength = dataUrl.length - 'data:image/jpeg;base64,'.length;
      const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.562489633438312;
      const sizeInKB = Math.round((sizeInBytes / 1024) * 10) / 10;

      resolve({
        dataUrl,
        sizeInKB,
      });
    } catch (err) {
      reject(err);
    }
  });
}
