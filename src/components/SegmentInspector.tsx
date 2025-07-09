
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Camera, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SegmentInspectorProps {
  segment: any;
  onClose: () => void;
}

export const SegmentInspector: React.FC<SegmentInspectorProps> = ({ segment, onClose }) => {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'needs-repair': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'needs-repair': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">
            Segment Inspector
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Segment Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Segment ID</span>
            <span className="text-white font-mono">{segment?.id || 'SEG-001'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Timestamp</span>
            <span className="text-white text-sm">{segment?.timestamp || '2024-01-15 14:30'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Severity</span>
            <Badge variant={segment?.severity === 'critical' ? 'destructive' : 'secondary'}>
              {segment?.severity || 'medium'}
            </Badge>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white">Distress Metrics</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">IRI (International Roughness Index)</span>
                <span className="text-white font-medium">{segment?.iri || '4.2'} m/km</span>
              </div>
              <Progress value={(segment?.iri || 4.2) * 10} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Crack Index</span>
                <span className="text-white font-medium">{segment?.crackIndex || '28'}%</span>
              </div>
              <Progress value={segment?.crackIndex || 28} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">Rutting Severity</span>
                <span className="text-white font-medium">{segment?.rutting || '15'} mm</span>
              </div>
              <Progress value={(segment?.rutting || 15) * 2} className="h-2" />
            </div>
          </div>
        </div>

        {/* Status Management */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">Inspection Status</h3>
          <div className="grid grid-cols-1 gap-2">
            {['pending', 'needs-repair', 'approved'].map((statusOption) => (
              <Button
                key={statusOption}
                variant={status === statusOption ? 'default' : 'outline'}
                size="sm"
                className={`justify-start ${status === statusOption ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'}`}
                onClick={() => setStatus(statusOption)}
              >
                {getStatusIcon(statusOption)}
                <span className="ml-2 capitalize">{statusOption.replace('-', ' ')}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">Inspector Notes</h3>
          <Textarea
            placeholder="Add your inspection notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 resize-none"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Report
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Save Inspection
        </Button>
      </CardContent>
    </Card>
  );
};
