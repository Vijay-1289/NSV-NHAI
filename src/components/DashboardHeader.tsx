
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Settings, User, MapPin, Activity, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface DashboardHeaderProps {
  userRole: 'inspector' | 'supervisor';
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userRole }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate('/auth');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Highway Inspector</h1>
              <p className="text-sm text-slate-400">Pavement Condition Monitoring</p>
            </div>
          </div>
          
          <Badge 
            variant={userRole === 'supervisor' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {userRole}
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-slate-300">
            <Activity className="w-4 h-4 text-green-500" />
            <span>Live Data Active</span>
          </div>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-slate-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">3</span>
            </div>
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5 text-slate-300" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <User className="w-5 h-5 text-slate-300" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-300 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
