import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AddTransactionDialogComponent, TxDialogData, TxDialogResult } from '../../shared/dialogs/add-transaction-dialog/add-transaction-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { UiDialogService } from '../../core/ui/ui-dialog.service';

type TxType = 'expense' | 'income';

type Transaction = {
  id: string;
  type: TxType;
  title: string;
  category: string;
  date: string; // display string for now
  amount: number;
  icon: string;
};

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent {
  private readonly uiDialog = inject(UiDialogService);
  query = '';
  tab: 'all' | TxType = 'all';
  category = 'Tous';

  categories = ['Tous', 'Logement', 'Alimentation', 'Transport', 'Loisirs', 'Santé', 'Autres'];

  txs: Transaction[] = [
    { id: '1', type: 'income', title: 'Salaire', category: 'Revenus', date: '12 fév', amount: 3775, icon: 'payments' },
    { id: '2', type: 'expense', title: 'Appartement', category: 'Logement', date: '10 fév', amount: 1270, icon: 'home' },
    { id: '3', type: 'expense', title: 'Courses', category: 'Alimentation', date: '09 fév', amount: 82, icon: 'shopping_cart' },
    { id: '4', type: 'expense', title: 'Essence', category: 'Transport', date: '05 fév', amount: 65, icon: 'local_gas_station' },
    { id: '5', type: 'expense', title: 'Netflix', category: 'Loisirs', date: '03 fév', amount: 13.99, icon: 'movie' },
    { id: '6', type: 'income', title: 'Freelance', category: 'Revenus', date: '02 fév', amount: 420, icon: 'work' },
  ];

  get filtered(): Transaction[] {
    const q = this.query.trim().toLowerCase();

    return this.txs
      .filter(t => (this.tab === 'all' ? true : t.type === this.tab))
      .filter(t => (this.category === 'Tous' ? true : t.category === this.category))
      .filter(t => (!q ? true : `${t.title} ${t.category}`.toLowerCase().includes(q)));
  }

  get totalShown(): number {
    // total des montants affichés (utile en UI)
    const list = this.filtered;
    return list.reduce((sum, t) => sum + (t.type === 'expense' ? -t.amount : t.amount), 0);
  }

  setTab(v: 'all' | TxType) {
    this.tab = v;
  }

  setCategory(c: string) {
    this.category = c;
  }

  addTransaction() {
    const defaultType = this.tab === 'income' ? 'income' : 'expense';

    this.uiDialog.openTransactionSheet({ mode: 'add', defaultType })
      .subscribe((res) => {
        if (!res || res.action !== 'create') return;

        const p = res.payload;
        this.txs = [
          {
            id: crypto.randomUUID(),
            type: p.type,
            title: p.title,
            category: p.category,
            date: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            amount: p.amount,
            icon: p.type === 'income' ? 'payments' : 'receipt_long',
          },
          ...this.txs,
        ];
      });
  }

  editTransaction(tx: Transaction) {
    const draft = {
      id: tx.id,
      type: tx.type,
      title: tx.title,
      category: tx.category,
      date: new Date().toISOString().slice(0, 10),
      amount: tx.amount,
      note: '',
    };

    this.uiDialog.openTransactionSheet({ mode: 'edit', transaction: draft })
      .subscribe((res) => {
        if (!res || res.action !== 'update') return;

        const p = res.payload;
        this.txs = this.txs.map((t) =>
          t.id === tx.id
            ? { ...t, type: p.type, title: p.title, category: p.category, amount: p.amount }
            : t
        );
      });
  }

  deleteTransaction(tx: Transaction) {
    this.uiDialog.openConfirmSheet({
      title: 'Supprimer',
      message: `Supprimer "${tx.title}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      tone: 'danger',
      icon: 'delete'
    }).subscribe(res => {
      if (!res?.confirmed) return;
      this.txs = this.txs.filter(t => t.id !== tx.id);
    });
  }


}
