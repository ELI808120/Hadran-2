
export enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SELECTION_IN_PROGRESS = 'SELECTION_IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface MenuCategory {
  id: string;
  title: string;
  limit: number;
  items: MenuItem[];
}

export interface MenuTemplate {
  id: string;
  name: string;
  categories: MenuCategory[];
}

export interface EventRequest {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  eventDate: string;
  location: string; // New field
  guestCount: number;
  status: OrderStatus;
  createdAt: string;
  selectedMenuId?: string;
  selections?: Record<string, string[]>; // categoryId -> [itemIds]
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
}
