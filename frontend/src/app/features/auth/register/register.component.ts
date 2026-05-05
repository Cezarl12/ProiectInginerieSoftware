import {
  Component, signal, computed, inject, ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

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
          <form [formGroup]="form" (ngSubmit)="submit()" class="relative z-10 space-y-6">

            <!-- Fields grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

              <!-- Username -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Username</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-4 text-[20px]"
                    [class]="fieldIconColor('username')">person</span>
                  <input
                    type="text"
                    formControlName="username"
                    autocomplete="username"
                    placeholder="johndoe_92"
                    [class]="fieldClass('username')"
                    class="w-full bg-surface-container-low border rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-2 transition-all"
                  />
                </div>
                @if (showError('username', 'required')) {
                  <p class="text-error text-xs ml-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Username is required.
                  </p>
                }
                @if (showError('username', 'minlength')) {
                  <p class="text-error text-xs ml-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Must be at least 3 characters.
                  </p>
                }
              </div>

              <!-- Email -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Email address</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-4 text-[20px]"
                    [class]="fieldIconColor('email')">mail</span>
                  <input
                    type="email"
                    formControlName="email"
                    autocomplete="email"
                    placeholder="hello@activezone.com"
                    [class]="fieldClass('email')"
                    class="w-full bg-surface-container-low border rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-2 transition-all"
                  />
                </div>
                @if (showError('email', 'required')) {
                  <p class="text-error text-xs ml-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Email is required.
                  </p>
                }
                @if (showError('email', 'email')) {
                  <p class="text-error text-xs ml-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Enter a valid email address.
                  </p>
                }
              </div>

              <!-- Password -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Password</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-4 text-[20px]"
                    [class]="fieldIconColor('password')">lock</span>
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    autocomplete="new-password"
                    placeholder="••••••••"
                    [class]="fieldClass('password')"
                    class="w-full bg-surface-container-low border rounded-lg py-4 pl-12 pr-12 text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-2 transition-all"
                  />
                  <button type="button" (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 p-1.5 text-outline hover:text-on-surface transition-colors"
                    [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                    <span class="material-symbols-outlined text-[20px]">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>

                <!-- Password requirements (shown when field is dirty) -->
                @if (form.get('password')?.dirty) {
                  <div class="mt-2 space-y-1 px-1">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-outline-variant mb-1.5">Requirements</p>
                    <div class="flex items-center gap-2" [class.text-secondary]="req().length" [class.text-outline-variant]="!req().length">
                      <span class="material-symbols-outlined text-[16px]"
                        style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20">
                        {{ req().length ? 'check_circle' : 'radio_button_unchecked' }}
                      </span>
                      <span class="text-xs font-medium">At least 8 characters</span>
                    </div>
                    <div class="flex items-center gap-2" [class.text-secondary]="req().upper" [class.text-outline-variant]="!req().upper">
                      <span class="material-symbols-outlined text-[16px]"
                        style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20">
                        {{ req().upper ? 'check_circle' : 'radio_button_unchecked' }}
                      </span>
                      <span class="text-xs font-medium">One uppercase letter</span>
                    </div>
                    <div class="flex items-center gap-2" [class.text-secondary]="req().digit" [class.text-outline-variant]="!req().digit">
                      <span class="material-symbols-outlined text-[16px]"
                        style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20">
                        {{ req().digit ? 'check_circle' : 'radio_button_unchecked' }}
                      </span>
                      <span class="text-xs font-medium">One number</span>
                    </div>
                  </div>
                }

                @if (showError('password', 'required')) {
                  <p class="text-error text-xs ml-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Password is required.
                  </p>
                }
                @if (showError('password', 'minlength')) {
                  <p class="text-error text-xs ml-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Password must be at least 8 characters.
                  </p>
                }
              </div>

              <!-- Confirm password -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Confirm password</label>
                <div class="relative flex items-center">
                  <span class="material-symbols-outlined absolute left-4 text-[20px]"
                    [class]="confirmIconColor()">shield</span>
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    autocomplete="new-password"
                    placeholder="••••••••"
                    [class]="fieldClass('confirmPassword')"
                    class="w-full bg-surface-container-low border rounded-lg py-4 pl-12 pr-12 text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest focus:outline-none focus:ring-2 transition-all"
                  />
                  <button type="button" (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 p-1.5 text-outline hover:text-on-surface transition-colors"
                    [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                    <span class="material-symbols-outlined text-[20px]">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                @if (showError('confirmPassword', 'required')) {
                  <p class="text-error text-xs ml-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Please confirm your password.
                  </p>
                }
                @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.dirty && form.get('confirmPassword')?.value) {
                  <p class="text-error text-xs ml-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Passwords do not match.
                  </p>
                }
                @if (passwordsMatch()) {
                  <p class="text-secondary text-xs ml-1 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]" style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20">check_circle</span>
                    Passwords match.
                  </p>
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
  private toast = inject(ToastService);

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', Validators.required),
  }, { validators: passwordMatch });

  loading = signal(false);
  showPassword = signal(false);
  selectedSports = signal<string[]>([]);

  private passwordValue = toSignal(this.form.get('password')!.valueChanges, { initialValue: '' });

  req = computed(() => {
    const pw = this.passwordValue() ?? '';
    return {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      digit: /[0-9]/.test(pw),
    };
  });

  passwordsMatch = computed(() => {
    const confirm = this.form.get('confirmPassword');
    return (
      confirm?.dirty === true &&
      (confirm?.value ?? '').length > 0 &&
      !this.form.hasError('passwordMismatch')
    );
  });

  sports: SportChip[] = [
    { label: 'Football',   color: '#4CAF50', icon: 'sports_soccer' },
    { label: 'Basketball', color: '#FF9800', icon: 'sports_basketball' },
    { label: 'Tennis',     color: '#CDDC39', icon: 'sports_tennis' },
    { label: 'Padel',      color: '#2196F3', icon: 'sports_tennis' },
    { label: 'Volleyball', color: '#FFEB3B', icon: 'sports_volleyball' },
    { label: 'Badminton',  color: '#F44336', icon: 'sports_baseball' },
    { label: 'Swimming',   color: '#00BCD4', icon: 'pool' },
    { label: 'Cycling',    color: '#E91E63', icon: 'directions_bike' },
    { label: 'Running',    color: '#FF7043', icon: 'directions_run' },
  ];

  showError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }

  fieldClass(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched) return 'border-transparent focus:ring-primary/20';
    if (ctrl.invalid)   return 'border-error/40 focus:ring-error/20';
    return 'border-secondary/30 focus:ring-secondary/20';
  }

  fieldIconColor(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched) return 'text-outline';
    if (ctrl.invalid)   return 'text-error';
    return 'text-secondary';
  }

  confirmIconColor(): string {
    const ctrl = this.form.get('confirmPassword');
    if (!ctrl?.dirty || !ctrl?.value) return 'text-outline';
    if (this.form.hasError('passwordMismatch') || ctrl.hasError('required')) return 'text-error';
    return 'text-secondary';
  }

  sportChipClass(sport: SportChip): string {
    return this.selectedSports().includes(sport.label)
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { username, email, password } = this.form.getRawValue();
    this.auth
      .register({ username: username!, email: email!, password: password! })
      .subscribe({
        next: res => {
          this.toast.success(
            res.message ?? 'Check your inbox to confirm your email address.',
            'Account created!',
          );
          this.loading.set(false);
          setTimeout(() => this.router.navigate(['/login']), 2500);
        },
        error: (err) => {
          const msg: string = err?.error?.message ?? '';
          if (err?.status === 409) {
            if (msg.toLowerCase().includes('email')) {
              this.toast.error('An account with this email already exists.', 'Email taken');
            } else if (msg.toLowerCase().includes('username')) {
              this.toast.error('This username is already taken. Try another.', 'Username taken');
            } else {
              this.toast.error('An account with these details already exists.', 'Registration failed');
            }
          } else {
            this.toast.error('Registration failed. Please try again.', 'Something went wrong');
          }
          this.loading.set(false);
        },
      });
  }
}
