// Service to send images to backend for pavement condition prediction
export async function getPavementConditionFromBackend(imageBlobs: Blob[]) {
  const formData = new FormData();
  imageBlobs.forEach((blob, idx) => {
    formData.append('files', blob, `segment_${idx}.jpg`);
  });

  const response = await fetch('https://nsvnhai.netlify.app/predict', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to get pavement condition');
  return response.json();
} 