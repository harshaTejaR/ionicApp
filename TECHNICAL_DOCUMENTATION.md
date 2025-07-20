# Technical Documentation - Inventory Management Ionic App

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Design Patterns](#design-patterns)
4. [Core Components](#core-components)
5. [Features](#features)
6. [Development Setup](#development-setup)
7. [Build and Deployment](#build-and-deployment)
8. [Testing Strategy](#testing-strategy)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)
11. [Performance Considerations](#performance-considerations)
12. [Security Implementation](#security-implementation)

## Project Overview

### Description
A cross-platform inventory management application built with Ionic Framework and Angular 19. The application provides comprehensive inventory tracking with advanced surface area calculations, user authentication (email and Google OAuth), and work progress management.

### Technology Stack
- **Framework**: Ionic 8.0.0 with Angular 19.0.0
- **Language**: TypeScript 5.6.3
- **Mobile**: Capacitor 7.4.0
- **Authentication**: Google OAuth via @codetrix-studio/capacitor-google-auth
- **Storage**: Capacitor Filesystem API with localStorage fallback
- **UI Components**: Ionic Components with custom SCSS
- **State Management**: RxJS with BehaviorSubject
- **Build Tools**: Angular CLI, ESLint, Karma/Jasmine

### Key Features
- Multi-authentication (Email/Password, Google OAuth)
- Advanced inventory management with surface area calculations
- Real-time data synchronization
- Cross-platform compatibility (iOS, Android, Web)
- Responsive design with dark/light theme support
- Work progress saving and restoration

## Architecture

### High-Level Architecture
The application follows a modular architecture with clear separation of concerns:

```
src/app/
├── core/                    # Core business logic and services
│   ├── interfaces/          # TypeScript interfaces and contracts
│   ├── services/           # Business services
│   │   ├── auth/           # Authentication services
│   │   ├── inventory/      # Inventory management services
│   │   ├── work-progress/  # Work progress services
│   │   └── base/           # Base/shared services
│   └── factories/          # Abstract Factory implementations
├── features/               # Feature modules
│   ├── auth/              # Authentication feature
│   └── inventory/         # Inventory management feature
├── shared/                # Shared components and utilities
│   ├── components/        # Reusable UI components
│   └── utils/            # Utility functions
├── components/           # Legacy components (being refactored)
├── tabs/                # Tab-based navigation
└── profile/             # User profile management
```

### Layer Separation
1. **Presentation Layer**: Pages, Components, Templates
2. **Business Logic Layer**: Services, Factories, Interfaces
3. **Data Access Layer**: Storage Services, API clients
4. **Cross-cutting Concerns**: Guards, Utilities, Shared Components

## Design Patterns

### Abstract Factory Pattern
The application implements the Abstract Factory pattern for service creation and dependency injection.

#### ServiceFactory Implementation
```typescript
interface IServiceFactory {
  createAuthService(): IAuthService;
  createInventoryService(): IInventoryService;
  createWorkProgressService(): IWorkProgressService;
}

class ServiceFactory implements IServiceFactory {
  // Production implementations
}

class MockServiceFactory implements IServiceFactory {
  // Mock implementations for testing
}
```

#### Benefits
- **Testability**: Easy to switch between production and mock services
- **Maintainability**: Centralized service creation logic
- **Flexibility**: Easy to swap implementations without changing client code
- **Consistency**: Ensures all services implement their respective interfaces

### Repository Pattern
Inventory and user data management follows the Repository pattern:

```typescript
interface IInventoryService {
  getInventory(): InventoryItem[];
  getItem(id: string): InventoryItem | undefined;
  addItem(item: CreateInventoryItem): void;
  updateItem(id: string, updatedItem: UpdateInventoryItem): void;
  deleteItem(id: string): void;
}
```

### Observer Pattern
State management uses RxJS Observables for reactive programming:

```typescript
class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
}
```

## Core Components

### Interfaces and Contracts

#### User Management
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  registeredAt: string;
  authMethod: 'email' | 'google';
  password?: string; // Hashed for email auth
  resetToken?: string;
  resetTokenExpiry?: string;
}
```

#### Inventory Management
```typescript
interface InventoryItem {
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

interface InventoryDimensions {
  length: number;
  width: number;
  thickness: number; // Changed from height for surface area calculations
  unit: string;
}
```

### Core Services

#### StorageService
Central storage management with Capacitor Filesystem API and localStorage fallback:

```typescript
class StorageService implements IStorageService {
  async get(key: string): Promise<any>
  async set(key: string, value: any): Promise<void>
  async remove(key: string): Promise<void>
  async clear(): Promise<void>
  
  // Fallback methods for web compatibility
  getFromLocalStorage(key: string): any
  setToLocalStorage(key: string, value: any): void
  removeFromLocalStorage(key: string): void
}
```

#### AuthService
Comprehensive authentication with multiple providers:

```typescript
class AuthService implements IAuthService {
  // Observable for real-time user state
  currentUser$: Observable<User | null>
  
  // Authentication methods
  signInWithGoogle(): Promise<User | null>
  registerWithEmail(email: string, password: string, name: string): Promise<User>
  signInWithEmail(email: string, password: string): Promise<User>
  signOut(): Promise<void>
  
  // Password reset functionality
  requestPasswordReset(email: string): Promise<void>
  resetPassword(email: string, token: string, newPassword: string): Promise<void>
}
```

#### InventoryService
Advanced inventory management with surface area calculations:

```typescript
class InventoryService implements IInventoryService {
  // CRUD operations
  getInventory(): InventoryItem[]
  addItem(item: CreateInventoryItem): void
  updateItem(id: string, updatedItem: UpdateInventoryItem): void
  deleteItem(id: string): void
  
  // Advanced query methods
  getItemsByCategory(category: string): InventoryItem[]
  searchItems(query: string): InventoryItem[]
  getTotalItems(): number
  getTotalValue(): number
}
```

#### SurfaceAreaCalculatorService
Specialized service for surface area calculations:

```typescript
class SurfaceAreaCalculatorService {
  calculateSurfaceArea(dimensions: InventoryDimensions, quantity: number): SurfaceArea {
    // Surface Area = 2 × (L×W + L×T + W×T) for 3D objects
    // Surface Area = L×W for flat objects (thickness = 0)
  }
  
  private convertToSquareFeet(area: number, unit: string): number {
    // Converts from various units (cm, mm, in, m) to square feet
  }
}
```

## Features

### Authentication Module

#### Multi-Provider Authentication
- **Email/Password**: Secure registration and login with password hashing
- **Google OAuth**: Seamless Google Sign-In integration
- **Password Reset**: Token-based password recovery system

#### Security Features
- Password hashing using built-in crypto functions
- JWT-like token system for password reset
- Session management with automatic restoration
- Input validation and sanitization

#### Implementation Structure
```
features/auth/
├── auth.module.ts          # Feature module with routing
└── pages/
    ├── login/              # Login page (standalone component)
    ├── register/           # Registration page
    ├── forgot-password/    # Password recovery
    └── reset-password/     # Password reset confirmation
```

### Inventory Management Module

#### Advanced Inventory Features
- **Surface Area Calculation**: Automatic calculation for 3D and 2D items
- **Multiple Units Support**: cm, mm, in, m, ft with automatic conversion
- **Real-time Updates**: Live calculation updates when dimensions change
- **Category Management**: Item categorization and filtering
- **Search Functionality**: Multi-field search across items

#### Surface Area Formula
For 3D objects: `2 × (Length × Width + Length × Thickness + Width × Thickness) × Quantity`
For 2D objects: `Length × Width × Quantity`

#### Data Persistence
- Local storage using Capacitor Filesystem API
- Automatic backup to localStorage for web compatibility
- Real-time synchronization across app sessions

### Work Progress Management

#### Features
- **Session Persistence**: Automatic saving of form data and app state
- **User-linked Data**: Progress tied to authenticated users
- **Cross-session Restoration**: Restore work when returning to app
- **Data Cleanup**: Automatic cleanup on logout

### Shared Components and Utilities

#### LoadingSpinner Component
Reusable loading indicator for async operations:

```typescript
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `<ion-spinner></ion-spinner>`
})
export class LoadingSpinnerComponent {}
```

#### Format Utilities
Comprehensive formatting functions:

```typescript
class FormatUtils {
  static formatCurrency(amount: number, currency?: string): string
  static formatDate(date: Date | string): string
  static formatDateTime(date: Date | string): string
  static formatNumber(num: number, decimals?: number): string
  static formatFileSize(bytes: number): string
}
```

## Development Setup

### Prerequisites
- Node.js 18+ and npm 8+
- Ionic CLI: `npm install -g @ionic/cli`
- Angular CLI: `npm install -g @angular/cli`
- Capacitor CLI (included in project dependencies)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd myApp

# Install dependencies
npm install

# Install iOS/Android platforms (if needed)
ionic capacitor add ios
ionic capacitor add android
```

### Environment Configuration

#### Development Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  googleAuth: {
    clientId: 'your-google-client-id',
    scopes: ['profile', 'email']
  }
};
```

#### Production Environment
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  googleAuth: {
    clientId: 'your-production-google-client-id',
    scopes: ['profile', 'email']
  }
};
```

### Development Commands
```bash
# Start development server
npm start
# or
ionic serve

# Run with live reload
ionic serve --lab

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## Build and Deployment

### Web Deployment
```bash
# Build for production
npm run build

# The dist/ folder contains deployable files
# Deploy to hosting service of choice (Firebase, Netlify, etc.)
```

### Mobile Deployment

#### iOS Deployment
```bash
# Build and sync
ionic capacitor build ios

# Open in Xcode
ionic capacitor open ios

# Run on device/simulator
ionic capacitor run ios
```

#### Android Deployment
```bash
# Build and sync
ionic capacitor build android

# Open in Android Studio
ionic capacitor open android

# Run on device/emulator
ionic capacitor run android
```

## Testing Strategy

### Unit Testing
- **Framework**: Jasmine and Karma
- **Coverage**: Core services and business logic
- **Mock Services**: Abstract Factory enables easy mocking

#### Example Test Setup
```typescript
describe('AuthService', () => {
  let service: IAuthService;
  let mockFactory: MockServiceFactory;

  beforeEach(() => {
    mockFactory = new MockServiceFactory();
    service = mockFactory.createAuthService();
  });

  it('should authenticate user', async () => {
    // Test implementation
  });
});
```

### Integration Testing
- Component integration with services
- End-to-end user workflows
- Cross-platform compatibility testing

### Testing Commands
```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## API Reference

### AuthService Methods

#### signInWithGoogle()
```typescript
signInWithGoogle(): Promise<User | null>
```
Initiates Google OAuth flow and returns authenticated user.

**Returns**: Promise resolving to User object or null if cancelled
**Throws**: Error if Google Auth fails or invalid data received

#### registerWithEmail(email, password, name)
```typescript
registerWithEmail(email: string, password: string, name: string): Promise<User>
```
Creates new user account with email/password authentication.

**Parameters**:
- `email`: Valid email address
- `password`: Minimum 6 characters
- `name`: User display name

**Returns**: Promise resolving to created User object (without password)
**Throws**: Error if email exists, invalid input, or creation fails

### InventoryService Methods

#### addItem(item)
```typescript
addItem(item: CreateInventoryItem): void
```
Adds new inventory item with automatic surface area calculation.

**Parameters**:
- `item`: CreateInventoryItem object with required fields

**Side Effects**:
- Generates unique ID and timestamps
- Calculates surface area if dimensions provided
- Saves to storage immediately

#### calculateSurfaceArea(dimensions, quantity)
```typescript
calculateSurfaceArea(dimensions: InventoryDimensions, quantity: number): SurfaceArea
```
Calculates total surface area for inventory items.

**Formula**: 
- 3D: `2 × (L×W + L×T + W×T) × Quantity`
- 2D: `L×W × Quantity` (when thickness = 0)

**Returns**: SurfaceArea object with value, unit, and formatted string

## Troubleshooting

### Common Issues

#### Google Auth Not Working
**Symptoms**: Google sign-in fails or returns null user
**Solutions**:
1. Verify Google Client ID in environment config
2. Check Google Cloud Console OAuth configuration
3. Ensure proper domain/bundle ID setup
4. Clear app data and restart

#### Storage Issues
**Symptoms**: Data not persisting between app sessions
**Solutions**:
1. Check Capacitor Filesystem plugin installation
2. Verify app permissions for file system access
3. Check localStorage fallback in browser
4. Clear app storage and test again

#### Build Errors
**Symptoms**: TypeScript compilation errors
**Solutions**:
1. Run `npm install` to update dependencies
2. Check TypeScript version compatibility
3. Verify all imports are correctly typed
4. Clear node_modules and reinstall

#### Surface Area Calculations Incorrect
**Symptoms**: Wrong surface area values displayed
**Solutions**:
1. Verify dimension units are consistent
2. Check thickness value (0 for 2D items)
3. Validate input numbers are positive
4. Review unit conversion factors

### Debug Mode
Enable debug logging by setting development environment:

```typescript
// Enable debug mode
if (!environment.production) {
  console.debug('Debug mode enabled');
}
```

## Performance Considerations

### Optimization Strategies

#### Lazy Loading
- Feature modules loaded on demand
- Reduced initial bundle size
- Faster app startup time

#### OnPush Change Detection
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

#### Efficient Data Management
- Local storage for offline capability
- Minimal data transfers
- Reactive updates with RxJS

#### Memory Management
- Unsubscribe from observables in ngOnDestroy
- Proper cleanup in service destruction
- Efficient object references

### Performance Monitoring
- Track bundle size: `npm run build -- --stats-json`
- Monitor memory usage in development tools
- Test on lower-end devices for real-world performance

## Security Implementation

### Authentication Security
- **Password Hashing**: Secure password storage using built-in crypto
- **Session Management**: Secure token-based sessions
- **Input Validation**: Comprehensive input sanitization
- **OAuth Integration**: Secure Google OAuth implementation

### Data Security
- **Local Encryption**: Sensitive data encrypted in storage
- **Secure Transport**: HTTPS for all external communications
- **Token Expiration**: Automatic session timeout
- **Data Validation**: Server-side and client-side validation

### Best Practices Implemented
1. **Principle of Least Privilege**: Users access only their own data
2. **Defense in Depth**: Multiple security layers
3. **Secure by Default**: Secure configurations as default
4. **Regular Updates**: Keep dependencies up to date

---

## Changelog

### Version 2.0.0 - Major Refactoring
- Implemented Abstract Factory pattern for services
- Migrated to modular feature-based architecture
- Added comprehensive surface area calculations
- Refactored authentication with multi-provider support
- Enhanced TypeScript interfaces and type safety
- Improved error handling and user experience
- Added comprehensive test coverage setup

### Version 1.1.0 - Surface Area Enhancement
- Replaced 'height' with 'thickness' in dimensions
- Implemented advanced surface area calculations
- Added unit conversion support
- Enhanced inventory display with calculated areas

### Version 1.0.0 - Initial Implementation
- Basic inventory management functionality
- Email/password authentication
- Local storage implementation
- Ionic framework setup

---

*Last Updated: January 2025*
*Author: Development Team*
*Version: 2.0.0*
