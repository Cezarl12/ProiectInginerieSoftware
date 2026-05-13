import { Component, signal, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-6 antialiased relative overflow-hidden">

      <!-- Background gradient orbs -->
      <div class="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-tertiary-fixed/10 to-transparent blur-3xl -z-10 pointer-events-none"></div>
      <div class="fixed bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-secondary-container/5 to-transparent blur-3xl -z-10 pointer-events-none"></div>

      <main class="w-full max-w-[375px] lg:max-w-lg flex flex-col items-center">

        <!-- Logo -->
        <div class="mb-12 text-center">
          <h1 class="text-3xl font-black tracking-tighter text-on-surface">ActiveZone</h1>
          <p class="text-on-surface-variant text-sm font-medium tracking-wide mt-1 uppercase">Premium Gallery</p>
        </div>

        <!-- Login Card -->
        <section class="w-full bg-surface-container-lowest rounded-xl p-8 lg:p-10 shadow-[0_40px_60px_-15px_rgba(43,52,55,0.05)]">
          <div class="mb-8">
            <h2 class="text-2xl font-bold tracking-tight text-on-surface">Welcome back</h2>
            <p class="text-on-surface-variant text-sm mt-2">Sign in to continue your journey</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="block text-xs font-bold uppercase tracking-widest text-outline ml-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="hello@activezone.com"
                class="w-full h-14 px-4 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              />
            </div>

            <!-- Password -->
            <div class="space-y-2">
              <div class="flex justify-between items-center px-1">
                <label for="password" class="block text-xs font-bold uppercase tracking-widest text-outline">
                  Password
                </label>
                <button
                  type="button"
                  (click)="forgotPassword()"
                  class="text-[10px] font-bold text-tertiary uppercase tracking-tighter hover:opacity-70 transition-opacity"
                >
                  Forgot?
                </button>
              </div>
              <div class="relative flex items-center">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full h-14 px-4 pr-12 bg-surface-container-low border-none rounded-lg text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 p-1.5 text-outline hover:text-on-surface transition-colors"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                >
                  <span class="material-symbols-outlined text-[20px]">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>


            <!-- Login button -->
            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full h-14 bg-primary text-on-primary font-bold rounded-full text-base tracking-tight hover:shadow-lg active:scale-95 transition-all duration-200 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ loading() ? 'Signing in…' : 'Login' }}
            </button>
          </form>

          <!-- OR divider -->
          <div class="relative my-8 flex items-center">
            <div class="flex-grow border-t border-outline-variant/15"></div>
            <span class="flex-shrink mx-4 text-[10px] font-bold text-outline-variant uppercase tracking-[0.2em]">or</span>
            <div class="flex-grow border-t border-outline-variant/15"></div>
          </div>

          <!-- Google login -->
          <button
            type="button"
            (click)="loginWithGoogle()"
            class="w-full h-14 bg-surface-container-lowest border border-outline-variant/20 text-on-surface font-semibold rounded-full flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors duration-200"
          >
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span class="text-sm tracking-tight">Login with Google</span>
          </button>
        </section>

        <!-- Footer -->
        <footer class="mt-10 text-center">
          <p class="text-sm text-on-surface-variant font-medium">
            Don't have an account?
            <a routerLink="/register" class="text-tertiary-fixed-dim font-bold ml-1 hover:underline underline-offset-4 decoration-2">Register</a>
          </p>
        </footer>

        <!-- Bottom visual anchor -->
        <div class="mt-16 w-32 h-1.5 bg-on-surface/5 rounded-full overflow-hidden">
          <div class="h-full w-1/3 bg-tertiary-fixed/40 rounded-full"></div>
        </div>

      </main>

      <!-- Desktop accent cards (xl+) -->
      <div class="fixed top-12 right-12 hidden xl:flex flex-col gap-4 opacity-40 pointer-events-none">
        <div class="w-48 h-64 rounded-lg bg-surface-container overflow-hidden flex items-center justify-center">
          <span class="material-symbols-outlined text-on-surface-variant text-7xl">sports_tennis</span>
        </div>
        <div class="w-48 h-32 rounded-lg bg-tertiary-container/20 flex items-center justify-center">
          <span class="material-symbols-outlined text-tertiary text-4xl">fitness_center</span>
        </div>
      </div>

    </div>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  loading = signal(false);
  showPassword = signal(false);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => {
        const requested = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
        // Never honour a returnUrl that points back at an auth screen.
        const target = requested && !/^\/(login|register)(\/|$|\?)/.test(requested)
          ? requested
          : '/home';
        // replaceUrl so the browser back button doesn't return the user to /login.
        this.router.navigateByUrl(target, { replaceUrl: true });
      },
      error: (err) => {
        const msg: string = (err?.error?.message ?? err?.error?.error ?? '').toString();
        const lower = msg.toLowerCase();
        if (lower.includes('not confirmed') || lower.includes('not verified')) {
          this.toast.warning(
            'Check your inbox and click the confirmation link before logging in.',
            'Email not verified',
          );
        } else if (err?.status === 401) {
          this.toast.error('Incorrect email or password.', 'Login failed');
        } else if (err?.status === 0) {
          this.toast.error('Cannot reach the server. Is the API running?', 'Network error');
        } else {
          this.toast.error('Something went wrong. Please try again later.', 'Error');
        }
        this.loading.set(false);
      },
    });
  }

  forgotPassword(): void {
    this.toast.info('Password reset — coming soon.', 'Forgot password');
  }

  loginWithGoogle(): void {
    this.toast.info('Google login — coming soon.', 'OAuth');
  }
}
