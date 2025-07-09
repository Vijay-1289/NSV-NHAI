
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { MapView } from '@/components/MapView';
import { MetricsPanel } from '@/components/MetricsPanel';
import { FilterPanel } from '@/components/FilterPanel';
import { SegmentInspector } from '@/components/SegmentInspector';
import { NotificationPanel } from '@/components/NotificationPanel';

const Index = () => {
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [userRole, setUserRole] = useState('inspector'); // 'inspector' or 'supervisor'
  const [filters, setFilters] = useState({
    dateRange: 'today',
    distressLevel: 'all',
    location: 'all'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <DashboardHeader userRole={userRole} />
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Left Panel - Metrics and Filters */}
        <div className="w-full lg:w-80 p-4 space-y-4 overflow-y-auto">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
          <MetricsPanel />
          <NotificationPanel />
        </div>

        {/* Main Content - Map */}
        <div className="flex-1 p-4">
          <MapView 
            selectedSegment={selectedSegment}
            onSegmentSelect={setSelectedSegment}
            filters={filters}
          />
        </div>

        {/* Right Panel - Segment Inspector */}
        {selectedSegment && (
          <div className="w-full lg:w-96 p-4">
            <SegmentInspector 
              segment={selectedSegment}
              onClose={() => setSelectedSegment(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
