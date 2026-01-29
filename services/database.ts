
import { supabase } from './supabase';
import { EventRequest, OrderStatus } from '../types';

export const databaseService = {
  async saveRequest(request: Omit<EventRequest, 'id' | 'status' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('event_requests')
      .insert([{ ...request, status: OrderStatus.PENDING }])
      .select()
      .single();
    
    if (error) throw error;
    return data as EventRequest;
  },

  async getRequests() {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as EventRequest[];
  },

  async getRequestById(id: string) {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as EventRequest | null;
  },

  async updateRequestStatus(id: string, status: OrderStatus) {
    const { error } = await supabase
      .from('event_requests')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateSelections(id: string, menuId: string, selections: Record<string, string[]>) {
    const { error } = await supabase
      .from('event_requests')
      .update({ 
        selected_menu_id: menuId, 
        selections, 
        status: OrderStatus.COMPLETED 
      })
      .eq('id', id);
    
    if (error) throw error;
  }
};
