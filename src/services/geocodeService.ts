export async function geocodeHighwayName(name: string, apiKey: string) {
  // Try different search patterns for Indian highways
  const searchQueries = [
    `${name}, India`,
    `National Highway ${name}, India`,
    `NH ${name}, India`,
    `${name} highway, India`
  ];

  for (const query of searchQueries) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) continue;
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const bounds = result.geometry.bounds || result.geometry.viewport;
        
        if (bounds) {
          const start: [number, number] = [bounds.southwest.lat, bounds.southwest.lng];
          const end: [number, number] = [bounds.northeast.lat, bounds.northeast.lng];
          return { start, end };
        }
      }
    } catch (error) {
      console.error('Geocoding error for query:', query, error);
      continue;
    }
  }
  
  throw new Error('No results found for this highway name');
} 