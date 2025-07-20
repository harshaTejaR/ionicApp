import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Import all auth-related components
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './pages/reset-password/reset-password.page';

// Auth routing
const authRoutes = [
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'register',
    component: RegisterPage
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordPage
  },
  {
    path: 'reset-password',
    component: ResetPasswordPage
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' as const
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(authRoutes)
  ]
})
export class AuthModule { }
