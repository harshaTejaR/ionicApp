import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonAvatar, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { AuthService, User } from '../auth.service';
import { addIcons } from 'ionicons';
import { logOutOutline, personCircleOutline, mailOutline, keyOutline, calendarOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonAvatar, IonItem, IonLabel, IonIcon, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {

  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ logOutOutline, personCircleOutline, mailOutline, keyOutline, calendarOutline, saveOutline });
  }

  ngOnInit() {
    // Use synchronous method to get current user from session storage
    this.currentUser = this.authService.getCurrentUserSync();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

}
