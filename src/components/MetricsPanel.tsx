
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';

export const MetricsPanel: React.FC = () => {
  const metrics = [
    {
      title: 'Average IRI',
      value: '4.2',
      unit: 'm/km',
      change: '+0.3',
      trend: 'up',
      progress: 65,
      color: 'bg-orange-500'
    },
    {
      title: 'Crack Index',
      value: '28',
      unit: '%',
      change: '-2.1',
      trend: 'down',
      progress: 45,
      color: 'bg-yellow-500'
    },
    {
      title: 'Rutting Severity',
      value: '15',
      unit: 'mm',
      change: '+1.2',
      trend: 'up',
      progress: 30,
      color: 'bg-blue-500'
    },
    {
      title: 'Overall Health',
      value: '72',
      unit: '%',
      change: '-3.5',
      trend: 'down',
      progress: 72,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Live Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">{metric.title}</span>
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-red-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-green-400" />
                  )}
                  <span className={`text-xs ${metric.trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">
                  {metric.value}
                  <span className="text-sm text-slate-400 ml-1">{metric.unit}</span>
                </span>
              </div>
              <Progress value={metric.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-red-900/50 to-red-800/50 backdrop-blur-sm border-red-700/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-200">Critical Alert</p>
              <p className="text-xs text-red-300">3 segments require immediate attention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
