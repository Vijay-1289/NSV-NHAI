// Google Roads API service for fetching snapped routes
export async function getSnappedRoadRoute(path: string, apiKey: string) {
  const url = `https://roads.googleapis.com/v1/snapToRoads?path=${encodeURIComponent(path)}&interpolate=true&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch road data');
  return response.json();
} 