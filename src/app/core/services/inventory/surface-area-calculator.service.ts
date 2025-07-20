import { Injectable } from '@angular/core';
import { InventoryDimensions, SurfaceArea } from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class SurfaceAreaCalculatorService {

  calculateSurfaceArea(dimensions: InventoryDimensions, quantity: number): SurfaceArea {
    let singleItemSurfaceArea: number;
    
    if (dimensions.thickness > 0) {
      // Surface Area = 2 × (Length × Width + Length × Thickness + Width × Thickness)
      singleItemSurfaceArea = 2 * (
        (dimensions.length * dimensions.width) + 
        (dimensions.length * dimensions.thickness) + 
        (dimensions.width * dimensions.thickness)
      );
    } else {
      // Surface Area = Length × Width (for flat items)
      singleItemSurfaceArea = dimensions.length * dimensions.width;
    }
    
    const totalSurfaceArea = singleItemSurfaceArea * quantity;
    const surfaceAreaInSqFt = this.convertToSquareFeet(totalSurfaceArea, dimensions.unit);
    
    return {
      value: surfaceAreaInSqFt,
      unit: 'ft²',
      formatted: `${surfaceAreaInSqFt.toFixed(2)} ft²`
    };
  }

  private convertToSquareFeet(area: number, unit: string): number {
    const conversionFactors: { [key: string]: number } = {
      'cm': 0.00107639,    // 1 cm² = 0.00107639 ft²
      'mm': 0.0000107639,  // 1 mm² = 0.0000107639 ft²
      'in': 0.00694444,    // 1 in² = 0.00694444 ft²
      'm': 10.7639,        // 1 m² = 10.7639 ft²
      'ft': 1              // Already in ft²
    };

    const factor = conversionFactors[unit] || 1;
    return area * factor;
  }

  validateDimensions(dimensions: InventoryDimensions): boolean {
    return dimensions.length > 0 && dimensions.width > 0;
  }
}
