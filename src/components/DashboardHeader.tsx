
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/integrations/supabase/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  userRole: UserRole;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userRole }) => {
  const navigate = useNavigate();

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'user': return 'Normal User';
      case 'inspector': return 'Highway Inspector';
      case 'engineer': return 'Engineer';
      default: return 'User';
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
      } else {
        navigate('/auth');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error signing out. Please try again.');
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
                Switch Dashboard
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate('/dashboard/user')}>
                Normal User Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/inspector')}>
                Inspector Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/engineer')}>
                Engineer Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="outline" 
            className="text-white border-slate-600 hover:bg-slate-700"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
