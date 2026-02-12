import { animate, style, transition, trigger, query, group } from '@angular/animations';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { map, startWith } from 'rxjs';
import { Category } from '../features/categories/data-access/categories.models';
import { ViewportService } from '../services/viewport.service';
import { TransactionsProvider } from '../features/transactions/data-access/transactions.provider';
import { CategoriesProvider } from '../features/categories/data-access/categories.provider';
import { Transaction } from '../features/transactions/data-access/transactions.models';
import { TransactionTableComponent } from '../features/transactions/ui/transaction-table/transaction-table.component';
import { TransactionsFiltersComponent } from '../features/transactions/ui/transactions-filters/transactions-filters.component';
import { TransactionModalComponent } from '../features/transactions/ui/transaction-modal/transaction-modal.component';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-transaction-v2',
    animations: [
    trigger('monthSlideTransition', [
      transition(':increment', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }),
        ]),
        query(':enter', [style({ transform: 'translateX(100%)', opacity: 0 })]),
        group([
          query(':leave', [animate('300ms ease', style({ transform: 'translateX(-100%)', opacity: 0 }))]),
          query(':enter', [animate('300ms ease', style({ transform: 'translateX(0)', opacity: 1 }))]),
        ]),
      ]),
      transition(':decrement', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }),
        ]),
        query(':enter', [style({ transform: 'translateX(-100%)', opacity: 0 })]),
        group([
          query(':leave', [animate('300ms ease', style({ transform: 'translateX(100%)', opacity: 0 }))]),
          query(':enter', [animate('300ms ease', style({ transform: 'translateX(0)', opacity: 1 }))]),
        ]),
      ]),
    ]),
  ],
  imports:  [
    TransactionTableComponent,
    TransactionsFiltersComponent,
    TransactionModalComponent,
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './transaction-v2.component.html',
  styleUrl: './transaction-v2.component.scss'
})
export class TransactionV2Component implements OnInit {
  private readonly txProvider = inject(TransactionsProvider);
  private readonly catProvider = inject(CategoriesProvider);
  private viewport = inject(ViewportService);

  activeTab = signal<'sorties' | 'entrees' | 'recurrences'>('sorties');

  setActiveTab(tab: 'sorties' | 'entrees' | 'recurrences') {
    this.activeTab.set(tab);
  }

  transactions = this.txProvider.transactions;
  categories$ = this.catProvider.categories$;
  isMobile = this.viewport.isMobile;
  monthDirection: number | null = null;

  categoriesById$ = this.categories$.pipe(
    map((cats: Category[]) => {
      const dict: Record<number, Category> = {};
      for (const c of cats) dict[c.id] = c;
      return dict;
    }),
    startWith({} as Record<number, Category>)
  );

  // Années disponibles
  minYear = 2024;
  maxYear = new Date().getFullYear() + 4;
  years = Array.from({ length: this.maxYear - this.minYear + 1 }, (_, i) => this.minYear + i);

  // Sélections
  selectedYear = signal(new Date().getFullYear());
  selectedMonth = signal(new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
  selectedCategoryId = signal<number | null>(null);

  // Liste des mois pour l'année sélectionnée
  get months(): string[] {
    const year = this.selectedYear();
    return Array.from({ length: 12 }, (_, i) => `${year}-${(i + 1).toString().padStart(2, '0')}`);
  }

  showModal = signal(false);
  editingTransaction = signal<Transaction | null>(null);

  // Calculs
  private sumByType = (type: 'income' | 'expense') =>
    this.transactions()
      .filter((t: Transaction) => t.type === type)
      .reduce((acc: number, t: Transaction) => acc + (Number(t.amount) || 0), 0);

  revenus = computed(() => this.sumByType('income'));
  depenses = computed(() => this.sumByType('expense'));
  solde = computed(() => this.revenus() - this.depenses());

  ngOnInit(): void {
    this.catProvider.load();
    this.loadTransactions();
  }

  // 🔄 Recharge les transactions selon les filtres
  loadTransactions() {
    this.txProvider.load({
      month: this.selectedMonth(),
      categoryId: this.selectedCategoryId(),
    });
  }

  // 🗓️ Navigation entre les mois
  previousMonth() {
    this.monthDirection = -1;
    const [year, month] = this.selectedMonth().split('-').map(Number);
    const newDate = new Date(year, month - 2); // -1 pour index, -1 pour mois précédent
    const newMonth = `${newDate.getFullYear()}-${(newDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    this.selectedYear.set(newDate.getFullYear());
    this.selectedMonth.set(newMonth);
    this.loadTransactions();
  }

  nextMonth() {
    this.monthDirection = 1;
    const [year, month] = this.selectedMonth().split('-').map(Number);
    const newDate = new Date(year, month); // +1 mois
    const newMonth = `${newDate.getFullYear()}-${(newDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    this.selectedYear.set(newDate.getFullYear());
    this.selectedMonth.set(newMonth);
    this.loadTransactions();
  }

  // 📅 Sélecteur de mois (ouvre un menu ou une modale)
  openMonthSelector() {
    // Ici tu peux ouvrir un mat-menu ou une modale personnalisée
    console.log('Ouvrir le sélecteur de mois');
    // Exemple : this.showMonthMenu = true;
  }

  // 📆 Sélecteur d’année
  openYearSelector() {
    console.log('Ouvrir le sélecteur d’année');
    // Tu peux ouvrir un mat-menu ou un dialog Angular Material
  }

  // 🏷️ Sélecteur de catégorie
  openCategorySelector() {
    console.log('Ouvrir le sélecteur de catégorie');
    // Idem : menu ou modale
  }

  // 🔄 Changement d’année
  onYearChange(year: number) {
    this.selectedYear.set(year);
    const currentMonth = this.selectedMonth().slice(5, 7);
    const newMonth = `${year}-${currentMonth}`;
    this.selectedMonth.set(newMonth);
    this.loadTransactions();
  }

  // 🔄 Changement de mois
  onMonthChange(month: string) {
    this.selectedMonth.set(month);
    this.loadTransactions();
  }

  // 🔄 Changement de catégorie
  onCategoryChange(categoryId: number | null) {
    this.selectedCategoryId.set(categoryId);
    this.loadTransactions();
  }

  // ➕ Gestion modale
  openModal(transaction: Transaction | null = null) {
    this.editingTransaction.set(transaction);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingTransaction.set(null);
  }

  addOrEditTransaction(tx: Transaction) {
    if (tx.id) this.txProvider.update(tx);
    else this.txProvider.add(tx);
    this.closeModal();
    this.loadTransactions();
  }

  deleteTransaction(id: number) {
    this.txProvider.delete(id);
    this.loadTransactions();
  }

  handleEdit(event: any) {
    if (event._inline) this.addOrEditTransaction(event);
    else this.openModal(event);
  }
}
