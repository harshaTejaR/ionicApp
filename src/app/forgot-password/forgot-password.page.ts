import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonText, IonSpinner, CommonModule, FormsModule]
})
export class ForgotPasswordPage implements OnInit {
  email: string = '';
  isLoading: boolean = false;
  message: string = '';
  error: string = '';
  resetToken: string = '';
  showTokenDisplay: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  async requestReset() {
    if (!this.email) {
      this.error = 'Please enter your email address';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.message = '';

    try {
      await this.authService.requestPasswordReset(this.email);
      
      // In a real app, you would send an email with the reset token
      // For demo purposes, we'll display the token and show instructions
      const user = this.authService.getUserByEmail(this.email);
      if (user && user.resetToken) {
        this.resetToken = user.resetToken;
        this.showTokenDisplay = true;
        this.message = 'Password reset token generated! In a real app, this would be sent to your email.';
      }
    } catch (error: any) {
      this.error = error.message || 'Failed to process password reset request';
    } finally {
      this.isLoading = false;
    }
  }

  goToResetPassword() {
    this.router.navigate(['/reset-password'], {
      queryParams: { email: this.email, token: this.resetToken }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
