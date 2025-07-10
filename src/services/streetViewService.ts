// Helper to get Google Street View image URL for a coordinate
export function getStreetViewImageUrl(lat: number, lng: number, apiKey: string) {
  return `https://maps.googleapis.com/maps/api/streetview?size=640x640&location=${lat},${lng}&fov=80&heading=70&pitch=0&key=${apiKey}`;
} 