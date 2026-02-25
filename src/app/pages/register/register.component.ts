import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
  <div class="auth">
    <div class="card">
      <div class="title">Créer un compte</div>
      <div class="subtitle muted">Minimal pour démarrer</div>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Nom</mat-label>
        <input matInput [ngModel]="name()" (ngModelChange)="name.set($event)" autocomplete="name" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Identifiant</mat-label>
        <input matInput [ngModel]="username()" (ngModelChange)="username.set($event)" autocomplete="username" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Email (option)</mat-label>
        <input matInput [ngModel]="email()" (ngModelChange)="email.set($event)" autocomplete="email" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Téléphone (option)</mat-label>
        <input matInput type="tel" [ngModel]="phone()" (ngModelChange)="phone.set($event)" autocomplete="tel" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Mot de passe</mat-label>
        <input
          matInput
          [type]="show() ? 'text' : 'password'"
          [ngModel]="password()"
          (ngModelChange)="password.set($event)"
          autocomplete="new-password" />

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
    .auth{ min-height: 100vh; display:flex; align-items:center; justify-content:center; padding: 18px; }
    .card{
      width: 100%; max-width: 460px;
      background:#fff; border-radius: 22px;
      box-shadow: 0 18px 50px rgba(15,23,42,.10);
      padding: 18px;
      display:flex; flex-direction:column; gap: 12px;
    }
    .title{ font-size: 22px; font-weight: 950; }
    .subtitle{ margin-top: -6px; }
    .muted{ color: rgba(15,23,42,.55); }
    .w{ width: 100%; }
    .cta{ height: 48px; border-radius: 999px; font-weight: 900; }
    .links{ display:flex; gap:8px; justify-content:center; padding-top: 6px; }
    a{ font-weight: 900; text-decoration: none; }
    .warn{
      border-left: 4px solid #f59e0b;
      background: rgba(245,158,11,.10);
      border-radius: 14px;
      padding: 10px;
      font-weight: 700;
      color: rgba(15,23,42,.85);
    }
    .err{
      border-left: 4px solid #ef4444;
      background: rgba(239,68,68,.08);
      border-radius: 14px;
      padding: 10px;
      font-weight: 700;
    }
  `],
})
export class RegisterComponent {
  // ✅ signals (sinon computed ne se met pas à jour)
  name = signal('');
  username = signal('');
  email = signal('');
  phone = signal('');
  password = signal('');

  loading = signal(false);
  error = signal<string | null>(null);
  show = signal(false);

  contactOk = computed(() => !!this.email().trim() || !!this.phone().trim());
  formOk = computed(() =>
    !!this.name().trim() &&
    !!this.username().trim() &&
    !!this.password().trim() &&
    this.contactOk()
  );

  constructor(private auth: AuthService, private router: Router) {
    // debug optionnel
    effect(() => {
      // console.log('contactOk', this.contactOk(), 'formOk', this.formOk());
    });
  }

  submit() {
    this.error.set(null);
    this.loading.set(true);

    this.auth.register({
      name: this.name().trim(),
      username: this.username().trim(),
      password: this.password(),
      email: this.email().trim() || undefined,
      phone: this.phone().trim() || undefined,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        // ⚠️ ton routing: c’est /home (budget) pas /budget
        this.router.navigateByUrl('/home');
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message ?? 'Création impossible');
      },
    });
  }
}