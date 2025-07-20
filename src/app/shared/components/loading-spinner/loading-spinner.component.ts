import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-container" *ngIf="isLoading">
      <ion-spinner [name]="spinnerType" [color]="color"></ion-spinner>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styleUrls: ['./loading-spinner.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class LoadingSpinnerComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = '';
  @Input() spinnerType: string = 'bubbles';
  @Input() color: string = 'primary';
}
