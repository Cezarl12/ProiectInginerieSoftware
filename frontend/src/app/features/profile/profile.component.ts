import {
  Component, inject, signal, computed, ChangeDetectionStrategy, DestroyRef,
  ViewChild, ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { FriendsService } from '../../core/services/friends.service';
import { ActivitiesService } from '../../core/services/activities.service';
import { ToastService } from '../../core/services/toast.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../shared/components/desktop-header/desktop-header.component';
import type { User } from '../../core/models/user.model';
import type { Activity } from '../../core/models/activity.model';
import { SPORTS, sportColor, sportIcon, sportPhoto, FALLBACK_PHOTO } from '../../core/utils/sport-utils';

const ALL_SPORTS = SPORTS;

function relativeDate(dateStr: string): string {
  const d = new Date(dateStr).getTime();
  const diff = Date.now() - d;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function initials(username: string): string {
  const parts = (username ?? '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (username ?? '').slice(0, 2).toUpperCase() || 'SM';
}

const AVATAR_BG = ['#FFE0B2', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#D1C4E9', '#FFCCBC', '#B2EBF2', '#DCEDC8'];
function avatarBg(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = (hash * 31 + username.charCodeAt(i)) | 0;
  return AVATAR_BG[Math.abs(hash) % AVATAR_BG.length];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BottomNavComponent, DesktopHeaderComponent, FormsModule, DatePipe, RouterLink],
  template: `
    <div class="min-h-screen bg-background pb-32">
      <app-desktop-header />

      <header class="sticky top-0 z-40 bg-background/95 backdrop-blur-md md:hidden border-b border-outline-variant/10">
        <div class="flex items-center justify-between px-5 py-4">
          <div class="text-xl font-black tracking-tight text-primary">SportMap</div>
          <div class="flex items-center gap-2">
            <button class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low">
              <span class="material-symbols-outlined text-[20px] text-on-surface-variant">notifications</span>
            </button>
            <button class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low">
              <span class="material-symbols-outlined text-[20px] text-on-surface-variant">settings</span>
            </button>
          </div>
        </div>
      </header>

      <input type="file" accept="image/*" #photoInput class="hidden" (change)="onPhotoUpload($event)" />

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <span class="material-symbols-outlined text-5xl animate-pulse text-primary">person</span>
        </div>

      } @else if (user()) {

        <!-- ════ MOBILE ════ -->
        <main class="md:hidden px-5 space-y-6 pt-6">

          <section class="flex flex-col items-center gap-4 text-center">
            <div class="relative group cursor-pointer" (click)="photoInput.click()">
              <div class="w-32 h-32 rounded-xl overflow-hidden shadow-2xl ring-4 ring-surface-container-lowest bg-primary-container flex items-center justify-center">
                @if (user()!.profilePhotoUrl) {
                  <img [src]="user()!.profilePhotoUrl!" alt="avatar" class="w-full h-full object-cover" />
                } @else {
                  <span class="text-4xl font-black text-on-primary-container">{{ getInitials(user()!.username) }}</span>
                }
              </div>
              <div class="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                @if (savingPhoto()) {
                  <span class="material-symbols-outlined text-white text-2xl animate-spin">progress_activity</span>
                } @else {
                  <span class="material-symbols-outlined text-white text-2xl">photo_camera</span>
                }
              </div>
              <div class="absolute -bottom-2 -right-2 bg-primary p-2 rounded-full border-4 border-background text-on-primary">
                <span class="material-symbols-outlined text-[14px]"
                      style="font-variation-settings:'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 20;">verified</span>
              </div>
            </div>

            <div class="space-y-1">
              <h1 class="text-3xl font-black tracking-tighter text-on-surface">{{ user()!.username }}</h1>
              <p class="text-outline-variant font-medium text-sm uppercase tracking-widest">
                {{ user()!.role }} · Since {{ user()!.createdAt | date:'yyyy' }}
              </p>
            </div>

            <div class="flex items-center gap-6">
              <button (click)="toggleFollowers()"
                      class="flex flex-col items-center text-center active:scale-95 transition-all">
                <span class="text-2xl font-black text-on-surface">{{ followerCount() }}</span>
                <span class="text-[10px] font-bold uppercase tracking-widest text-outline">Followers</span>
              </button>
              <div class="w-px h-8 bg-outline-variant/20"></div>
              <button (click)="toggleFollowing()"
                      class="flex flex-col items-center text-center active:scale-95 transition-all">
                <span class="text-2xl font-black text-on-surface">{{ followingCount() }}</span>
                <span class="text-[10px] font-bold uppercase tracking-widest text-outline">Following</span>
              </button>
            </div>

            @if (sports().length > 0) {
              <div class="flex gap-2 overflow-x-auto max-w-full pb-1" style="scrollbar-width:none;">
                @for (s of sports(); track s) {
                  <span class="flex-shrink-0 bg-surface-container-highest px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold">
                    <span class="material-symbols-outlined text-[16px]"
                          [style.color]="getSportColor(s)"
                          style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">
                      {{ getSportIcon(s) }}
                    </span>
                    {{ s }}
                  </span>
                }
              </div>
            }

            <button (click)="showEdit.update(v => !v)"
                    class="flex items-center gap-2 px-5 py-2 rounded-full border border-outline-variant/30 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition-all">
              <span class="material-symbols-outlined text-[16px]">edit</span>
              {{ showEdit() ? 'Close Edit' : 'Edit Profile' }}
            </button>
          </section>

          <!-- Followers / Following list (mobile) -->
          @if (showFollowersList() || showFollowingList()) {
            <section class="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-lg overflow-hidden">
              <div class="flex items-center bg-surface-container-low px-2 pt-3">
                <button (click)="toggleFollowers()"
                        class="flex-1 px-3 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        [class]="showFollowersList()
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-outline hover:text-on-surface'">
                  <span class="material-symbols-outlined text-[16px]">group</span>
                  <span>Followers · {{ followerCount() }}</span>
                </button>
                <button (click)="toggleFollowing()"
                        class="flex-1 px-3 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        [class]="showFollowingList()
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-outline hover:text-on-surface'">
                  <span class="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Following · {{ followingCount() }}</span>
                </button>
                <button (click)="closeLists()"
                        class="w-9 h-9 ml-1 mb-1 flex items-center justify-center rounded-full text-outline hover:bg-surface-container active:scale-95 transition-all">
                  <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div class="p-4 max-h-[60vh] overflow-y-auto">
                @if (showFollowersList()) {
                  @if (followersList().length === 0) {
                    <div class="flex flex-col items-center gap-3 py-8 text-center">
                      <div class="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center">
                        <span class="material-symbols-outlined text-2xl text-outline">group_off</span>
                      </div>
                      <p class="text-sm font-semibold text-on-surface">No followers yet</p>
                      <p class="text-xs text-outline">Share your profile to grow your network.</p>
                    </div>
                  } @else {
                    <div class="grid gap-2">
                      @for (f of followersList(); track f.id) {
                        <a [routerLink]="['/users', f.id]"
                           class="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-container-low active:scale-[0.99] transition-all">
                          <div class="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-surface-container-lowest"
                               [style.background-color]="getAvatarBg(f.username)">
                            @if (f.profilePhotoUrl) {
                              <img [src]="f.profilePhotoUrl" class="w-full h-full object-cover" [alt]="f.username" />
                            } @else {
                              <span class="text-sm font-black text-on-primary-container">{{ getInitials(f.username) }}</span>
                            }
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm text-on-surface truncate">{{ atSign(f.username) }}</p>
                            <p class="text-[11px] text-outline truncate">
                              {{ f.favoriteSports || 'Athlete on SportMap' }}
                            </p>
                          </div>
                          <span class="material-symbols-outlined text-[20px] text-outline-variant shrink-0">chevron_right</span>
                        </a>
                      }
                    </div>
                  }
                } @else if (showFollowingList()) {
                  @if (followingList().length === 0) {
                    <div class="flex flex-col items-center gap-3 py-8 text-center">
                      <div class="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center">
                        <span class="material-symbols-outlined text-2xl text-outline">person_search</span>
                      </div>
                      <p class="text-sm font-semibold text-on-surface">Not following anyone yet</p>
                      <p class="text-xs text-outline">Find athletes to keep up with their activity.</p>
                    </div>
                  } @else {
                    <div class="grid gap-2">
                      @for (f of followingList(); track f.id) {
                        <a [routerLink]="['/users', f.id]"
                           class="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-container-low active:scale-[0.99] transition-all">
                          <div class="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-surface-container-lowest"
                               [style.background-color]="getAvatarBg(f.username)">
                            @if (f.profilePhotoUrl) {
                              <img [src]="f.profilePhotoUrl" class="w-full h-full object-cover" [alt]="f.username" />
                            } @else {
                              <span class="text-sm font-black text-on-primary-container">{{ getInitials(f.username) }}</span>
                            }
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm text-on-surface truncate">{{ atSign(f.username) }}</p>
                            <p class="text-[11px] text-outline truncate">
                              {{ f.favoriteSports || 'Athlete on SportMap' }}
                            </p>
                          </div>
                          <span class="material-symbols-outlined text-[20px] text-outline-variant shrink-0">chevron_right</span>
                        </a>
                      }
                    </div>
                  }
                }
              </div>
            </section>
          }

          <!-- Edit panel (mobile) -->
          @if (showEdit()) {
            <section class="bg-surface-container-lowest rounded-2xl p-5 space-y-4 border border-outline-variant/10 shadow-sm">
              <h3 class="text-sm font-black uppercase tracking-widest text-outline">Edit Profile</h3>

              <div class="space-y-1.5">
                <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Profile Photo</p>
                <button (click)="photoInput.click()"
                        [disabled]="savingPhoto()"
                        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low text-sm font-semibold text-on-surface active:scale-95 transition-all disabled:opacity-60">
                  @if (savingPhoto()) {
                    <span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Uploading…
                  } @else {
                    <span class="material-symbols-outlined text-[16px]">photo_camera</span>
                    Upload Photo
                  }
                </button>
              </div>

              <div class="space-y-1.5">
                <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Username</p>
                <div class="flex gap-2">
                  <input [(ngModel)]="pendingUsername"
                         class="flex-1 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border-none outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                         (keyup.enter)="saveName()" />
                  <button (click)="saveName()"
                          class="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold active:scale-95 transition-all">
                    <span class="material-symbols-outlined text-[16px]">check</span>
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Favorite Sports</p>
                  @if (sportsChanged()) {
                    <button (click)="saveSports()"
                            [disabled]="savingSports()"
                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold active:scale-95 transition-all disabled:opacity-60">
                      @if (savingSports()) {
                        <span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                      } @else {
                        <span class="material-symbols-outlined text-[14px]">check</span>
                      }
                      Save
                    </button>
                  }
                </div>
                <div class="grid grid-cols-2 gap-2">
                  @for (sport of ALL_SPORTS; track sport.label) {
                    <button
                      type="button"
                      (click)="toggleSport(sport.label)"
                      class="flex items-center gap-2 p-3 rounded-xl border transition-all active:scale-95 text-left"
                      [class]="pendingSports().includes(sport.label)
                        ? 'border-transparent shadow-sm'
                        : 'bg-surface-container-low border-outline-variant/20'"
                      [style.background-color]="pendingSports().includes(sport.label) ? sport.color + '22' : ''"
                      [style.border-color]="pendingSports().includes(sport.label) ? sport.color + '66' : ''"
                    >
                      <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                           [style.background-color]="sport.color + '22'">
                        <span class="material-symbols-outlined text-[14px]" [style.color]="sport.color">{{ sport.icon }}</span>
                      </div>
                      <span class="text-xs font-semibold text-on-surface flex-1">{{ sport.label }}</span>
                      @if (pendingSports().includes(sport.label)) {
                        <span class="material-symbols-outlined text-[14px]" [style.color]="sport.color">check_circle</span>
                      }
                    </button>
                  }
                </div>
              </div>

              <button (click)="showEdit.set(false)"
                      class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-outline-variant/20 text-sm font-semibold text-on-surface-variant active:scale-95 transition-all">
                <span class="material-symbols-outlined text-[16px]">close</span>
                Cancel
              </button>
            </section>
          }

          <section class="grid grid-cols-2 gap-4">
            <div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between min-h-[120px]">
              <div class="flex items-center justify-between">
                <p class="text-[10px] font-black uppercase tracking-widest text-outline">Joined Activities</p>
                <span class="material-symbols-outlined text-primary text-[20px]">trending_up</span>
              </div>
              <p class="text-4xl font-black text-on-surface mt-2">{{ joinedActivities().length }}</p>
            </div>
            <div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col justify-between min-h-[120px]">
              <div class="flex items-center justify-between">
                <p class="text-[10px] font-black uppercase tracking-widest text-outline">Fav. Sports</p>
                <span class="material-symbols-outlined text-primary text-[20px]">sports</span>
              </div>
              <p class="text-4xl font-black text-on-surface mt-2">{{ sports().length || '—' }}</p>
            </div>
            <div class="col-span-2 bg-primary p-8 rounded-xl relative overflow-hidden min-h-[100px] flex flex-col justify-between">
              <span class="material-symbols-outlined absolute -bottom-4 -right-4 text-[100px] text-on-primary/10 select-none"
                    style="font-variation-settings:'FILL' 1,'wght' 700,'GRAD' 0,'opsz' 48;">fitness_center</span>
              <p class="text-[10px] font-black uppercase tracking-widest text-on-primary/70">Member Since</p>
              <p class="text-4xl font-black text-on-primary">{{ user()!.createdAt | date:'yyyy' }}</p>
            </div>
          </section>

          <section class="space-y-4">
            <h2 class="text-lg font-black tracking-tight text-on-surface">Activity History</h2>
            @if (joinedActivities().length === 0) {
              <div class="bg-surface-container-lowest rounded-xl p-8 text-center border border-outline-variant/10">
                <span class="material-symbols-outlined text-4xl text-outline block mb-2">event_busy</span>
                <p class="text-sm text-on-surface-variant">No joined activities yet</p>
              </div>
            } @else {
              @for (activity of joinedActivities(); track activity.id) {
                <div class="flex gap-3 items-center bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/10 shadow-sm">
                  <div class="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container-low flex items-center justify-center">
                    <img [src]="getSportPhoto(activity.sport)" [alt]="activity.sport"
                         class="w-full h-full object-cover"
                         (error)="onActivityImgError($event)" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-on-surface text-sm leading-tight truncate">{{ activity.title }}</h4>
                    <div class="flex items-center gap-1 text-xs text-on-surface-variant mt-0.5">
                      <span class="material-symbols-outlined text-[12px]">location_on</span>
                      <span class="truncate">{{ activity.location?.name ?? activity.sport }}</span>
                    </div>
                    <p class="text-[10px] font-bold text-outline mt-0.5">{{ getRelativeDate(activity.dateTime) }}</p>
                  </div>
                </div>
              }
            }
          </section>

          <section>
            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Account</p>
            <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm divide-y divide-surface-container-low">
              <div class="flex items-center gap-4 px-5 py-4">
                <span class="material-symbols-outlined text-xl text-primary">mail</span>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Email</p>
                  <p class="text-sm font-semibold text-on-surface truncate">{{ user()!.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4 px-5 py-4">
                <span class="material-symbols-outlined text-xl text-primary">shield</span>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Password</p>
                  <p class="text-sm font-semibold text-on-surface">••••••••</p>
                </div>
                <span class="text-xs font-bold text-outline bg-surface-container-low rounded-full px-3 py-1">Coming soon</span>
              </div>
            </div>
          </section>

          <button (click)="logout()"
                  class="w-full flex items-center justify-center gap-2 py-4 rounded-full border border-outline-variant/20 text-on-surface-variant font-semibold hover:bg-surface-container-low active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </main>

        <!-- ════ DESKTOP ════ -->
        <main class="hidden md:block max-w-7xl mx-auto px-8 pt-10 pb-16">

          <div class="flex flex-col md:flex-row items-start md:items-end gap-8 mb-16">
            <div class="relative shrink-0 group cursor-pointer" (click)="photoInput.click()">
              <div class="w-48 h-48 rounded-xl overflow-hidden shadow-2xl bg-primary-container flex items-center justify-center">
                @if (user()!.profilePhotoUrl) {
                  <img [src]="user()!.profilePhotoUrl!" alt="avatar" class="w-full h-full object-cover" />
                } @else {
                  <span class="text-6xl font-black text-on-primary-container">{{ getInitials(user()!.username) }}</span>
                }
              </div>
              <div class="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                @if (savingPhoto()) {
                  <span class="material-symbols-outlined text-white text-4xl animate-spin">progress_activity</span>
                  <span class="text-white text-sm font-semibold">Uploading…</span>
                } @else {
                  <span class="material-symbols-outlined text-white text-4xl">photo_camera</span>
                  <span class="text-white text-sm font-semibold">Change Photo</span>
                }
              </div>
              <div class="absolute -bottom-3 -right-3 bg-primary p-2.5 rounded-full border-4 border-background text-on-primary">
                <span class="material-symbols-outlined text-[18px]"
                      style="font-variation-settings:'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 24;">verified</span>
              </div>
            </div>

            <div class="flex-1 space-y-4">
              <span class="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary-container text-on-primary-container">
                {{ user()!.role }}
              </span>
              <h1 class="text-5xl lg:text-6xl font-black tracking-tighter text-on-surface leading-none">{{ user()!.username }}</h1>
              <p class="text-lg text-on-surface-variant max-w-xl">
                {{ sports().length > 0 ? sports().join(' · ') : 'SportMap athlete' }}
              </p>
              @if (sports().length > 0) {
                <div class="flex flex-wrap gap-2">
                  @for (s of sports(); track s) {
                    <span class="bg-surface-container-highest px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold">
                      <span class="material-symbols-outlined text-[16px]"
                            [style.color]="getSportColor(s)"
                            style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">
                        {{ getSportIcon(s) }}
                      </span>
                      {{ s }}
                    </span>
                  }
                </div>
              }
              <div class="flex items-center gap-6 flex-wrap">
                <button (click)="toggleFollowers()"
                        class="flex items-center gap-2 hover:bg-surface-container-low rounded-xl px-3 py-2 transition-all">
                  <span class="text-2xl font-black text-on-surface">{{ followerCount() }}</span>
                  <span class="text-sm font-bold text-outline">Followers</span>
                </button>
                <button (click)="toggleFollowing()"
                        class="flex items-center gap-2 hover:bg-surface-container-low rounded-xl px-3 py-2 transition-all">
                  <span class="text-2xl font-black text-on-surface">{{ followingCount() }}</span>
                  <span class="text-sm font-bold text-outline">Following</span>
                </button>
                <button (click)="showEdit.update(v => !v)"
                        class="flex items-center gap-2 px-6 py-3 rounded-full border border-outline-variant/30 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition-all">
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                  {{ showEdit() ? 'Close Edit' : 'Edit Profile' }}
                </button>
              </div>
            </div>
          </div>

          @if (showFollowersList() || showFollowingList()) {
            <section class="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-lg overflow-hidden mb-12">
              <div class="flex items-center px-3 pt-3 bg-surface-container-low">
                <button (click)="toggleFollowers()"
                        class="px-5 py-3 rounded-t-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 min-w-[180px] justify-center"
                        [class]="showFollowersList()
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-outline hover:text-on-surface'">
                  <span class="material-symbols-outlined text-[18px]">group</span>
                  Followers · {{ followerCount() }}
                </button>
                <button (click)="toggleFollowing()"
                        class="px-5 py-3 rounded-t-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 min-w-[180px] justify-center"
                        [class]="showFollowingList()
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-outline hover:text-on-surface'">
                  <span class="material-symbols-outlined text-[18px]">person_add</span>
                  Following · {{ followingCount() }}
                </button>
                <div class="flex-1"></div>
                <button (click)="closeLists()"
                        class="w-10 h-10 mb-2 flex items-center justify-center rounded-full text-outline hover:bg-surface-container active:scale-95 transition-all">
                  <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div class="p-6 max-h-[55vh] overflow-y-auto">
                @if (showFollowersList()) {
                  @if (followersList().length === 0) {
                    <div class="flex flex-col items-center gap-3 py-12 text-center">
                      <div class="w-16 h-16 rounded-3xl bg-surface-container flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-outline">group_off</span>
                      </div>
                      <p class="text-base font-bold text-on-surface">No followers yet</p>
                      <p class="text-sm text-outline">Share your profile and they'll show up here.</p>
                    </div>
                  } @else {
                    <div class="grid grid-cols-2 gap-3">
                      @for (f of followersList(); track f.id) {
                        <a [routerLink]="['/users', f.id]"
                           class="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-low active:scale-[0.99] transition-all border border-transparent hover:border-outline-variant/20">
                          <div class="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-surface-container-lowest"
                               [style.background-color]="getAvatarBg(f.username)">
                            @if (f.profilePhotoUrl) {
                              <img [src]="f.profilePhotoUrl" class="w-full h-full object-cover" [alt]="f.username" />
                            } @else {
                              <span class="text-sm font-black text-on-primary-container">{{ getInitials(f.username) }}</span>
                            }
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm text-on-surface truncate">{{ atSign(f.username) }}</p>
                            <p class="text-xs text-outline truncate">
                              {{ f.favoriteSports || 'Athlete on SportMap' }}
                            </p>
                          </div>
                          <span class="material-symbols-outlined text-[20px] text-outline-variant shrink-0">chevron_right</span>
                        </a>
                      }
                    </div>
                  }
                } @else if (showFollowingList()) {
                  @if (followingList().length === 0) {
                    <div class="flex flex-col items-center gap-3 py-12 text-center">
                      <div class="w-16 h-16 rounded-3xl bg-surface-container flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-outline">person_search</span>
                      </div>
                      <p class="text-base font-bold text-on-surface">Not following anyone yet</p>
                      <p class="text-sm text-outline">Find athletes to keep up with their activity.</p>
                    </div>
                  } @else {
                    <div class="grid grid-cols-2 gap-3">
                      @for (f of followingList(); track f.id) {
                        <a [routerLink]="['/users', f.id]"
                           class="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-low active:scale-[0.99] transition-all border border-transparent hover:border-outline-variant/20">
                          <div class="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-surface-container-lowest"
                               [style.background-color]="getAvatarBg(f.username)">
                            @if (f.profilePhotoUrl) {
                              <img [src]="f.profilePhotoUrl" class="w-full h-full object-cover" [alt]="f.username" />
                            } @else {
                              <span class="text-sm font-black text-on-primary-container">{{ getInitials(f.username) }}</span>
                            }
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm text-on-surface truncate">{{ atSign(f.username) }}</p>
                            <p class="text-xs text-outline truncate">
                              {{ f.favoriteSports || 'Athlete on SportMap' }}
                            </p>
                          </div>
                          <span class="material-symbols-outlined text-[20px] text-outline-variant shrink-0">chevron_right</span>
                        </a>
                      }
                    </div>
                  }
                }
              </div>
            </section>
          }

          @if (showEdit()) {
            <section class="bg-surface-container-lowest rounded-2xl p-8 space-y-6 border border-outline-variant/10 shadow-sm mb-12">
              <h3 class="text-sm font-black uppercase tracking-widest text-outline">Edit Profile</h3>
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Profile Photo</p>
                  <button (click)="photoInput.click()"
                          [disabled]="savingPhoto()"
                          class="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container-low text-sm font-semibold text-on-surface active:scale-95 transition-all disabled:opacity-60">
                    @if (savingPhoto()) {
                      <span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Uploading…
                    } @else {
                      <span class="material-symbols-outlined text-[18px]">photo_camera</span>
                      Upload Photo
                    }
                  </button>
                </div>
                <div class="space-y-2">
                  <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Username</p>
                  <div class="flex gap-2">
                    <input [(ngModel)]="pendingUsername"
                           class="flex-1 bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface border-none outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                           (keyup.enter)="saveName()" />
                    <button (click)="saveName()"
                            class="px-5 py-3 rounded-xl bg-primary text-on-primary text-sm font-bold active:scale-95 transition-all">
                      Save
                    </button>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Favorite Sports</p>
                  @if (sportsChanged()) {
                    <button (click)="saveSports()"
                            [disabled]="savingSports()"
                            class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold active:scale-95 transition-all disabled:opacity-60">
                      @if (savingSports()) {
                        <span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                      } @else {
                        <span class="material-symbols-outlined text-[14px]">check</span>
                      }
                      Save Sports
                    </button>
                  }
                </div>
                <div class="grid grid-cols-4 gap-3">
                  @for (sport of ALL_SPORTS; track sport.label) {
                    <button
                      type="button"
                      (click)="toggleSport(sport.label)"
                      class="flex items-center gap-2 p-3 rounded-xl border transition-all active:scale-95 text-left"
                      [class]="pendingSports().includes(sport.label)
                        ? 'border-transparent shadow-sm'
                        : 'bg-surface-container-low border-outline-variant/20'"
                      [style.background-color]="pendingSports().includes(sport.label) ? sport.color + '22' : ''"
                      [style.border-color]="pendingSports().includes(sport.label) ? sport.color + '66' : ''"
                    >
                      <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                           [style.background-color]="sport.color + '22'">
                        <span class="material-symbols-outlined text-[14px]" [style.color]="sport.color">{{ sport.icon }}</span>
                      </div>
                      <span class="text-xs font-semibold text-on-surface flex-1">{{ sport.label }}</span>
                      @if (pendingSports().includes(sport.label)) {
                        <span class="material-symbols-outlined text-[14px]" [style.color]="sport.color">check_circle</span>
                      }
                    </button>
                  }
                </div>
              </div>

              <button (click)="showEdit.set(false)"
                      class="flex items-center gap-2 px-6 py-3 rounded-xl border border-outline-variant/20 text-sm font-semibold text-on-surface-variant active:scale-95 transition-all">
                <span class="material-symbols-outlined text-[16px]">close</span>
                Cancel
              </button>
            </section>
          }

          <div class="grid lg:grid-cols-12 gap-8">
            <div class="lg:col-span-4 space-y-8">
              <div class="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm space-y-6">
                <h3 class="text-sm font-black uppercase tracking-widest text-outline">Performance Stats</h3>

                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-on-surface">Total Joined</span>
                    <span class="text-sm font-black text-primary">{{ joinedActivities().length }}</span>
                  </div>
                  <div class="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full transition-all"
                         [style.width]="progressBar(joinedActivities().length, 20)"></div>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-on-surface">Fav. Sports</span>
                    <span class="text-sm font-black text-primary">{{ sports().length }}</span>
                  </div>
                  <div class="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full transition-all"
                         [style.width]="progressBar(sports().length, ALL_SPORTS.length)"></div>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-semibold text-on-surface">Followers</span>
                    <span class="text-sm font-black text-primary">{{ followerCount() }}</span>
                  </div>
                  <div class="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full transition-all"
                         [style.width]="progressBar(followerCount(), 100)"></div>
                  </div>
                </div>
              </div>

              <div class="bg-surface-container-low p-8 rounded-xl space-y-4">
                <h3 class="text-sm font-black uppercase tracking-widest text-outline">Account</h3>
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-xl text-primary">mail</span>
                    <div class="min-w-0">
                      <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Email</p>
                      <p class="text-sm font-semibold text-on-surface truncate">{{ user()!.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-xl text-primary">shield</span>
                    <div class="flex-1">
                      <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Password</p>
                      <p class="text-sm font-semibold text-on-surface">••••••••</p>
                    </div>
                    <span class="text-xs font-bold text-outline bg-surface-container-lowest rounded-full px-2 py-0.5">Soon</span>
                  </div>
                </div>
                <button (click)="logout()"
                        class="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-full border border-outline-variant/20 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-lowest active:scale-95 transition-all">
                  <span class="material-symbols-outlined text-[18px]">logout</span>
                  Sign out
                </button>
              </div>
            </div>

            <div class="lg:col-span-8">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-black tracking-tight text-on-surface">Activity History</h2>
              </div>

              @if (joinedActivities().length === 0) {
                <div class="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/10">
                  <span class="material-symbols-outlined text-5xl text-outline block mb-3">event_busy</span>
                  <p class="text-on-surface-variant">No joined activities yet</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (activity of joinedActivities(); track activity.id) {
                    <div class="flex gap-4 bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
                      <div class="w-full md:w-40 h-32 shrink-0 relative overflow-hidden">
                        <img [src]="getSportPhoto(activity.sport)" [alt]="activity.sport"
                             class="w-40 h-full object-cover"
                             (error)="onActivityImgError($event)" />
                        <div class="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                          {{ activity.sport }}
                        </div>
                      </div>
                      <div class="flex-1 p-4 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 class="font-black text-on-surface text-base leading-tight tracking-tight">{{ activity.title }}</h4>
                          <div class="flex items-center gap-1 text-xs text-on-surface-variant mt-1">
                            <span class="material-symbols-outlined text-[12px]">location_on</span>
                            <span class="truncate">{{ activity.location?.name ?? activity.sport }}</span>
                          </div>
                        </div>
                        <div class="flex items-center justify-between mt-2">
                          <div class="flex items-center gap-1 text-xs text-on-surface-variant">
                            <span class="material-symbols-outlined text-[12px]">schedule</span>
                            {{ activity.dateTime | date:'EEE, d MMM · HH:mm' }}
                          </div>
                          <span class="text-[10px] font-bold text-outline">{{ getRelativeDate(activity.dateTime) }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </main>
      }

      <app-bottom-nav />
    </div>
  `,
})
export class ProfileComponent {
  protected ALL_SPORTS = ALL_SPORTS;

  @ViewChild('photoInput') photoInputRef!: ElementRef<HTMLInputElement>;

  private auth = inject(AuthService);
  private usersService = inject(UsersService);
  private friendsService = inject(FriendsService);
  private activitiesService = inject(ActivitiesService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  user             = signal<User | null>(null);
  loading          = signal(true);
  sports           = signal<string[]>([]);
  pendingSports    = signal<string[]>([]);
  savingSports     = signal(false);
  savingPhoto      = signal(false);
  showEdit         = signal(false);
  joinedActivities = signal<Activity[]>([]);

  followerCount     = signal(0);
  followingCount    = signal(0);
  followersList     = signal<User[]>([]);
  followingList     = signal<User[]>([]);
  showFollowersList = signal(false);
  showFollowingList = signal(false);

  pendingUsername = '';

  sportsChanged = computed(() =>
    JSON.stringify([...this.pendingSports()].sort()) !==
    JSON.stringify([...this.sports()].sort()),
  );

  constructor() {
    this.usersService.getMe().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.loading.set(false);
        return EMPTY;
      }),
    ).subscribe(u => {
      this.user.set(u);
      const parsed = u.favoriteSports?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
      this.sports.set(parsed);
      this.pendingSports.set([...parsed]);
      this.pendingUsername = u.username;
      this.loading.set(false);

      this.friendsService.getFollowers(u.id).pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => EMPTY),
      ).subscribe(r => {
        this.followerCount.set(r.totalCount);
        this.followersList.set([...r.items]);
      });

      this.friendsService.getMyFollowing().pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => EMPTY),
      ).subscribe(r => {
        this.followingCount.set(r.totalCount);
        this.followingList.set([...r.items]);
      });
    });

    this.activitiesService.getJoined().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => EMPTY),
    ).subscribe(activities => this.joinedActivities.set(activities));
  }

  onPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      this.toast.error('Use a JPG, PNG, WebP or GIF image.', 'Invalid file type');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Pick something under 5 MB.', 'File too large');
      input.value = '';
      return;
    }

    this.savingPhoto.set(true);
    this.usersService.uploadPhoto(file).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        const msg = err?.error?.message ?? 'Could not upload photo. Try again.';
        this.toast.error(msg, 'Upload failed');
        this.savingPhoto.set(false);
        input.value = '';
        return EMPTY;
      }),
    ).subscribe(({ user }) => {
      const bust = `?v=${Date.now()}`;
      const url = user.profilePhotoUrl ? user.profilePhotoUrl.split('?')[0] + bust : null;
      this.user.set({ ...user, profilePhotoUrl: url });
      this.savingPhoto.set(false);
      this.toast.success('Profile photo updated!');
      input.value = '';
    });
  }

  toggleFollowers(): void {
    this.showFollowersList.update(v => !v);
    if (this.showFollowingList()) this.showFollowingList.set(false);
  }

  toggleFollowing(): void {
    this.showFollowingList.update(v => !v);
    if (this.showFollowersList()) this.showFollowersList.set(false);
  }

  closeLists(): void {
    this.showFollowersList.set(false);
    this.showFollowingList.set(false);
  }

  toggleSport(label: string): void {
    this.pendingSports.update(arr =>
      arr.includes(label) ? arr.filter(s => s !== label) : [...arr, label],
    );
  }

  saveSports(): void {
    const u = this.user();
    if (!u) return;
    this.savingSports.set(true);
    const favoriteSports = this.pendingSports().join(', ');
    this.usersService.update({ favoriteSports }).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.toast.error('Could not save sports. Try again.');
        this.savingSports.set(false);
        return EMPTY;
      }),
    ).subscribe(updated => {
      this.user.set(updated);
      const parsed = updated.favoriteSports?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
      this.sports.set(parsed);
      this.pendingSports.set([...parsed]);
      this.savingSports.set(false);
      this.toast.success('Favorite sports updated!');
    });
  }

  saveName(): void {
    const u = this.user();
    const name = this.pendingUsername.trim();
    if (!u || !name || name === u.username) return;
    this.usersService.update({ username: name }).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.toast.error('Could not update username. Try again.');
        return EMPTY;
      }),
    ).subscribe(updated => {
      this.user.set(updated);
      this.toast.success('Username updated!');
    });
  }

  logout(): void { this.auth.logout(); }

  getSportColor(sport: string): string { return sportColor(sport); }
  getSportIcon(sport: string): string { return sportIcon(sport); }
  getSportPhoto(sport: string): string { return sportPhoto(sport); }

  onActivityImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== FALLBACK_PHOTO) img.src = FALLBACK_PHOTO;
  }
  getRelativeDate(dateStr: string): string { return relativeDate(dateStr); }
  getInitials(username: string): string { return initials(username); }
  getAvatarBg(username: string): string { return avatarBg(username); }
  atSign(username: string): string { return '@' + username; }

  progressBar(value: number, max: number): string {
    const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
    return `${pct}%`;
  }
}
