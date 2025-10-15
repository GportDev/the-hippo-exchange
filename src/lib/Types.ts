export interface Asset {
  id: string;
  itemName: string;
  brandName: string;
  category: string;
  purchaseDate: string;
  purchaseCost: number;
  currentLocation: string;
  images: string[];
  conditionDescription: string;
  ownerUserId: string;
  status: string;
  favorite: boolean;
  purchaseLocation?: string;
}

export interface Maintenance {
  id?: string;
  assetId: string;
  brandName: string;
  productName: string;
  purchaseLocation?: string;
  assetCategory: string;
  costPaid: number;
  maintenanceDueDate: string; // ISO 8601 date
  maintenanceTitle: string;
  maintenanceDescription: string;
  maintenanceStatus: "Upcoming" | "Overdue" | "Completed";
  preserveFromPrior: boolean;
  isCompleted: boolean;
  requiredTools: string[];
  toolLocation: string;
  recurrenceUnit?: 'Days' | 'Weeks' | 'Months' | 'Years';
  recurrenceInterval?: number;
}