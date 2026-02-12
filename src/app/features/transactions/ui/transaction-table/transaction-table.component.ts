import { Component, HostListener, input, output } from '@angular/core';
import { Category } from '../../../categories/data-access/categories.models';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SoldeGlobalComponent } from '../solde-global/solde-global.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  imports: [CommonModule, CurrencyPipe, MatIconModule, SoldeGlobalComponent, MatButtonModule, MatFormFieldModule, MatInputModule],
})
export class TransactionTableComponent {
  // Type du tableau (revenu ou dépense)
  type = input<'income' | 'expense'>('income');

  // Liste des transactions à afficher (déjà filtrées par le parent)
  transactions = input<any[]>([]);

  // Dictionnaire { [id]: Category } pour lookup rapide dans le template
  categoriesById = input<Record<number, Category>>({});

  // Outputs pour l'édition et la suppression
  edit = output<any>();
  delete = output<number>();
  isMobile = false;

  // Transactions filtrées par type (revenu ou dépense)
  get filtered() {
    return this.transactions().filter((t) => t.type === this.type());
  }

  // Total du tableau
  get total() {
    return this.filtered.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  }

  // Edition inline du montant
  onAmountChange(transaction: any, event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(value) && value >= 0) {
      this.edit.emit({ ...transaction, amount: value, _inline: true });
    }
  }

  // Edition via modale
  onEditClick(transaction: any) {
    this.edit.emit({ ...transaction, _inline: false });
  }

  @HostListener('window:resize')
  checkMobile() {
    this.isMobile = window.innerWidth < 700;
  }
  trackById(index: number, item: any) {
    return item.id;
  }

  // Pour le swipe (tu peux utiliser HammerJS ou pointer events natifs)
onSwipeLeft(transaction: any) {
  if (this.isMobile) {
    transaction._swipeDelete = true;
    setTimeout(() => {
      transaction._swipeDelete = false;
      this.delete.emit(transaction.id);
    }, 400); // animation + suppression
  }
}

onSwipeRight(transaction: any) {
  if (this.isMobile) {
    transaction._swipeEdit = true;
    setTimeout(() => {
      transaction._swipeEdit = false;
      this.onEditClick(transaction);
    }, 400); // animation + édition
  }
}

}
