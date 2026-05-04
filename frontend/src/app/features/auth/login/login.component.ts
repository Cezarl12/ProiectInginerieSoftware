import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center px-4">
      <div class="card w-full max-w-sm flex flex-col gap-6">
        <h1 class="text-headline-md text-on-surface">Sign in</h1>

        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
          <input class="input-field" type="email" placeholder="Email"
                 formControlName="email" autocomplete="email" />
          <input class="input-field" type="password" placeholder="Password"
                 formControlName="password" autocomplete="current-password" />

          @if (error) {
            <p class="text-error text-sm text-center">{{ error }}</p>
          }

          <button class="btn-primary" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="text-center text-on-surface-variant text-sm">
          No account?
          <a routerLink="/register" class="text-tertiary font-medium">Register</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  loading = false;
  error = '';

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => {
        this.error = 'Invalid credentials.';
        this.loading = false;
      },
    });
  }
}
