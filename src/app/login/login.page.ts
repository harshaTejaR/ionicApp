import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonItem, IonLabel, IonInput, IonText } from '@ionic/angular/standalone';
import { AuthService } from '../auth.service';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logoGoogle, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonItem, IonLabel, IonInput, IonText, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ logoGoogle, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
  }

  async loginWithGoogle() {
    try {
      const user = await this.authService.signInWithGoogle();
      if (user) {
        this.router.navigate(['/tabs']);
      }
    } catch (error: any) {
      this.showToast(error.message, 'danger');
    }
  }

  async loginWithEmail() {
    if (!this.email || !this.password) {
      this.showToast('Please fill in all fields', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.signInWithEmail(this.email, this.password);
      this.showToast('Login successful!', 'success');
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

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
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
