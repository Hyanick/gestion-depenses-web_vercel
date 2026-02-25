import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  imports: [RouterModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  userName = computed(() => this.auth.user()?.name ?? 'Utilisateur');
  username = computed(() => this.auth.user()?.username ?? '—');

  lastLoginDate = computed(() => {
    const iso = this.auth.lastLoginAt();
    if (!iso) return null;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  });

  lastLoginLabel = computed(() => {
    const d = this.lastLoginDate();
    if (!d) return '—';
    return d.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  lastLoginTooltip = computed(() => `Dernière connexion : ${this.lastLoginLabel()}`);

  logout() {
    // IMPORTANT : subscribe sinon la requête ne part pas et tap() ne s’exécute pas
    this.auth.logout().subscribe({
      next: () => { 
        this.router.navigateByUrl('/login')
      },
      error: () => { },
    });
  }
}