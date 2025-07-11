
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { HighwayService } from '@/services/highwayService';

export const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to real-time notifications
    const subscription = HighwayService.subscribeToNewIssues((payload) => {
      console.log('New issue notification:', payload);
      addNotification({
        id: Date.now(),
        type: 'new_issue',
        message: `New issue reported: ${payload.new.description}`,
        severity: payload.new.severity,
        time: 'Just now',
        issueId: payload.new.id
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const issues = await HighwayService.getHighwayIssues();
      
      // Convert recent issues to notifications
      const recentIssues = issues.slice(0, 5); // Show last 5 issues
      const issueNotifications = recentIssues.map(issue => ({
        id: issue.id,
        type: 'issue',
        message: `Issue reported: ${issue.description}`,
        severity: issue.severity,
        time: getTimeAgo(issue.created_at),
        issueId: issue.id,
        status: issue.status
      }));
      
      setNotifications(issueNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep max 10 notifications
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string, status?: string) => {
    if (status === 'resolved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'inspected') return <Clock className="w-4 h-4 text-blue-500" />;
    return <AlertTriangle className="w-4 h-4 text-orange-500" />;
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <Bell className="w-5 h-5 mr-2 text-yellow-400" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center">
          <Bell className="w-5 h-5 mr-2 text-yellow-400" />
          Real-time Notifications
          {notifications.length > 0 && (
            <Badge className="ml-2 bg-red-500 text-white">
              {notifications.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center text-slate-400 py-4">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type, notification.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white mb-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {notification.time}
                    </span>
                    <Badge className={getSeverityColor(notification.severity)}>
                      {notification.severity}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={loadNotifications}
            className="w-full mt-3 px-3 py-2 text-sm bg-slate-700/50 text-slate-300 rounded hover:bg-slate-600/50 transition-colors"
          >
            Refresh
          </button>
        )}
      </CardContent>
    </Card>
  );
};
