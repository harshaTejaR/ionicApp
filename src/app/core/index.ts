// Export all interfaces
export * from './interfaces';

// Export all services
export * from './services/base/storage.service';
export * from './services/auth/auth.service';
export * from './services/inventory/inventory.service';
export * from './services/inventory/surface-area-calculator.service';
export * from './services/work-progress/work-progress.service';

// Export factories
export * from './factories/service.factory';

// Barrel exports for convenience
export { ServiceFactory as DefaultServiceFactory } from './factories/service.factory';
