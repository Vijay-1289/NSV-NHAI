const OPENWEATHER_API_KEY = '28531c5c9163871c9d1651f39fefe9a7';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  lat: number;
  lon: number;
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  rain_1h?: number;
  rain_3h?: number;
  visibility: number;
  clouds: number;
  dt: number;
}

export interface WeatherForecast {
  list: WeatherData[];
  city: {
    name: string;
    coord: { lat: number; lon: number };
  };
}

export class WeatherService {
  static async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      lat: data.coord.lat,
      lon: data.coord.lon,
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      wind_deg: data.wind.deg,
      weather_main: data.weather[0].main,
      weather_description: data.weather[0].description,
      weather_icon: data.weather[0].icon,
      rain_1h: data.rain?.['1h'],
      rain_3h: data.rain?.['3h'],
      visibility: data.visibility,
      clouds: data.clouds.all,
      dt: data.dt
    };
  }

  static async getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast> {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather forecast API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      list: data.list.map((item: any) => ({
        lat: data.city.coord.lat,
        lon: data.city.coord.lon,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        wind_speed: item.wind.speed,
        wind_deg: item.wind.deg,
        weather_main: item.weather[0].main,
        weather_description: item.weather[0].description,
        weather_icon: item.weather[0].icon,
        rain_1h: item.rain?.['1h'],
        rain_3h: item.rain?.['3h'],
        visibility: item.visibility,
        clouds: item.clouds.all,
        dt: item.dt
      })),
      city: {
        name: data.city.name,
        coord: data.city.coord
      }
    };
  }

  static getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  static getWeatherColor(weatherMain: string): string {
    switch (weatherMain.toLowerCase()) {
      case 'rain':
      case 'drizzle':
        return '#3b82f6'; // Blue for rain
      case 'snow':
        return '#e2e8f0'; // Light gray for snow
      case 'thunderstorm':
        return '#7c3aed'; // Purple for storms
      case 'clear':
        return '#fbbf24'; // Yellow for clear
      case 'clouds':
        return '#94a3b8'; // Gray for clouds
      case 'fog':
      case 'mist':
        return '#cbd5e1'; // Light gray for fog
      default:
        return '#6b7280'; // Default gray
    }
  }

  static getWeatherSeverity(weatherMain: string, rainAmount?: number): 'low' | 'medium' | 'high' | 'critical' {
    if (weatherMain.toLowerCase() === 'thunderstorm') return 'critical';
    if (weatherMain.toLowerCase() === 'rain' && rainAmount && rainAmount > 10) return 'high';
    if (weatherMain.toLowerCase() === 'rain') return 'medium';
    if (weatherMain.toLowerCase() === 'snow') return 'high';
    return 'low';
  }
} 