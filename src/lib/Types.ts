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

export type BorrowRequestStatus =
  | "Pending"
  | "Approved"
  | "Denied"
  | "Returned"
  | "Cancelled";

export interface BorrowRequest {
  id: string;
  assetId: string;
  ownerUserId: string;
  borrowerUserId: string;
  status: BorrowRequestStatus;
  requestedAt: string;
  requestedFrom?: string | null;
  requestedUntil?: string | null;
  message?: string | null;
  reviewedAt?: string | null;
  dueAt?: string | null;
  returnedAt?: string | null;
  ownerNote?: string | null;
}

export interface BorrowAssetSummary {
  id: string;
  itemName: string;
  brandName?: string | null;
  category?: string | null;
  currentLocation?: string | null;
  images: string[];
  status: string;
}

export interface BorrowUserSummary {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
}

export interface BorrowRequestSummary {
  request: BorrowRequest;
  asset: BorrowAssetSummary;
  counterparty: BorrowUserSummary;
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
