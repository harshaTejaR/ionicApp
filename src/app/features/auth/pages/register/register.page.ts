import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { ServiceFactory, IAuthService } from '../../../../core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText, CommonModule, FormsModule]
})
export class RegisterPage implements OnInit {

  email: string = '';
  password: string = '';
  name: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  private authService: IAuthService;

  constructor(
    private serviceFactory: ServiceFactory,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline });
    this.authService = this.serviceFactory.createAuthService();
  }

  ngOnInit() {}

  async register() {
    if (!this.name || !this.email || !this.password) {
      this.showToast('Please fill in all fields', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.registerWithEmail(this.email, this.password, this.name);
      this.showToast('Registration successful!', 'success');
      this.router.navigate(['/tabs']);
    } catch (error: any) {
      this.showToast(error.message, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
}
