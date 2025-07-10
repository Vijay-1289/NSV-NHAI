export async function geocodeHighwayName(name: string, apiKey: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(name + ', India')}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to geocode highway');
  const data = await response.json();
  if (!data.results || !data.results[0]) throw new Error('No results found');
  const bounds = data.results[0].geometry.bounds || data.results[0].geometry.viewport;
  const start = [bounds.southwest.lat, bounds.southwest.lng];
  const end = [bounds.northeast.lat, bounds.northeast.lng];
  return { start, end };
} 