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
  // Lending-related fields (MVP)
  isAvailableToLend?: boolean; // Can others request this?
  availabilityNotes?: string;  // e.g., "Weekends only"
  maxLoanDays?: number;        // Max loan period (default 7)
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

// New MVP Types
export interface BorrowRequest {
  id: string;
  assetId: string;
  requesterId: string;          // User requesting to borrow
  ownerId: string;              // Asset owner
  status: "pending" | "approved" | "denied" | "cancelled";
  requestDate: string;          // ISO date
  proposedStartDate: string;
  proposedEndDate: string;
  message: string;              // Optional message to owner
  responseMessage?: string;     // Owner's response
  createdAt: string;
  updatedAt: string;
  // Optional denormalized fields for UI convenience
  asset?: Asset;
}

export interface Loan {
  id: string;
  assetId: string;
  borrowerId: string;
  lenderId: string;
  requestId: string;            // Reference to original request
  status: "active" | "returned" | "overdue";
  startDate: string;
  dueDate: string;
  returnDate?: string;          // When actually returned
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Optional denormalized fields for UI convenience
  asset?: Asset;
}