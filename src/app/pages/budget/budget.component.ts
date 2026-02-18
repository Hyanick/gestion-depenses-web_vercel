import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { UiDialogService } from '../../core/ui/ui-dialog.service';

type BudgetItem = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  label: string;
  amount: number;
  icon: string;
  color: string;
};

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
})
export class BudgetComponent {
  private readonly uiDialog = inject(UiDialogService);
  monthLabel = 'février 2026';

  items: BudgetItem[] = [
    { id: 'i1', type: 'income', category: 'Salaire', label: 'Salaire Annie', amount: 3775, icon: 'work', color: '#3aa0d8' },
    { id: 'i2', type: 'income', category: 'CAF', label: 'CAF enfants', amount: 150, icon: 'emoji_events', color: '#22c55e' },
    { id: 'i3', type: 'income', category: 'Salaire', label: 'Salaire Yanick', amount: 3700, icon: 'work', color: '#3aa0d8' },

    { id: 'e1', type: 'expense', category: 'Logement', label: 'Appartement (charges+taxes...)', amount: 1270, icon: 'home', color: '#f59e0b' },
    { id: 'e2', type: 'expense', category: 'Maison', label: 'Maison (charges+imprévus)', amount: 2440, icon: 'cottage', color: '#8b5cf6' },
    { id: 'e3', type: 'expense', category: 'Éducation', label: 'Écoles enfants', amount: 800, icon: 'school', color: '#eab308' },
    { id: 'e4', type: 'expense', category: 'Alimentation', label: 'Ration', amount: 350, icon: 'restaurant', color: '#22c55e' },
  ];

  editingId: string | null = null;

  get incomes() { return this.items.filter(x => x.type === 'income'); }
  get expenses() { return this.items.filter(x => x.type === 'expense'); }

  get totalIncome() { return this.incomes.reduce((s, x) => s + (Number(x.amount) || 0), 0); }
  get totalExpense() { return this.expenses.reduce((s, x) => s + (Number(x.amount) || 0), 0); }
  get balance() { return this.totalIncome - this.totalExpense; }

  startEdit(id: string) { this.editingId = id; }
  stopEdit() { this.editingId = null; }

  addIncome() {
    const id = crypto.randomUUID();
    this.items = [
      { id, type: 'income', category: 'Revenu', label: 'Nouveau revenu', amount: 0, icon: 'payments', color: '#3aa0d8' },
      ...this.items
    ];
    this.editingId = id;
  }

  addExpense() {
    const id = crypto.randomUUID();
    this.items = [
      ...this.items,
      { id, type: 'expense', category: 'Dépense', label: 'Nouvelle dépense', amount: 0, icon: 'receipt_long', color: '#ef4444' }
    ];
    this.editingId = id;
  }

  remove(id: string) {
    const it = this.items.find(x => x.id === id);
    if (!it) return;
    const ok = confirm(`Supprimer "${it.category}" ?`);
    if (!ok) return;
    this.items = this.items.filter(x => x.id !== id);
  }
  openAddExpense() {
    this.uiDialog.openTransactionSheet({ mode: 'add', defaultType: 'expense' })
      .subscribe(res => {
        if (!res || res.action !== 'create') return;
        console.log('NEW TX FROM BUDGET', res.payload);
      });
  }
}
