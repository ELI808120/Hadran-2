
import { supabase } from './supabase';
import { EventRequest, OrderStatus } from '../types';

// --- Helper functions for case conversion ---

const snakeToCamel = (str: string) => str.replace(/([-_][a-z])/g, (group) =>
  group.toUpperCase().replace('-', '').replace('_', '')
);

const camelToSnake = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const convertKeys = (obj: any, converter: (key: string) => string): any => {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[converter(key)] = obj[key];
    }
  }
  return newObj;
};

export const databaseService = {
  async saveRequest(request: Omit<EventRequest, 'id' | 'status' | 'createdAt'>) {
    const snakeCaseRequest = convertKeys(request, camelToSnake);

    const { data, error } = await supabase
      .from('event_requests')
      .insert([{ ...snakeCaseRequest, status: OrderStatus.PENDING }])
      .select()
      .single();
    
    if (error) throw error;
    return convertKeys(data, snakeToCamel) as EventRequest;
  },

  async getRequests() {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(d => convertKeys(d, snakeToCamel)) as EventRequest[];
  },

  async getRequestById(id: string) {
    const { data, error } = await supabase
      .from('event_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return convertKeys(data, snakeToCamel) as EventRequest | null;
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
