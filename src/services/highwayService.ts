import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type HighwayIssue = Database['public']['Tables']['highway_issues']['Row'];
type HighwayIssueInsert = Database['public']['Tables']['highway_issues']['Insert'];
type HighwayIssueUpdate = Database['public']['Tables']['highway_issues']['Update'];

export class HighwayService {
  // Get all highway issues
  static async getHighwayIssues(): Promise<HighwayIssue[]> {
    const { data, error } = await supabase
      .from('highway_issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get issues by status
  static async getIssuesByStatus(status: string): Promise<HighwayIssue[]> {
    const { data, error } = await supabase
      .from('highway_issues')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create new highway issue
  static async createHighwayIssue(issue: HighwayIssueInsert): Promise<HighwayIssue> {
    const { data, error } = await supabase
      .from('highway_issues')
      .insert(issue)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update highway issue status
  static async updateIssueStatus(issueId: string, status: string): Promise<HighwayIssue> {
    const { data, error } = await supabase
      .from('highway_issues')
      .update({ status })
      .eq('id', issueId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Upload file to Supabase storage
  static async uploadFile(file: File, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('highway-issues')
      .upload(path, file);

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('highway-issues')
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  // Subscribe to real-time updates
  static subscribeToIssues(callback: (payload: any) => void) {
    return supabase
      .channel('highway_issues_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'highway_issues'
        },
        callback
      )
      .subscribe();
  }

  // Subscribe to new issues only (for inspectors)
  static subscribeToNewIssues(callback: (payload: any) => void) {
    return supabase
      .channel('new_highway_issues')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'highway_issues'
        },
        callback
      )
      .subscribe();
  }

  // Subscribe to status updates (for engineers)
  static subscribeToStatusUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('status_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'highway_issues',
          filter: 'status=eq.inspected'
        },
        callback
      )
      .subscribe();
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Update user role
  static async updateUserRole(userId: string, role: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
} 