import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AuthHistoryItem, BudgetHistoryItem, HistoryService } from '../../core/history/history.Service';



@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatTabsModule, MatIconModule],
  template: `
  <div class="history-page">
    <div class="hero card">
      <div>
        <div class="title">Historique</div>
        <div class="subtitle">Transactions et connexions</div>
      </div>

      <div class="month-picker">
        <label>Mois</label>
        <input type="month" [ngModel]="monthKey()" (ngModelChange)="monthKey.set($event)" />
        <button mat-stroked-button (click)="loadBudgetHistory()">Charger</button>
      </div>
    </div>

    <mat-tab-group>
      <mat-tab label="Transactions">
        <div class="list">
          @if (loadingBudget()) {
            <div class="empty card">Chargement…</div>
          } @else if (budgetHistory().length === 0) {
            <div class="empty card">Aucun historique pour ce mois.</div>
          } @else {
            @for (item of budgetHistory(); track item.id) {
              <div class="row card">
                <div class="row-head">
                  <div class="badge" [class.danger]="item.action === 'delete'">
                    {{ item.action }}
                  </div>
                  <div class="date">{{ formatDate(item.createdAt) }}</div>
                </div>

                <div class="detail">
                  <div><strong>Avant :</strong> {{ shortJson(item.before) }}</div>
                  <div><strong>Après :</strong> {{ shortJson(item.after) }}</div>
                </div>
              </div>
            }
          }
        </div>
      </mat-tab>

      <mat-tab label="Connexions">
        <div class="list">
          @if (loadingAuth()) {
            <div class="empty card">Chargement…</div>
          } @else if (authHistory().length === 0) {
            <div class="empty card">Aucun historique de connexion.</div>
          } @else {
            @for (item of authHistory(); track item.id) {
              <div class="row card">
                <div class="row-head">
                  <div class="badge" [class.ok]="item.success" [class.danger]="!item.success">
                    {{ item.success ? 'success' : 'failed' }}
                  </div>
                  <div class="date">{{ formatDate(item.createdAt) }}</div>
                </div>

                <div class="detail">
                  <div><strong>IP :</strong> {{ item.ip || '—' }}</div>
                  <div><strong>User-Agent :</strong> {{ item.userAgent || '—' }}</div>
                  <div><strong>Raison :</strong> {{ item.reason || '—' }}</div>
                </div>
              </div>
            }
          }
        </div>
      </mat-tab>
    </mat-tab-group>
  </div>
  `,
  styles: [`
    .history-page{ display:grid; gap:14px; }
    .card{
      background:#fff;
      border-radius:18px;
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
    .title{ font-size:22px; font-weight:950; }
    .subtitle{ color:rgba(15,23,42,.55); margin-top:4px; }
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
    .list{ display:grid; gap:10px; margin-top:12px; }
    .row{ padding:12px; }
    .row-head{
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:10px;
      margin-bottom:8px;
    }
    .badge{
      background:rgba(15,23,42,.08);
      border-radius:999px;
      padding:4px 10px;
      font-size:12px;
      font-weight:900;
      text-transform:uppercase;
    }
    .badge.ok{ background:rgba(34,197,94,.12); color:#16a34a; }
    .badge.danger{ background:rgba(239,68,68,.12); color:#ef4444; }
    .date{ color:rgba(15,23,42,.55); font-size:12px; }
    .detail{
      display:grid;
      gap:6px;
      color:rgba(15,23,42,.84);
      font-size:13px;
    }
    .empty{
      padding:18px;
      color:rgba(15,23,42,.55);
    }
  `],
})
export class HistoryComponent {
  monthKey = signal(this.currentMonthKey());

  budgetHistory = signal<BudgetHistoryItem[]>([]);
  authHistory = signal<AuthHistoryItem[]>([]);

  loadingBudget = signal(false);
  loadingAuth = signal(false);

  constructor(private history: HistoryService) {
    this.loadBudgetHistory();
    this.loadAuthHistory();
  }

  private currentMonthKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

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

  shortJson(value: any) {
    if (value == null) return '—';
    const text = JSON.stringify(value);
    return text.length > 180 ? text.slice(0, 180) + '…' : text;
  }
}