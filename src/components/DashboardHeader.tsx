
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/integrations/supabase/types';

interface DashboardHeaderProps {
  userRole: UserRole;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userRole }) => {
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'user': return 'Normal User';
      case 'inspector': return 'Highway Inspector';
      case 'engineer': return 'Engineer';
      default: return 'User';
    }
  };

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">NSV Highway Monitoring</h1>
          <div className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
            {getRoleDisplayName(userRole)}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
            Settings
          </Button>
          <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
