export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images?: string[];
  category: string;
  season?: string;
  colors?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  cartKey?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface SeasonConfig {
  id: string;
  name: string;
  label: string;
  badge: string;
  theme: string;
  bannerTitle: string;
  bannerHighlight: string;
  bannerSubtitle: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  activeSeason: string;
  themeMode: 'warm' | 'dark';
  whatsappNumber: string;
  customBannerText?: string;
  seasons: SeasonConfig[];
}

export interface NotificationState {
  message: string;
  type: 'success' | 'error';
}
