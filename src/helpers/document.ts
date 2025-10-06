export const isImage = (mimeType: string): boolean => {
  const imageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    'image/x-icon',
    'image/heif',
    'image/heic',
  ];

  return imageMimeTypes.includes(mimeType.toLowerCase());
}