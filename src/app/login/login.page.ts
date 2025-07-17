import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../auth.service';
import { addIcons } from 'ionicons';
import { logoGoogle } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ logoGoogle });
  }

  ngOnInit() {
  }

  async loginWithGoogle() {
    const user = await this.authService.signInWithGoogle();
    if (user) {
      this.router.navigate(['/tabs']);
    }
  }

}
