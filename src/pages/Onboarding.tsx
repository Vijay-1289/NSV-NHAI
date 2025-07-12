import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { HighwayService } from '../services/highwayService';

const ROLES = [
  { value: 'user', label: 'Normal User' },
  { value: 'inspector', label: 'Highway Inspector' },
  { value: 'engineer', label: 'Engineer' }
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (role: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error('User not authenticated');
      await HighwayService.updateUserRole(user.id, role);
      navigate(`/dashboard/${role}`);
    } catch (err: any) {
      setError(err.message || 'Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Select Your Role</h2>
        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
        <div className="space-y-4">
          {ROLES.map(role => (
            <button
              key={role.value}
              className="w-full py-3 px-4 rounded bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              onClick={() => handleRoleSelect(role.value)}
              disabled={loading}
            >
              {role.label}
            </button>
          ))}
        </div>
        {loading && <div className="mt-4 text-blue-600">Saving...</div>}
      </div>
    </div>
  );
};

export default Onboarding; 