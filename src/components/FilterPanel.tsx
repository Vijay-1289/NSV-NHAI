
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';

// Static list of major Indian highways
const ALL_HIGHWAYS = [
  'NH 1', 'NH 2', 'NH 3', 'NH 4', 'NH 5', 'NH 6', 'NH 7', 'NH 8', 'NH 9', 'NH 10',
  'NH 11', 'NH 12', 'NH 13', 'NH 14', 'NH 15', 'NH 16', 'NH 17', 'NH 18', 'NH 19', 'NH 20',
  'NH 21', 'NH 22', 'NH 23', 'NH 24', 'NH 25', 'NH 26', 'NH 27', 'NH 28', 'NH 29', 'NH 30',
  'NH 31', 'NH 32', 'NH 33', 'NH 34', 'NH 35', 'NH 36', 'NH 37', 'NH 38', 'NH 39', 'NH 40',
  'NH 41', 'NH 42', 'NH 43', 'NH 44', 'NH 45', 'NH 46', 'NH 47', 'NH 48', 'NH 49', 'NH 50',
  'NH 51', 'NH 52', 'NH 53', 'NH 54', 'NH 55', 'NH 56', 'NH 57', 'NH 58', 'NH 59', 'NH 60',
  'NH 61', 'NH 62', 'NH 63', 'NH 64', 'NH 65', 'NH 66', 'NH 67', 'NH 68', 'NH 69', 'NH 70',
  'NH 71', 'NH 72', 'NH 73', 'NH 74', 'NH 75', 'NH 76', 'NH 77', 'NH 78', 'NH 79', 'NH 80',
  'NH 81', 'NH 82', 'NH 83', 'NH 84', 'NH 85', 'NH 86', 'NH 87', 'NH 88'
];

interface FilterPanelProps {
  filters: {
    dateRange: string;
    distressLevel: string;
    location: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const [highwayData, setHighwayData] = useState<any[]>([]);
  const [selectedHighwayData, setSelectedHighwayData] = useState<any[]>([]);

  useEffect(() => {
    // Load and parse the Excel file
    fetch('/Comparison Delhi Vadodara Pkg 9 (Road Signage).xlsx')
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        setHighwayData(data);
      });
  }, []);

  useEffect(() => {
    // Filter data for the selected highway
    if (filters.location && filters.location !== 'all' && highwayData.length > 0) {
      const highwayCol = 'NH';
      if (highwayCol && highwayData[0] && highwayData[0][highwayCol] !== undefined) {
        setSelectedHighwayData(highwayData.filter((row: any) => String(row[highwayCol]).trim() === filters.location));
      }
    } else {
      setSelectedHighwayData([]);
    }
  }, [filters.location, highwayData]);

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
              {ALL_HIGHWAYS.map((hw) => (
                <SelectItem key={hw} value={hw}>{hw}</SelectItem>
              ))}
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
      {/* Pavement Condition Monitoring Data */}
      {selectedHighwayData.length > 0 && (
        <div className="mt-4 bg-slate-900/80 p-3 rounded text-xs text-slate-200 max-h-60 overflow-y-auto">
          <div className="font-semibold mb-2">Pavement Condition Monitoring Data</div>
          <table className="w-full text-left">
            <thead>
              <tr>
                {Object.keys(selectedHighwayData[0]).map((col) => (
                  <th key={col} className="pr-2 pb-1 border-b border-slate-700">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedHighwayData.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="pr-2 py-1 border-b border-slate-800">{val as string}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
