export interface TrafficData {
  lat: number;
  lon: number;
  congestion_level: 'low' | 'medium' | 'high' | 'severe';
  speed: number; // km/h
  volume: number; // vehicles per hour
  delay: number; // minutes
  road_type: string;
  timestamp: number;
}

export interface TrafficSegment {
  start: [number, number];
  end: [number, number];
  traffic_data: TrafficData;
}

export class TrafficService {
  // Mock traffic data - replace with real API calls
  static async getTrafficData(lat: number, lon: number): Promise<TrafficData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate realistic traffic data based on location and time
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    
    let congestionLevel: 'low' | 'medium' | 'high' | 'severe';
    let speed: number;
    let volume: number;
    let delay: number;
    
    if (isRushHour && !isWeekend) {
      congestionLevel = Math.random() > 0.7 ? 'severe' : 'high';
      speed = 15 + Math.random() * 25; // 15-40 km/h
      volume = 800 + Math.random() * 400; // 800-1200 vehicles/hour
      delay = 5 + Math.random() * 15; // 5-20 minutes
    } else if (isWeekend) {
      congestionLevel = Math.random() > 0.8 ? 'medium' : 'low';
      speed = 40 + Math.random() * 30; // 40-70 km/h
      volume = 200 + Math.random() * 300; // 200-500 vehicles/hour
      delay = Math.random() * 5; // 0-5 minutes
    } else {
      congestionLevel = Math.random() > 0.6 ? 'medium' : 'low';
      speed = 30 + Math.random() * 40; // 30-70 km/h
      volume = 400 + Math.random() * 400; // 400-800 vehicles/hour
      delay = Math.random() * 8; // 0-8 minutes
    }
    
    return {
      lat,
      lon,
      congestion_level: congestionLevel,
      speed,
      volume,
      delay,
      road_type: 'highway',
      timestamp: Date.now()
    };
  }

  static async getTrafficAlongRoute(route: [number, number][]): Promise<TrafficSegment[]> {
    const segments: TrafficSegment[] = [];
    
    for (let i = 0; i < route.length - 1; i++) {
      const start = route[i];
      const end = route[i + 1];
      const midLat = (start[0] + end[0]) / 2;
      const midLon = (start[1] + end[1]) / 2;
      
      const trafficData = await this.getTrafficData(midLat, midLon);
      
      segments.push({
        start,
        end,
        traffic_data: trafficData
      });
    }
    
    return segments;
  }

  static getTrafficColor(congestionLevel: string): string {
    switch (congestionLevel) {
      case 'low':
        return '#10b981'; // Green
      case 'medium':
        return '#f59e0b'; // Yellow
      case 'high':
        return '#f97316'; // Orange
      case 'severe':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  }

  static getTrafficSeverity(congestionLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (congestionLevel) {
      case 'low':
        return 'low';
      case 'medium':
        return 'medium';
      case 'high':
        return 'high';
      case 'severe':
        return 'critical';
      default:
        return 'low';
    }
  }

  // For future integration with Mapbox Traffic API
  static async getMapboxTrafficData(bbox: [number, number, number, number]): Promise<any> {
    // This would be replaced with actual Mapbox Traffic API call
    // const MAPBOX_ACCESS_TOKEN = 'your_mapbox_token';
    // const response = await fetch(
    //   `https://api.mapbox.com/traffic/v1/mapbox/driving-traffic/${bbox.join(',')}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
    // );
    // return response.json();
    
    throw new Error('Mapbox Traffic API not implemented yet');
  }
} 