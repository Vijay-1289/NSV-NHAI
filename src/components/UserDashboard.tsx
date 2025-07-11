import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Upload, Bell, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import { UserRole } from '@/integrations/supabase/types';

interface UserDashboardProps {
  userRole: UserRole;
  onImageUpload: (file: File, location: [number, number]) => void;
  onPinPlacement: (location: [number, number], severity: string) => void;
  onStatusUpdate: (issueId: string, status: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  userRole,
  onImageUpload,
  onPinPlacement,
  onStatusUpdate
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Mock data for notifications and issues
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New issue reported on NH 48', time: '2 min ago', severity: 'high' },
    { id: 2, message: 'Image uploaded for NH 7', time: '5 min ago', severity: 'medium' }
  ]);

  const [activeIssues, setActiveIssues] = useState([
    { id: 1, location: [28.7041, 77.1025], description: 'Pothole on NH 48', severity: 'high', status: 'reported' },
    { id: 2, location: [19.076, 72.8777], description: 'Crack on NH 7', severity: 'medium', status: 'inspected' }
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile && description) {
      // Mock location - in real app, get from map click
      const mockLocation: [number, number] = [28.7041, 77.1025];
      onImageUpload(selectedFile, mockLocation);
      setSelectedFile(null);
      setDescription('');
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inspected': return <Wrench className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  if (userRole === 'user') {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-400" />
            Report Highway Issue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Upload Photo/Video</label>
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full p-2 bg-slate-700/50 border border-slate-600 text-white rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !description}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (userRole === 'inspector') {
    return (
      <div className="space-y-4">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              <Bell className="w-5 h-5 mr-2 text-yellow-400" />
              Real-time Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                  <div className="flex-1">
                    <p className="text-sm text-white">{notification.message}</p>
                    <p className="text-xs text-slate-400">{notification.time}</p>
                  </div>
                  <Badge className={getSeverityColor(notification.severity)}>
                    {notification.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-400" />
              Place Inspection Pin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Severity Assessment</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full p-2 bg-slate-700/50 border border-slate-600 text-white rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <Button
              onClick={() => {
                // Mock location - in real app, get from map click
                const mockLocation: [number, number] = [28.7041, 77.1025];
                onPinPlacement(mockLocation, severity);
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Place Pin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole === 'engineer') {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-orange-400" />
            Active Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {activeIssues.map((issue) => (
              <div key={issue.id} className="p-3 bg-slate-700/30 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(issue.status)}
                    <span className="text-sm font-medium text-white">
                      Issue #{issue.id}
                    </span>
                  </div>
                  <Badge className={getSeverityColor(issue.severity)}>
                    {issue.severity}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 mb-2">{issue.description}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onStatusUpdate(issue.id.toString(), 'inspected')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Mark Inspected
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onStatusUpdate(issue.id.toString(), 'resolved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark Resolved
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}; 