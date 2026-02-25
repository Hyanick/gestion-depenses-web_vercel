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
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule
  ],
  template: `
  <div class="auth">
    <div class="card">
      <div class="title">Connexion</div>
      <div class="subtitle muted">Accède à tes budgets</div>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Identifiant</mat-label>
        <input matInput [(ngModel)]="username" autocomplete="username" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Mot de passe</mat-label>
        <input matInput [type]="show() ? 'text' : 'password'" [(ngModel)]="password" autocomplete="current-password" />
        <button mat-icon-button matSuffix type="button" (click)="show.set(!show())">
          <mat-icon>{{ show() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>

      @if (error()) {
        <div class="err">{{ error() }}</div>
      }

      <button mat-flat-button class="cta" (click)="submit()" [disabled]="loading() || !username.trim() || !password">
        {{ loading() ? 'Connexion…' : 'Se connecter' }}
      </button>

      <div class="links">
        <span class="muted">Pas encore de compte ?</span>
        <a routerLink="/register">Créer un compte</a>
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
    .err{ border-left:4px solid #ef4444; background:rgba(239,68,68,.08); border-radius:14px; padding:10px; font-weight:700; }
  `],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  show = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router,
    private store: Store,
  ) { }

  submit() {
    this.error.set(null);
    this.loading.set(true);

    // ✅ reset store avant de rentrer dans l'app (évite résidus d'un ancien user)
    this.store.dispatch(new GlobalReinit());

    this.auth.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/home');
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message ?? 'Connexion impossible');
      },
    });
  }
}