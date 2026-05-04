import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },

  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'locations/:id',
    loadComponent: () =>
      import('./features/locations/location-detail/location-detail.component').then(
        m => m.LocationDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'activities/create',
    loadComponent: () =>
      import('./features/activities/create-activity/create-activity.component').then(
        m => m.CreateActivityComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'activities/:id',
    loadComponent: () =>
      import('./features/activities/activity-detail/activity-detail.component').then(
        m => m.ActivityDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: 'home' },
];
