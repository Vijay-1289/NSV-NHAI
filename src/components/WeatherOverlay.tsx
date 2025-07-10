import React, { useState, useEffect } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { WeatherService, WeatherData } from '../services/weatherService';

interface WeatherOverlayProps {
  center: [number, number];
  radius?: number;
  gridSpacing?: number;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ 
  center, 
  radius = 50, // km
  gridSpacing = 25 // km between weather stations
}) => {
  const [weatherStations, setWeatherStations] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate grid of weather stations around the center
  const generateWeatherGrid = (centerLat: number, centerLng: number, radius: number, spacing: number) => {
    const stations: [number, number][] = [];
    const steps = Math.ceil(radius / spacing);
    
    for (let latStep = -steps; latStep <= steps; latStep++) {
      for (let lngStep = -steps; lngStep <= steps; lngStep++) {
        const lat = centerLat + (latStep * spacing / 111); // Approximate km to degrees
        const lng = centerLng + (lngStep * spacing / (111 * Math.cos(centerLat * Math.PI / 180)));
        
        // Check if within radius
        const distance = Math.sqrt(latStep * latStep + lngStep * lngStep) * spacing;
        if (distance <= radius) {
          stations.push([lat, lng]);
        }
      }
    }
    
    return stations;
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const gridPoints = generateWeatherGrid(center[0], center[1], radius, gridSpacing);
        const weatherPromises = gridPoints.map(([lat, lng]) => 
          WeatherService.getCurrentWeather(lat, lng).catch(err => {
            console.warn(`Failed to fetch weather for ${lat}, ${lng}:`, err);
            return null;
          })
        );
        
        const results = await Promise.all(weatherPromises);
        const validResults = results.filter(result => result !== null) as WeatherData[];
        
        setWeatherStations(validResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
    
    // Refresh weather data every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [center, radius, gridSpacing]);

  if (loading && weatherStations.length === 0) {
    return null; // Don't show anything while loading initially
  }

  return (
    <>
      {weatherStations.map((station, index) => {
        const severity = WeatherService.getWeatherSeverity(station.weather_main, station.rain_1h);
        const color = WeatherService.getWeatherColor(station.weather_main);
        
        return (
          <CircleMarker
            key={`weather-${index}`}
            center={[station.lat, station.lon]}
            radius={8}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: 2
            }}
          >
            <Popup>
              <div className="weather-popup">
                <div className="flex items-center gap-2 mb-2">
                  <img 
                    src={WeatherService.getWeatherIconUrl(station.weather_icon)} 
                    alt={station.weather_description}
                    className="w-8 h-8"
                  />
                  <div>
                    <h3 className="font-semibold text-sm">{station.weather_main}</h3>
                    <p className="text-xs text-gray-600">{station.weather_description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Temperature:</span>
                    <br />
                    <span className="text-blue-600">{station.temp.toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="font-medium">Feels Like:</span>
                    <br />
                    <span className="text-blue-600">{station.feels_like.toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="font-medium">Humidity:</span>
                    <br />
                    <span className="text-blue-600">{station.humidity}%</span>
                  </div>
                  <div>
                    <span className="font-medium">Wind:</span>
                    <br />
                    <span className="text-blue-600">{station.wind_speed} m/s</span>
                  </div>
                  {station.rain_1h && (
                    <div className="col-span-2">
                      <span className="font-medium">Rain (1h):</span>
                      <br />
                      <span className="text-blue-600">{station.rain_1h} mm</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="font-medium">Visibility:</span>
                    <br />
                    <span className="text-blue-600">{(station.visibility / 1000).toFixed(1)} km</span>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs">
                    <span className="font-medium">Severity:</span>{' '}
                    <span className={`px-2 py-1 rounded text-xs ${
                      severity === 'critical' ? 'bg-red-100 text-red-800' :
                      severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {severity.toUpperCase()}
                    </span>
                  </span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};

export default WeatherOverlay; 