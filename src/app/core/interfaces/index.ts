// User interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  registeredAt: string;
  authMethod: 'email' | 'google';
  password?: string; // Only for email auth (hashed)
  resetToken?: string; // For password reset
  resetTokenExpiry?: string; // ISO string for expiry
}

export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  newPassword: string;
}

// Inventory interfaces
export interface InventoryDimensions {
  length: number;
  width: number;
  thickness: number;
  unit: string;
}

export interface Weight {
  value: number;
  unit: string;
}

export interface SurfaceArea {
  value: number;
  unit: string;
  formatted: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  price?: number;
  description?: string;
  dimensions?: InventoryDimensions;
  weight?: Weight;
  totalSurfaceArea?: SurfaceArea;
  timestamp: string;
  dateAdded: string;
  lastModified?: string;
}

export interface CreateInventoryItem {
  name: string;
  quantity: number;
  category?: string;
  price?: number;
  description?: string;
  dimensions?: InventoryDimensions;
  weight?: Weight;
}

export interface UpdateInventoryItem {
  name?: string;
  quantity?: number;
  description?: string;
  dimensions?: InventoryDimensions;
}

// Work Progress interfaces
export interface WorkProgress {
  userId: string;
  lastSaved: string;
  data: any;
  inventoryData?: any[];
  currentTab?: string;
  formData?: any;
}

export interface AppState {
  inventoryData: any[];
  currentTab: string;
  formData: any;
  timestamp: string;
}

// Service interfaces
export interface IAuthService {
  currentUser$: import('rxjs').Observable<User | null>;
  signInWithGoogle(): Promise<User | null>;
  registerWithEmail(email: string, password: string, name: string): Promise<User>;
  signInWithEmail(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getCurrentUserSync(): User | null;
  getUserByEmail(email: string): User | undefined;
  isAuthenticated(): boolean;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(email: string, token: string, newPassword: string): Promise<void>;
}

export interface IInventoryService {
  getInventory(): InventoryItem[];
  getItem(id: string): InventoryItem | undefined;
  addItem(item: CreateInventoryItem): void;
  updateItem(id: string, updatedItem: UpdateInventoryItem): void;
  deleteItem(id: string): void;
}

export interface IWorkProgressService {
  saveWorkProgress(data: any): Promise<void>;
  getWorkProgress(userId?: string): Promise<WorkProgress | null>;
  clearWorkProgress(userId?: string): Promise<void>;
  restoreWorkProgress(): Promise<void>;
}

// Factory interfaces
export interface IServiceFactory {
  createAuthService(): IAuthService;
  createInventoryService(): IInventoryService;
  createWorkProgressService(): IWorkProgressService;
}

// Storage interfaces
export interface IStorageService {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
