# API Documentation - Inventory Management App

## Overview
This document provides detailed API documentation for all services, interfaces, and methods in the inventory management application.

## Core Interfaces

### IAuthService
Authentication service interface providing user management and authentication capabilities.

```typescript
interface IAuthService {
  currentUser$: Observable<User | null>;
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
```

#### Methods

##### signInWithGoogle()
Initiates Google OAuth authentication flow.

**Signature**: `signInWithGoogle(): Promise<User | null>`

**Returns**: 
- `Promise<User | null>` - Resolves to User object on success, null if cancelled

**Throws**:
- `Error` - If Google Auth is not initialized or authentication fails

**Example**:
```typescript
try {
  const user = await authService.signInWithGoogle();
  if (user) {
    console.log('Signed in as:', user.name);
  }
} catch (error) {
  console.error('Google sign-in failed:', error);
}
```

##### registerWithEmail(email, password, name)
Creates a new user account with email/password authentication.

**Signature**: `registerWithEmail(email: string, password: string, name: string): Promise<User>`

**Parameters**:
- `email` (string): Valid email address
- `password` (string): Password (minimum 6 characters)
- `name` (string): User's display name

**Returns**: 
- `Promise<User>` - Resolves to created User object (without password field)

**Throws**:
- `Error` - If email already exists, invalid input, or registration fails

**Validation Rules**:
- Email must be valid format
- Password must be at least 6 characters
- Name cannot be empty

**Example**:
```typescript
try {
  const user = await authService.registerWithEmail(
    'user@example.com', 
    'securepassword123', 
    'John Doe'
  );
  console.log('User registered:', user);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

##### signInWithEmail(email, password)
Authenticates user with email and password.

**Signature**: `signInWithEmail(email: string, password: string): Promise<User>`

**Parameters**:
- `email` (string): User's email address
- `password` (string): User's password

**Returns**: 
- `Promise<User>` - Resolves to authenticated User object (without password)

**Throws**:
- `Error` - If credentials are invalid or user doesn't exist

**Example**:
```typescript
try {
  const user = await authService.signInWithEmail('user@example.com', 'password');
  console.log('Signed in successfully:', user);
} catch (error) {
  console.error('Sign-in failed:', error.message);
}
```

##### requestPasswordReset(email)
Initiates password reset process for a user.

**Signature**: `requestPasswordReset(email: string): Promise<void>`

**Parameters**:
- `email` (string): User's email address

**Returns**: 
- `Promise<void>` - Resolves when reset token is generated

**Throws**:
- `Error` - If user not found or email is invalid

**Side Effects**:
- Generates a reset token and expiry time
- Stores token in user record
- In production, would send email with reset link

##### resetPassword(email, token, newPassword)
Resets user password using provided token.

**Signature**: `resetPassword(email: string, token: string, newPassword: string): Promise<void>`

**Parameters**:
- `email` (string): User's email address
- `token` (string): Valid reset token
- `newPassword` (string): New password (minimum 6 characters)

**Returns**: 
- `Promise<void>` - Resolves when password is successfully reset

**Throws**:
- `Error` - If token is invalid, expired, or new password doesn't meet requirements

---

### IInventoryService
Inventory management service interface providing CRUD operations for inventory items.

```typescript
interface IInventoryService {
  getInventory(): InventoryItem[];
  getItem(id: string): InventoryItem | undefined;
  addItem(item: CreateInventoryItem): void;
  updateItem(id: string, updatedItem: UpdateInventoryItem): void;
  deleteItem(id: string): void;
}
```

#### Methods

##### getInventory()
Retrieves all inventory items.

**Signature**: `getInventory(): InventoryItem[]`

**Returns**: 
- `InventoryItem[]` - Array of all inventory items

**Example**:
```typescript
const items = inventoryService.getInventory();
console.log(`Found ${items.length} items in inventory`);
```

##### getItem(id)
Retrieves a specific inventory item by ID.

**Signature**: `getItem(id: string): InventoryItem | undefined`

**Parameters**:
- `id` (string): Unique identifier of the item

**Returns**: 
- `InventoryItem | undefined` - The item if found, undefined otherwise

**Example**:
```typescript
const item = inventoryService.getItem('1234567890_abc123def');
if (item) {
  console.log('Item found:', item.name);
} else {
  console.log('Item not found');
}
```

##### addItem(item)
Adds a new inventory item.

**Signature**: `addItem(item: CreateInventoryItem): void`

**Parameters**:
- `item` (CreateInventoryItem): Item data without ID, timestamp, and calculated fields

**Side Effects**:
- Generates unique ID
- Sets creation timestamp
- Calculates surface area if dimensions provided
- Saves to storage

**Example**:
```typescript
const newItem: CreateInventoryItem = {
  name: 'Wooden Board',
  quantity: 5,
  category: 'Materials',
  price: 25.99,
  description: 'Pine wood board for construction',
  dimensions: {
    length: 96,
    width: 12,
    thickness: 0.75,
    unit: 'in'
  }
};

inventoryService.addItem(newItem);
```

##### updateItem(id, updatedItem)
Updates an existing inventory item.

**Signature**: `updateItem(id: string, updatedItem: UpdateInventoryItem): void`

**Parameters**:
- `id` (string): Unique identifier of the item to update
- `updatedItem` (UpdateInventoryItem): Partial item data with updates

**Side Effects**:
- Updates lastModified timestamp
- Recalculates surface area if quantity or dimensions changed
- Saves changes to storage

**Example**:
```typescript
inventoryService.updateItem('1234567890_abc123def', {
  quantity: 10,
  price: 29.99,
  description: 'Updated description'
});
```

##### deleteItem(id)
Removes an inventory item.

**Signature**: `deleteItem(id: string): void`

**Parameters**:
- `id` (string): Unique identifier of the item to delete

**Side Effects**:
- Removes item from inventory
- Updates storage

**Example**:
```typescript
inventoryService.deleteItem('1234567890_abc123def');
```

---

### IWorkProgressService
Work progress management service for saving and restoring user work state.

```typescript
interface IWorkProgressService {
  saveWorkProgress(data: any): Promise<void>;
  getWorkProgress(userId?: string): Promise<WorkProgress | null>;
  clearWorkProgress(userId?: string): Promise<void>;
  restoreWorkProgress(): Promise<void>;
}
```

#### Methods

##### saveWorkProgress(data)
Saves current work progress for the authenticated user.

**Signature**: `saveWorkProgress(data: any): Promise<void>`

**Parameters**:
- `data` (any): Application state data to save

**Returns**: 
- `Promise<void>` - Resolves when data is saved

**Side Effects**:
- Associates data with current user ID
- Updates lastSaved timestamp
- Saves to persistent storage

##### getWorkProgress(userId?)
Retrieves work progress for specified or current user.

**Signature**: `getWorkProgress(userId?: string): Promise<WorkProgress | null>`

**Parameters**:
- `userId` (string, optional): User ID, defaults to current user

**Returns**: 
- `Promise<WorkProgress | null>` - Resolves to progress data or null if none found

##### clearWorkProgress(userId?)
Clears work progress for specified or current user.

**Signature**: `clearWorkProgress(userId?: string): Promise<void>`

**Parameters**:
- `userId` (string, optional): User ID, defaults to current user

**Returns**: 
- `Promise<void>` - Resolves when progress is cleared

---

### IStorageService
Storage abstraction service providing consistent data persistence.

```typescript
interface IStorageService {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

#### Methods

##### get(key)
Retrieves data by key from storage.

**Signature**: `get(key: string): Promise<any>`

**Parameters**:
- `key` (string): Storage key

**Returns**: 
- `Promise<any>` - Resolves to stored data or null if not found

**Storage Strategy**:
- Primary: Capacitor Filesystem API
- Fallback: localStorage (web compatibility)

##### set(key, value)
Stores data with specified key.

**Signature**: `set(key: string, value: any): Promise<void>`

**Parameters**:
- `key` (string): Storage key
- `value` (any): Data to store (will be JSON serialized)

**Returns**: 
- `Promise<void>` - Resolves when data is saved

---

## SurfaceAreaCalculatorService

Specialized service for calculating surface areas of inventory items.

### Methods

##### calculateSurfaceArea(dimensions, quantity)
Calculates total surface area for given dimensions and quantity.

**Signature**: `calculateSurfaceArea(dimensions: InventoryDimensions, quantity: number): SurfaceArea`

**Parameters**:
- `dimensions` (InventoryDimensions): Item dimensions with unit
- `quantity` (number): Number of items

**Returns**: 
- `SurfaceArea` - Object with value, unit, and formatted string

**Calculation Logic**:
- **3D Objects** (thickness > 0): `2 × (L×W + L×T + W×T) × Quantity`
- **2D Objects** (thickness = 0): `L×W × Quantity`

**Unit Conversion**:
All results converted to square feet for consistency.

**Supported Units**:
- `cm` - Centimeters
- `mm` - Millimeters
- `in` - Inches
- `m` - Meters
- `ft` - Feet

**Example**:
```typescript
const dimensions: InventoryDimensions = {
  length: 10,
  width: 5,
  thickness: 2,
  unit: 'ft'
};

const surfaceArea = calculator.calculateSurfaceArea(dimensions, 3);
console.log(surfaceArea.formatted); // "420.00 ft²"
```

##### validateDimensions(dimensions)
Validates that dimensions are suitable for calculation.

**Signature**: `validateDimensions(dimensions: InventoryDimensions): boolean`

**Parameters**:
- `dimensions` (InventoryDimensions): Dimensions to validate

**Returns**: 
- `boolean` - True if valid (length and width > 0)

**Validation Rules**:
- Length must be greater than 0
- Width must be greater than 0
- Thickness can be 0 (for 2D objects)

---

## Data Models

### User
User account information and authentication data.

```typescript
interface User {
  id: string;                    // Unique user identifier
  email: string;                 // User's email address
  name: string;                  // Display name
  imageUrl?: string;             // Profile image URL (Google OAuth)
  registeredAt: string;          // ISO timestamp of registration
  authMethod: 'email' | 'google'; // Authentication method used
  password?: string;             // Hashed password (email auth only)
  resetToken?: string;           // Password reset token
  resetTokenExpiry?: string;     // Token expiry timestamp
}
```

### InventoryItem
Complete inventory item with calculated fields.

```typescript
interface InventoryItem {
  id: string;                    // Unique item identifier
  name: string;                  // Item name
  quantity: number;              // Number of items
  category?: string;             // Item category
  price?: number;               // Unit price
  description?: string;          // Item description
  dimensions?: InventoryDimensions; // Physical dimensions
  weight?: Weight;              // Item weight
  totalSurfaceArea?: SurfaceArea; // Calculated surface area
  timestamp: string;            // Creation timestamp (ISO)
  dateAdded: string;           // Formatted creation date
  lastModified?: string;       // Last modification date
}
```

### CreateInventoryItem
Input model for creating new inventory items.

```typescript
interface CreateInventoryItem {
  name: string;                 // Required: Item name
  quantity: number;             // Required: Number of items
  category?: string;            // Optional: Item category
  price?: number;              // Optional: Unit price
  description?: string;         // Optional: Description
  dimensions?: InventoryDimensions; // Optional: Physical dimensions
  weight?: Weight;             // Optional: Item weight
}
```

### UpdateInventoryItem
Input model for updating existing inventory items.

```typescript
interface UpdateInventoryItem {
  name?: string;                // Optional: New item name
  quantity?: number;            // Optional: New quantity
  description?: string;         // Optional: New description
  dimensions?: InventoryDimensions; // Optional: New dimensions
}
```

### InventoryDimensions
Physical dimensions of an inventory item.

```typescript
interface InventoryDimensions {
  length: number;               // Length measurement
  width: number;                // Width measurement
  thickness: number;            // Thickness measurement (0 for 2D items)
  unit: string;                // Measurement unit (cm, mm, in, m, ft)
}
```

### SurfaceArea
Calculated surface area with formatting.

```typescript
interface SurfaceArea {
  value: number;                // Numeric value in square feet
  unit: string;                // Unit string ('ft²')
  formatted: string;           // Formatted display string
}
```

---

## Error Handling

### Common Error Scenarios

#### Authentication Errors
- **Invalid Credentials**: Email/password combination not found
- **User Already Exists**: Email already registered during registration
- **Google Auth Failed**: OAuth flow interrupted or failed
- **Password Too Short**: Password less than 6 characters
- **Invalid Email**: Email format validation failed
- **Reset Token Expired**: Password reset token has expired
- **Reset Token Invalid**: Password reset token not found or invalid

#### Inventory Errors
- **Item Not Found**: Requested item ID doesn't exist
- **Invalid Dimensions**: Length or width <= 0
- **Storage Full**: Device storage space exhausted
- **Calculation Error**: Surface area calculation failed

#### Storage Errors
- **File System Error**: Capacitor filesystem operation failed
- **Permission Denied**: App doesn't have storage permission
- **Data Corruption**: Stored data is malformed or corrupted
- **Quota Exceeded**: Storage quota exceeded

### Error Response Format
All service methods throw Error objects with descriptive messages:

```typescript
try {
  await authService.signInWithEmail(email, password);
} catch (error) {
  // error.message contains user-friendly error description
  console.error('Authentication failed:', error.message);
}
```

---

## Usage Examples

### Complete Authentication Flow

```typescript
// Registration
try {
  const user = await authService.registerWithEmail(
    'newuser@example.com',
    'securepassword',
    'New User'
  );
  console.log('Registration successful:', user);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Login
try {
  const user = await authService.signInWithEmail(
    'user@example.com',
    'password'
  );
  console.log('Login successful:', user);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Google OAuth
try {
  const user = await authService.signInWithGoogle();
  if (user) {
    console.log('Google sign-in successful:', user);
  } else {
    console.log('Google sign-in cancelled');
  }
} catch (error) {
  console.error('Google sign-in failed:', error.message);
}
```

### Complete Inventory Management Flow

```typescript
// Add item with dimensions
const newItem: CreateInventoryItem = {
  name: 'Plywood Sheet',
  quantity: 10,
  category: 'Building Materials',
  price: 45.99,
  description: '3/4 inch plywood sheet',
  dimensions: {
    length: 48,
    width: 96,
    thickness: 0.75,
    unit: 'in'
  }
};

inventoryService.addItem(newItem);

// Get all items
const allItems = inventoryService.getInventory();
console.log(`Total items: ${allItems.length}`);

// Search for items
const searchResults = inventoryService.searchItems('plywood');
console.log(`Found ${searchResults.length} matching items`);

// Update quantity
const item = allItems.find(i => i.name.includes('Plywood'));
if (item) {
  inventoryService.updateItem(item.id, { quantity: 15 });
}

// Calculate total inventory value
const totalValue = inventoryService.getTotalValue();
console.log(`Total inventory value: $${totalValue.toFixed(2)}`);
```

---

*Last Updated: January 2025*
*API Version: 2.0.0*
