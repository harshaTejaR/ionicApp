import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonAvatar, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { AuthService, User } from '../auth.service';
import { addIcons } from 'ionicons';
import { logOutOutline, personCircleOutline } from 'ionicons/icons';

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
    addIcons({ logOutOutline, personCircleOutline });
  }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

}
