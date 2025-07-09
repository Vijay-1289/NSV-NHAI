import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

const ROLES = ['Inspector', 'Supervisor', 'Admin'];
const INTERESTS = ['Pavement Condition', 'Traffic', 'Safety', 'Maintenance'];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const user = supabase.auth.getUser();
  const [form, setForm] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    role: '',
    organization: '',
    location: '',
    experience: '',
    interests: [] as string[],
    notifications: false,
    profilePicture: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'interests') {
      setForm(f => ({
        ...f,
        interests: checked
          ? [...f.interests, value]
          : f.interests.filter(i => i !== value),
      }));
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(f => ({ ...f, profilePicture: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Upload profile picture if present
      let profilePictureUrl = '';
      if (form.profilePicture) {
        const { data, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(`public/${Date.now()}_${form.profilePicture.name}`, form.profilePicture);
        if (uploadError) throw uploadError;
        profilePictureUrl = data?.path ? supabase.storage.from('profile-pictures').getPublicUrl(data.path).publicUrl : '';
      }
      // Save profile data
      const { error: upsertError } = await supabase.from('profiles').upsert({
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        organization: form.organization,
        location: form.location,
        experience: form.experience,
        interests: form.interests,
        notifications: form.notifications,
        profile_picture: profilePictureUrl,
        updated_at: new Date().toISOString(),
      });
      if (upsertError) throw upsertError;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <form className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-center">Complete Your Profile</h2>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div>
          <label className="block font-medium">Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} required className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input name="email" value={form.email} disabled className="input input-bordered w-full bg-gray-100" />
        </div>
        <div>
          <label className="block font-medium">Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block font-medium">Role</label>
          <select name="role" value={form.role} onChange={handleChange} required className="input input-bordered w-full">
            <option value="">Select Role</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium">Organization/Company</label>
          <input name="organization" value={form.organization} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block font-medium">Location/Region</label>
          <input name="location" value={form.location} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block font-medium">Experience (years)</label>
          <input name="experience" value={form.experience} onChange={handleChange} type="number" min="0" className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block font-medium">Areas of Interest</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <label key={interest} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  name="interests"
                  value={interest}
                  checked={form.interests.includes(interest)}
                  onChange={handleChange}
                />
                {interest}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium">Receive Notifications?</label>
          <input type="checkbox" name="notifications" checked={form.notifications} onChange={handleChange} />
        </div>
        <div>
          <label className="block font-medium">Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save and Continue'}
        </button>
      </form>
    </div>
  );
};

export default Onboarding; 