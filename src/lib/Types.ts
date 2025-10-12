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
}

export interface Maintenance {
  id: string;
  assetId: string;
  brandName: string;
  productName: string;
  maintenanceTitle: string;
  maintenanceDescription: string;
  maintenanceDueDate: string;
  maintenanceStatus: string;
  purchaseLocation: string;
  costPaid: number;
  preserveFromPrior: boolean;
  requiredTools: string[];
  toolLocation: string;
}