
import { EventRequest, OrderStatus } from '../types';

const DB_KEY = 'hadran_catering_db';

interface DBState {
  requests: EventRequest[];
}

const getInitialState = (): DBState => {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) return JSON.parse(stored);
  return { requests: [] };
};

export const mockDb = {
  saveRequest: (request: Omit<EventRequest, 'id' | 'status' | 'createdAt'>): EventRequest => {
    const state = getInitialState();
    const newRequest: EventRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    state.requests.push(newRequest);
    localStorage.setItem(DB_KEY, JSON.stringify(state));
    return newRequest;
  },

  getRequests: (): EventRequest[] => {
    return getInitialState().requests;
  },

  getRequestById: (id: string): EventRequest | undefined => {
    return getInitialState().requests.find(r => r.id === id);
  },

  updateRequestStatus: (id: string, status: OrderStatus): void => {
    const state = getInitialState();
    const request = state.requests.find(r => r.id === id);
    if (request) {
      request.status = status;
      localStorage.setItem(DB_KEY, JSON.stringify(state));
    }
  },

  updateSelections: (id: string, menuId: string, selections: Record<string, string[]>): void => {
    const state = getInitialState();
    const request = state.requests.find(r => r.id === id);
    if (request) {
      request.selectedMenuId = menuId;
      request.selections = selections;
      request.status = OrderStatus.COMPLETED;
      localStorage.setItem(DB_KEY, JSON.stringify(state));
    }
  }
};
