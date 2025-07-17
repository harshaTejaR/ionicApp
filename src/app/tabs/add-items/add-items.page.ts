import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonList, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent, 
  IonIcon, 
  IonText, 
  IonSelect, 
  IonSelectOption, 
  IonTextarea, 
  IonSpinner, 
  IonToast,
  IonChip,
  IonLabel
} from '@ionic/angular/standalone';
import { InventoryService } from '../../inventory/inventory.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  addCircleOutline, 
  saveOutline, 
  closeOutline, 
  checkmarkCircleOutline, 
  alertCircleOutline,
  resizeOutline,
  cubeOutline,
  documentTextOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-add-items',
  templateUrl: './add-items.page.html',
  styleUrls: ['./add-items.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonList, 
    IonItem, 
    IonInput, 
    IonButton, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle, 
    IonCardContent, 
    IonIcon, 
    IonText, 
    IonSelect, 
    IonSelectOption, 
    IonTextarea, 
    IonSpinner, 
    IonToast,
    IonChip,
    IonLabel,
    CommonModule, 
    FormsModule
  ]
})
export class AddItemsPage implements OnInit {
  itemName: string = '';
  quantity: number = 1;
  category: string = '';
  price: number = 0;
  description: string = '';
  length: number = 0;
  width: number = 0;
  height: number = 0;
  dimensionUnit: string = 'm';
  weight: number = 0;
  weightUnit: string = 'kg';
  isLoading: boolean = false;
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;

  constructor(private inventoryService: InventoryService, private router: Router) {
    addIcons({
      addCircleOutline,
      saveOutline,
      closeOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      resizeOutline,
      cubeOutline,
      documentTextOutline
    });
  }

  ngOnInit() {
    // Initialize with default values
    this.resetForm();
  }

  async saveItem(form: NgForm) {
    if (form.valid && this.itemName.trim() && this.quantity > 0) {
      this.isLoading = true;
      
      try {
        // Simulate API call delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newItem = {
          name: this.itemName.trim(),
          quantity: this.quantity,
          category: this.category || 'other',
          price: this.price || 0,
          description: this.getFullDescription(),
          dimensions: {
            length: this.length,
            width: this.width,
            height: this.height,
            unit: this.dimensionUnit
          },
          weight: {
            value: this.weight,
            unit: this.weightUnit
          }
        };
        
        this.inventoryService.addItem(newItem);
        
        // Show success feedback
        this.showSuccessToast = true;
        
        // Reset form
        this.resetForm();
        form.resetForm();
        
        // Navigate to inventory tab after a short delay
        setTimeout(() => {
          this.router.navigate(['/tabs/inventory']);
        }, 1500);
        
      } catch (error) {
        console.error('Error adding item:', error);
        this.showErrorToast = true;
      } finally {
        this.isLoading = false;
      }
    } else {
      // Show validation errors
      this.markFormGroupTouched(form);
    }
  }

  cancel() {
    this.resetForm();
  }

  private resetForm() {
    this.itemName = '';
    this.quantity = 1;
    this.category = '';
    this.price = 0;
    this.length = 0;
    this.width = 0;
    this.height = 0;
    this.dimensionUnit = 'm'; // Default unit is meter as per user preference
    this.weight = 0;
    this.weightUnit = 'kg';
    this.description = '';
  }

  private markFormGroupTouched(form: NgForm) {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      control.markAsTouched();
    });
  }

  hasDimensions(): boolean {
    return this.length > 0 || this.width > 0 || this.height > 0;
  }

  getDimensionSummary(): string {
    return `${this.length.toFixed(2)} x ${this.width.toFixed(2)} x ${this.height.toFixed(2)} ${this.dimensionUnit}`;
  }

  private getFullDescription(): string {
    let description = this.description.trim();
    if (this.hasDimensions()) {
      const dimensionText = `Dimensions: ${this.getDimensionSummary()}`;
      description = description ? `${description}. ${dimensionText}` : dimensionText;
    }
    return description;
  }
}
