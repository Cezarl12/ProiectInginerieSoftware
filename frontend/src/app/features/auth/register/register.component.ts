import {
  Component, signal, computed, inject, ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

interface SportChip {
  label: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background flex flex-col items-center justify-center p-4 antialiased">

      <!-- Background orbs -->
      <div class="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-tertiary-fixed/10 to-transparent blur-3xl -z-10 pointer-events-none"></div>
      <div class="fixed bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-secondary-container/5 to-transparent blur-3xl -z-10 pointer-events-none"></div>

      <main class="w-full max-w-[375px] md:max-w-2xl">

        <!-- Card -->
        <div class="bg-surface-container-lowest rounded-xl shadow-2xl p-8 md:p-12 relative overflow-hidden">

          <!-- Decorative blur inside card -->
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-tertiary-container/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Header -->
          <div class="relative z-10 flex flex-col items-center mb-10 text-center">
            <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 md:hidden">
              <span class="material-symbols-outlined text-on-primary text-4xl">fitness_center</span>
            </div>
            <div class="hidden md:flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-4xl text-primary">fitness_center</span>
              <h1 class="text-3xl font-black tracking-tighter text-on-surface">ActiveZone</h1>
            </div>
            <h1 class="text-3xl font-black tracking-tighter text-on-surface md:hidden">ActiveZone</h1>
            <h2 class="text-2xl font-bold tracking-tight text-on-surface mt-2 md:mt-0">Join the Gallery</h2>
            <p class="text-on-surface-variant text-sm font-medium mt-1">Create your athletic profile and start moving.</p>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="submit()" class="relative z-10 space-y-8">

            <!-- Fields grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Username -->
              <div class="space-y-2">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Username</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-4 text-outline text-[20px]">person</span>
                  <input
                    type="text"
                    formControlName="username"
                    autocomplete="username"
                    placeholder="johndoe_92"
                    class="w-full bg-surface-container-low border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
                  />
                </div>
              </div>

              <!-- Email -->
              <div class="space-y-2">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Email address</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-4 text-outline text-[20px]">mail</span>
                  <input
                    type="email"
                    formControlName="email"
                    autocomplete="email"
                    placeholder="hello@activezone.com"
                    class="w-full bg-surface-container-low border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
                  />
                </div>
              </div>

              <!-- Password -->
              <div class="space-y-2">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Password</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-4 text-outline text-[20px]">lock</span>
                  <input
                    type="password"
                    formControlName="password"
                    autocomplete="new-password"
                    placeholder="••••••••"
                    class="w-full bg-surface-container-low border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
                  />
                </div>
              </div>

              <!-- Confirm password -->
              <div class="space-y-2">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Confirm password</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-4 text-outline text-[20px]">shield</span>
                  <input
                    type="password"
                    formControlName="confirmPassword"
                    autocomplete="new-password"
                    placeholder="••••••••"
                    class="w-full bg-surface-container-low border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
                  />
                </div>
                @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.dirty) {
                  <p class="text-error text-xs ml-1 mt-1">Passwords do not match.</p>
                }
              </div>
            </div>

            <!-- Sport chips -->
            <div class="space-y-4">
              <div class="flex items-center justify-between px-1">
                <label class="text-[10px] font-bold uppercase tracking-widest text-outline">Favorite Sports</label>
                <span class="text-[10px] text-outline">{{ selectedSports().length }} selected</span>
              </div>

              <!-- Mobile: scrollable row -->
              <div class="flex md:hidden overflow-x-auto gap-2 pb-1 px-1 -mx-1" style="scrollbar-width: none; -ms-overflow-style: none;">
                @for (sport of sports; track sport.label) {
                  <button
                    type="button"
                    (click)="toggleSport(sport.label)"
                    [class]="sportChipClass(sport)"
                    class="flex-none flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold"
                  >
                    <span class="w-1.5 h-1.5 rounded-full shrink-0" [style.background-color]="sport.color"></span>
                    {{ sport.label }}
                  </button>
                }
              </div>

              <!-- Desktop: wrap -->
              <div class="hidden md:flex flex-wrap gap-3">
                @for (sport of sports; track sport.label) {
                  <button
                    type="button"
                    (click)="toggleSport(sport.label)"
                    [class]="sportChipClass(sport)"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all active:scale-95 text-sm font-semibold"
                  >
                    <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="sport.color"></span>
                    {{ sport.label }}
                  </button>
                }
              </div>
            </div>

            @if (error()) {
              <p class="text-error text-sm text-center">{{ error() }}</p>
            }
            @if (success()) {
              <p class="text-secondary text-sm text-center font-medium">{{ success() }}</p>
            }

            <!-- Submit -->
            <div class="pt-2">
              <button
                type="submit"
                [disabled]="form.invalid || loading()"
                class="w-full bg-primary text-on-primary font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-sm"
              >
                {{ loading() ? 'Creating…' : 'Create Account' }}
                @if (!loading()) {
                  <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                }
              </button>
            </div>
          </form>

          <!-- Footer link -->
          <div class="relative z-10 mt-10 text-center">
            <p class="text-on-surface-variant font-medium text-sm">
              Already have an account?
              <a routerLink="/login" class="text-on-surface font-bold ml-1 underline decoration-primary-container decoration-2 underline-offset-4">Login</a>
            </p>
          </div>
        </div>

        <!-- Desktop bento preview -->
        <div class="hidden md:grid grid-cols-3 gap-4 mt-8">
          <div class="col-span-2 h-32 rounded-lg bg-surface-container-low flex items-end p-4 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-tertiary-fixed/10"></div>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-on-primary-fixed relative z-10">The Kinetic Gallery</p>
          </div>
          <div class="col-span-1 h-32 rounded-lg bg-surface-container-high flex flex-col items-center justify-center p-4 gap-2">
            <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;">stars</span>
            <span class="text-[10px] font-bold uppercase tracking-widest text-center text-on-surface">Pro Perks</span>
          </div>
        </div>

        <!-- Disclaimer -->
        <p class="mt-8 text-center text-outline text-[11px] font-medium leading-relaxed max-w-sm mx-auto">
          By creating an account, you agree to ActiveZone's Terms of Service and Privacy Policy. Your data is secured with enterprise-grade encryption.
        </p>

      </main>
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
    confirmPassword: new FormControl('', Validators.required),
  }, { validators: passwordMatch });

  loading = signal(false);
  error = signal('');
  success = signal('');

  selectedSports = signal<string[]>([]);

  sports: SportChip[] = [
    { label: 'Football', color: '#4CAF50', icon: 'sports_soccer' },
    { label: 'Basketball', color: '#FF9800', icon: 'sports_basketball' },
    { label: 'Tennis', color: '#CDDC39', icon: 'sports_tennis' },
    { label: 'Padel', color: '#2196F3', icon: 'sports_tennis' },
    { label: 'Volleyball', color: '#FFEB3B', icon: 'sports_volleyball' },
    { label: 'Badminton', color: '#F44336', icon: 'sports_baseball' },
    { label: 'Swimming', color: '#00BCD4', icon: 'pool' },
    { label: 'Cycling', color: '#E91E63', icon: 'directions_bike' },
    { label: 'Running', color: '#FF7043', icon: 'directions_run' },
  ];

  sportChipClass(sport: SportChip): string {
    const isSelected = this.selectedSports().includes(sport.label);
    return isSelected
      ? 'bg-primary text-on-primary'
      : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high';
  }

  toggleSport(label: string): void {
    const current = this.selectedSports();
    this.selectedSports.set(
      current.includes(label) ? current.filter(s => s !== label) : [...current, label],
    );
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    const { username, email, password } = this.form.getRawValue();
    this.auth
      .register({ username: username!, email: email!, password: password! })
      .subscribe({
        next: res => {
          this.success.set(res.message ?? 'Account created! Please check your email.');
          this.loading.set(false);
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: () => {
          this.error.set('Registration failed. Please try again.');
          this.loading.set(false);
        },
      });
  }
}
