import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AuthHistoryItem, BudgetHistoryAction, BudgetHistoryItem, HistoryService } from '../../core/history/history.Service';



@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
  ],
  template: `
  <div class="history-page">

    <!-- En-tête de page -->
    <div class="hero card">
      <div>
        <div class="title">Historique</div>
        <div class="subtitle">Transactions et connexions</div>
      </div>

      <!-- Sélecteur de mois pour l'historique budget -->
      <div class="month-picker">
        <label>Mois</label>
        <input
          type="month"
          [ngModel]="monthKey()"
          (ngModelChange)="monthKey.set($event)"
        />

        <button mat-stroked-button (click)="loadBudgetHistory()">
          Charger
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters card">
      <div class="filters__row">

        <!-- Filtre texte -->
        <div class="field">
          <label>Recherche</label>
          <input
            type="text"
            [ngModel]="search()"
            (ngModelChange)="search.set($event)"
            placeholder="Ex: delete, Carrefour, login..."
          />
        </div>

        <!-- Filtre action budget -->
        <div class="field">
          <label>Action budget</label>
          <select
            [ngModel]="budgetActionFilter()"
            (ngModelChange)="budgetActionFilter.set($event)"
          >
            <option value="">Toutes</option>
            <option value="create">create</option>
            <option value="update">update</option>
            <option value="delete">delete</option>
            <option value="replace_month">replace_month</option>
          </select>
        </div>

        <!-- Filtre connexions -->
        <div class="field">
          <label>Connexions</label>
          <select
            [ngModel]="authStatusFilter()"
            (ngModelChange)="authStatusFilter.set($event)"
          >
            <option value="">Toutes</option>
            <option value="success">Succès</option>
            <option value="failed">Échec</option>
          </select>
        </div>
      </div>

      <!-- Actions export -->
      <div class="filters__actions">
        <button mat-stroked-button (click)="exportBudgetCsv()">
          <mat-icon>download</mat-icon>
          Export CSV budget
        </button>

        <button mat-stroked-button (click)="exportAuthCsv()">
          <mat-icon>download</mat-icon>
          Export CSV connexions
        </button>
      </div>
    </div>

    <!-- Onglets -->
    <mat-tab-group>

      <!-- Onglet transactions -->
      <mat-tab label="Transactions">
        <div class="list">

          @if (loadingBudget()) {
            <div class="empty card">Chargement…</div>
          } @else if (filteredBudgetHistory().length === 0) {
            <div class="empty card">Aucun historique pour ce mois.</div>
          } @else {
            @for (item of filteredBudgetHistory(); track item.id) {
              <div class="row card">

                <!-- Ligne d'en-tête -->
                <button class="row-head" type="button" (click)="toggleBudget(item.id)">
                  <div class="row-head__left">
                    <div class="badge" [class.danger]="item.action === 'delete'">
                      {{ item.action }}
                    </div>
                    <div class="date">{{ formatDate(item.createdAt) }}</div>
                  </div>

                  <mat-icon>
                    {{ expandedBudgetId() === item.id ? 'expand_less' : 'expand_more' }}
                  </mat-icon>
                </button>

                <!-- Résumé court -->
                <div class="summary">
                  {{ budgetSummary(item) }}
                </div>

                <!-- Détail repliable -->
                @if (expandedBudgetId() === item.id) {
                  <div class="detail">
                    <div class="detail-block">
                      <div class="detail-title">Avant</div>
                      <pre>{{ prettyJson(item.before) }}</pre>
                    </div>

                    <div class="detail-block">
                      <div class="detail-title">Après</div>
                      <pre>{{ prettyJson(item.after) }}</pre>
                    </div>
                  </div>
                }
              </div>
            }
          }

        </div>
      </mat-tab>

      <!-- Onglet connexions -->
      <mat-tab label="Connexions">
        <div class="list">

          @if (loadingAuth()) {
            <div class="empty card">Chargement…</div>
          } @else if (filteredAuthHistory().length === 0) {
            <div class="empty card">Aucun historique de connexion.</div>
          } @else {
            @for (item of filteredAuthHistory(); track item.id) {
              <div class="row card">

                <!-- Ligne d'en-tête -->
                <button class="row-head" type="button" (click)="toggleAuth(item.id)">
                  <div class="row-head__left">
                    <div class="badge" [class.ok]="item.success" [class.danger]="!item.success">
                      {{ item.success ? 'success' : 'failed' }}
                    </div>
                    <div class="date">{{ formatDate(item.createdAt) }}</div>
                  </div>

                  <mat-icon>
                    {{ expandedAuthId() === item.id ? 'expand_less' : 'expand_more' }}
                  </mat-icon>
                </button>

                <!-- Résumé court -->
                <div class="summary">
                  {{ authSummary(item) }}
                </div>

                <!-- Détail repliable -->
                @if (expandedAuthId() === item.id) {
                  <div class="detail">
                    <div class="detail-block">
                      <div class="detail-title">Adresse IP</div>
                      <div>{{ item.ip || '—' }}</div>
                    </div>

                    <div class="detail-block">
                      <div class="detail-title">User-Agent</div>
                      <div>{{ item.userAgent || '—' }}</div>
                    </div>

                    <div class="detail-block">
                      <div class="detail-title">Raison</div>
                      <div>{{ item.reason || '—' }}</div>
                    </div>
                  </div>
                }
              </div>
            }
          }

        </div>
      </mat-tab>
    </mat-tab-group>
  </div>
  `,
  styles: [`
    .history-page{
      display:grid;
      gap:14px;
    }

    .card{
      background:#fff;
      border-radius:20px;
      box-shadow:0 10px 30px rgba(15,23,42,.06);
    }

    .hero{
      padding:14px;
      display:flex;
      justify-content:space-between;
      gap:12px;
      align-items:flex-start;
      flex-wrap:wrap;
    }

    .title{
      font-size:22px;
      font-weight:950;
      letter-spacing:-0.2px;
    }

    .subtitle{
      color:rgba(15,23,42,.55);
      margin-top:4px;
    }

    .month-picker{
      display:flex;
      gap:8px;
      align-items:center;
      flex-wrap:wrap;
    }

    .month-picker label{
      font-size:12px;
      color:rgba(15,23,42,.6);
      font-weight:800;
    }

    .month-picker input{
      border:1px solid rgba(15,23,42,.12);
      background:#fff;
      border-radius:12px;
      padding:8px 10px;
    }

    .filters{
      padding:14px;
      display:grid;
      gap:12px;
    }

    .filters__row{
      display:grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap:10px;
    }

    .filters__actions{
      display:flex;
      gap:10px;
      flex-wrap:wrap;
    }

    .field{
      display:grid;
      gap:6px;
    }

    .field label{
      font-size:12px;
      font-weight:800;
      color:rgba(15,23,42,.6);
    }

    .field input,
    .field select{
      border:1px solid rgba(15,23,42,.12);
      background:#fff;
      border-radius:12px;
      padding:10px 12px;
      outline:none;
    }

    .list{
      display:grid;
      gap:10px;
      margin-top:12px;
    }

    .row{
      padding:12px;
    }

    .row-head{
      width:100%;
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:10px;
      margin-bottom:8px;
      border:none;
      background:transparent;
      padding:0;
      cursor:pointer;
      text-align:left;
    }

    .row-head__left{
      display:flex;
      align-items:center;
      gap:10px;
      flex-wrap:wrap;
    }

    .badge{
      background:rgba(15,23,42,.08);
      border-radius:999px;
      padding:4px 10px;
      font-size:12px;
      font-weight:900;
      text-transform:uppercase;
    }

    .badge.ok{
      background:rgba(34,197,94,.12);
      color:#16a34a;
    }

    .badge.danger{
      background:rgba(239,68,68,.12);
      color:#ef4444;
    }

    .date{
      color:rgba(15,23,42,.55);
      font-size:12px;
    }

    .summary{
      color:rgba(15,23,42,.72);
      font-size:13px;
      margin-top:4px;
    }

    .detail{
      margin-top:12px;
      display:grid;
      gap:10px;
    }

    .detail-block{
      background:rgba(15,23,42,.03);
      border-radius:14px;
      padding:10px;
    }

    .detail-title{
      font-size:12px;
      font-weight:900;
      color:rgba(15,23,42,.6);
      margin-bottom:6px;
    }

    pre{
      margin:0;
      white-space:pre-wrap;
      word-break:break-word;
      font-size:12px;
      color:rgba(15,23,42,.86);
    }

    .empty{
      padding:18px;
      color:rgba(15,23,42,.55);
    }
  `],
})
export class HistoryComponent {
  /**
   * Mois courant affiché pour l'historique budget.
   */
  monthKey = signal(this.currentMonthKey());

  /**
   * Données brutes.
   */
  budgetHistory = signal<BudgetHistoryItem[]>([]);
  authHistory = signal<AuthHistoryItem[]>([]);

  /**
   * Etats de chargement.
   */
  loadingBudget = signal(false);
  loadingAuth = signal(false);

  /**
   * Filtres.
   */
  search = signal('');
  budgetActionFilter = signal<BudgetHistoryAction | ''>('');
  authStatusFilter = signal<'success' | 'failed' | ''>('');

  /**
   * Gestion expand/collapse.
   */
  expandedBudgetId = signal<string | null>(null);
  expandedAuthId = signal<string | null>(null);

  constructor(private history: HistoryService) {
    this.loadBudgetHistory();
    this.loadAuthHistory();
  }

  /**
   * Historique budget filtré.
   */
  filteredBudgetHistory = computed(() => {
    const search = this.search().trim().toLowerCase();
    const action = this.budgetActionFilter();

    return this.budgetHistory().filter((item) => {
      const actionOk = !action || item.action === action;

      const haystack = JSON.stringify(item).toLowerCase();
      const searchOk = !search || haystack.includes(search);

      return actionOk && searchOk;
    });
  });

  /**
   * Historique connexions filtré.
   */
  filteredAuthHistory = computed(() => {
    const search = this.search().trim().toLowerCase();
    const status = this.authStatusFilter();

    return this.authHistory().filter((item) => {
      const statusOk =
        !status ||
        (status === 'success' && item.success) ||
        (status === 'failed' && !item.success);

      const haystack = JSON.stringify(item).toLowerCase();
      const searchOk = !search || haystack.includes(search);

      return statusOk && searchOk;
    });
  });

  /**
   * Mois courant au format YYYY-MM.
   */
  private currentMonthKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  /**
   * Charge l'historique budget du mois sélectionné.
   */
  loadBudgetHistory() {
    this.loadingBudget.set(true);

    this.history.getBudgetHistory(this.monthKey()).subscribe({
      next: (items) => {
        this.budgetHistory.set(items);
        this.loadingBudget.set(false);
      },
      error: () => {
        this.budgetHistory.set([]);
        this.loadingBudget.set(false);
      },
    });
  }

  /**
   * Charge l'historique des connexions.
   */
  loadAuthHistory() {
    this.loadingAuth.set(true);

    this.history.getAuthHistory().subscribe({
      next: (items) => {
        this.authHistory.set(items);
        this.loadingAuth.set(false);
      },
      error: () => {
        this.authHistory.set([]);
        this.loadingAuth.set(false);
      },
    });
  }

  /**
   * Ouvre / ferme un détail budget.
   */
  toggleBudget(id: string) {
    this.expandedBudgetId.set(this.expandedBudgetId() === id ? null : id);
  }

  /**
   * Ouvre / ferme un détail connexion.
   */
  toggleAuth(id: string) {
    this.expandedAuthId.set(this.expandedAuthId() === id ? null : id);
  }

  /**
   * Format lisible de date.
   */
  formatDate(value: string) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';

    return d.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Résumé court d'une ligne budget.
   */
  budgetSummary(item: BudgetHistoryItem) {
    if (item.action === 'replace_month') {
      return `Remplacement global du mois ${item.monthKey}`;
    }

    return `Action ${item.action} sur la ligne ${item.lineId || '—'}`;
  }

  /**
   * Résumé court d'une ligne connexion.
   */
  authSummary(item: AuthHistoryItem) {
    return `${item.username || '—'} • ${item.ip || 'IP inconnue'}`;
  }

  /**
   * JSON formaté pour affichage expand.
   */
  prettyJson(value: any) {
    if (value == null) return '—';
    return JSON.stringify(value, null, 2);
  }

  /**
   * Export CSV de l'historique budget filtré.
   */
  exportBudgetCsv() {
    const rows = this.filteredBudgetHistory().map((item) => ({
      id: item.id,
      monthKey: item.monthKey,
      action: item.action,
      lineId: item.lineId ?? '',
      createdAt: item.createdAt,
      before: JSON.stringify(item.before ?? null),
      after: JSON.stringify(item.after ?? null),
    }));

    this.downloadCsv('budget-history.csv', rows);
  }

  /**
   * Export CSV de l'historique connexions filtré.
   */
  exportAuthCsv() {
    const rows = this.filteredAuthHistory().map((item) => ({
      id: item.id,
      username: item.username ?? '',
      success: item.success,
      reason: item.reason ?? '',
      ip: item.ip ?? '',
      userAgent: item.userAgent ?? '',
      createdAt: item.createdAt,
    }));

    this.downloadCsv('auth-history.csv', rows);
  }

  /**
   * Utilitaire générique d'export CSV.
   */
  private downloadCsv(filename: string, rows: Record<string, any>[]) {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(';'),
      ...rows.map((row) =>
        headers
          .map((key) => {
            const value = String(row[key] ?? '');
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(';'),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }
}