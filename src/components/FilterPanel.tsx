
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    dateRange: string;
    distressLevel: string;
    location: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-400" />
          Smart Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Date Range</label>
          <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Distress Level</label>
          <Select value={filters.distressLevel} onValueChange={(value) => updateFilter('distressLevel', value)}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Location</label>
          <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">All Highways</SelectItem>
              <SelectItem value="nh1">NH-1 (Delhi-Amritsar)</SelectItem>
              <SelectItem value="nh2">NH-2 (Delhi-Kolkata)</SelectItem>
              <SelectItem value="nh4">NH-4 (Mumbai-Chennai)</SelectItem>
              <SelectItem value="nh8">NH-8 (Delhi-Mumbai)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
          onClick={() => console.log('Refreshing data...')}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </CardContent>
    </Card>
  );
};
