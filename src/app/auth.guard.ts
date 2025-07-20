import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServiceFactory, IAuthService } from './core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  private authService: IAuthService;
  
  constructor(
    private serviceFactory: ServiceFactory,
    private router: Router
  ) {
    this.authService = this.serviceFactory.createAuthService();
  }

canActivate(): boolean {
    const user = this.authService.getCurrentUserSync();
    
    if (user) {
      return true;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
