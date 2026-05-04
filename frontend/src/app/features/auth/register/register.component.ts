import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center px-4">
      <div class="card w-full max-w-sm flex flex-col gap-6">
        <h1 class="text-headline-md text-on-surface">Create account</h1>

        <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
          <input class="input-field" type="text" placeholder="Username"
                 formControlName="username" autocomplete="username" />
          <input class="input-field" type="email" placeholder="Email"
                 formControlName="email" autocomplete="email" />
          <input class="input-field" type="password" placeholder="Password (min 8 chars)"
                 formControlName="password" autocomplete="new-password" />

          @if (error) {
            <p class="text-error text-sm text-center">{{ error }}</p>
          }
          @if (success) {
            <p class="text-secondary text-sm text-center">{{ success }}</p>
          }

          <button class="btn-primary" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Creating…' : 'Create account' }}
          </button>
        </form>

        <p class="text-center text-on-surface-variant text-sm">
          Have an account?
          <a routerLink="/login" class="text-tertiary font-medium">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  loading = false;
  error = '';
  success = '';

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { username, email, password } = this.form.getRawValue();
    this.auth
      .register({ username: username!, email: email!, password: password! })
      .subscribe({
        next: res => {
          this.success = res.message;
          this.loading = false;
        },
        error: () => {
          this.error = 'Registration failed. Please try again.';
          this.loading = false;
        },
      });
  }
}
