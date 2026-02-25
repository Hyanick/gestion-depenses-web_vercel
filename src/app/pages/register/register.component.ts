import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../core/auth/auth.service';
import { Store } from '@ngxs/store';
import { GlobalReinit } from '../../core/budget/budget.actions';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule
  ],
  template: `
  <div class="auth">
    <div class="card">
      <div class="title">Créer un compte</div>
      <div class="subtitle muted">Minimal pour démarrer</div>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Nom</mat-label>
        <input matInput [(ngModel)]="name" autocomplete="name" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Identifiant</mat-label>
        <input matInput [(ngModel)]="username" autocomplete="username" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Email (option)</mat-label>
        <input matInput [(ngModel)]="email" autocomplete="email" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Téléphone (option)</mat-label>
        <input matInput [(ngModel)]="phone" autocomplete="tel" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Mot de passe</mat-label>
        <input matInput [type]="show() ? 'text' : 'password'" [(ngModel)]="password" autocomplete="new-password" />
        <button mat-icon-button matSuffix type="button" (click)="show.set(!show())">
          <mat-icon>{{ show() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>

      @if (!contactOk()) {
        <div class="warn">Renseigne au moins un email ou un téléphone.</div>
      }

      @if (error()) {
        <div class="err">{{ error() }}</div>
      }

      <button mat-flat-button class="cta" (click)="submit()" [disabled]="loading() || !formOk()">
        {{ loading() ? 'Création…' : 'Créer mon compte' }}
      </button>

      <div class="links">
        <span class="muted">Déjà un compte ?</span>
        <a routerLink="/login">Se connecter</a>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:18px; }
    .card{ width:100%; max-width:460px; background:#fff; border-radius:22px; box-shadow:0 18px 50px rgba(15,23,42,.10); padding:18px; display:flex; flex-direction:column; gap:12px; }
    .title{ font-size:22px; font-weight:950; }
    .subtitle{ margin-top:-6px; }
    .muted{ color: rgba(15,23,42,.55); }
    .w{ width:100%; }
    .cta{ height:48px; border-radius:999px; font-weight:900; }
    .links{ display:flex; gap:8px; justify-content:center; padding-top:6px; }
    a{ font-weight:900; text-decoration:none; }
    .warn{ border-left:4px solid #f59e0b; background:rgba(245,158,11,.10); border-radius:14px; padding:10px; font-weight:700; color:rgba(15,23,42,.85); }
    .err{ border-left:4px solid #ef4444; background:rgba(239,68,68,.08); border-radius:14px; padding:10px; font-weight:700; }
  `],
})
export class RegisterComponent {
  name = '';
  username = '';
  email = '';
  phone = '';
  password = '';

  loading = signal(false);
  error = signal<string | null>(null);
  show = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router,
    private store: Store,
  ) { }

  contactOk() {
    return !!this.email.trim() || !!this.phone.trim();
  }

  formOk() {
    return !!this.name.trim() && !!this.username.trim() && !!this.password && this.contactOk();
  }

  submit() {
    this.error.set(null);
    this.loading.set(true);

    // ✅ reset store avant de rentrer dans l'app
    this.store.dispatch(new GlobalReinit());

    this.auth.register({
      name: this.name.trim(),
      username: this.username.trim(),
      password: this.password,
      email: this.email.trim() || undefined,
      phone: this.phone.trim() || undefined,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/home');
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message ?? 'Création impossible');
      },
    });
  }
}