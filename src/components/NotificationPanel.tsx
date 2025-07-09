
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export const NotificationPanel: React.FC = () => {
  const notifications = [
    {
      id: '1',
      type: 'critical',
      title: 'Critical Rutting Detected',
      message: 'Segment NH-8-KM-45 shows severe rutting (>25mm)',
      timestamp: '2 min ago',
      icon: AlertTriangle
    },
    {
      id: '2',
      type: 'warning',
      title: 'IRI Threshold Exceeded',
      message: 'Multiple segments on NH-1 exceed comfort threshold',
      timestamp: '15 min ago',
      icon: Info
    },
    {
      id: '3',
      type: 'success',
      title: 'Inspection Completed',
      message: 'Section NH-2-KM-120 to KM-125 approved',
      timestamp: '1 hour ago',
      icon: CheckCircle
    }
  ];

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-400" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => {
          const IconComponent = notification.icon;
          return (
            <div key={notification.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <div className="flex items-start space-x-3">
                <IconComponent className={`w-4 h-4 mt-1 ${getNotificationColor(notification.type)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate">
                      {notification.title}
                    </p>
                    <Badge variant={getBadgeVariant(notification.type)} className="ml-2 text-xs">
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-400">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
