import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [noAuthGuard],
  },

  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'locations/propose',
    loadComponent: () =>
      import('./features/locations/propose-location/propose-location.component').then(
        m => m.ProposeLocationComponent,
      ),
    canActivate: [authGuard],
  },
  // Defensive alias: any stray link to /propose redirects to the canonical route
  { path: 'propose', redirectTo: 'locations/propose', pathMatch: 'full' },
  {
    path: 'locations/:id',
    loadComponent: () =>
      import('./features/locations/location-detail/location-detail.component').then(
        m => m.LocationDetailComponent,
      ),
    canActivate: [authGuard],
  },

  // specific activities routes BEFORE the generic /activities list
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
    path: 'activities',
    loadComponent: () =>
      import('./features/activities/activities-list/activities-list.component').then(
        m => m.ActivitiesListComponent,
      ),
    canActivate: [authGuard],
  },

  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },

  {
    path: 'users/:id',
    loadComponent: () =>
      import('./features/athletes/athlete-profile.component').then(m => m.AthleteProfileComponent),
    canActivate: [authGuard],
  },

  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard],
  },

  { path: '**', redirectTo: 'home' },
];
