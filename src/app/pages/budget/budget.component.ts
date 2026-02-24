import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { BudgetProvider } from '../../core/budget/budget.provider';
import { TxnSheetComponent, TxnSheetResult } from './add-line-dialog.component';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
})
export class BudgetComponent {
  constructor(public vm: BudgetProvider, private dialog: MatDialog) {
    effect(() => {
      const key = this.monthKey();
      const prev = this.lastMonthKey();
      if (prev && prev !== key) this.vm.flush(prev);

      this.vm.setCurrentMonth(key);
      this.vm.load(key);

      this.editingId.set(null);
      this.lastMonthKey.set(key);
    });
  }

  private currentDate = signal(new Date());
  private lastMonthKey = signal<string | null>(null);
  editingId = signal<string | null>(null);

  monthKey = computed(() => {
    const d = this.currentDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  monthLabel = computed(() => {
    const d = this.currentDate();
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  });

  // =========================
  // Existing methods (UNCHANGED)
  // =========================

  private commitEditingIfAny() {
    const id = this.editingId();
    if (!id) return;
    const line = this.vm.lines().find((x: any) => x.id === id);
    if (!line) return;
    this.editingId.set(null);
    this.vm.flush(this.monthKey());
  }

  prevMonth() {
    this.commitEditingIfAny();
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth() {
    this.commitEditingIfAny();
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  startEdit(id: string) {
    this.editingId.set(id);
  }

  onAmountChange(id: string, value: any) {
    this.vm.patchLineLocal(id, { amount: Number(value) || 0 });
  }

  flushNow() {
    this.editingId.set(null);
    this.vm.flush(this.monthKey());
  }

  duplicateFromPrevious() {
    this.vm.flush(this.monthKey());
    const d = this.currentDate();
    const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    this.vm.duplicate(prevKey, this.monthKey());
  }

  regenerateFromTemplate() {
    const ok = confirm('Régénérer depuis le modèle ? (cela remplace ce mois)');
    if (!ok) return;
    this.vm.reset(this.monthKey());
  }

  openCreateTxn(presetType?: 'income' | 'expense') {
    const isDesktop = window.matchMedia('(min-width: 992px)').matches;

    const ref = this.dialog.open(TxnSheetComponent, {
      data: { mode: 'create', presetType },
      panelClass: isDesktop ? ['ios-drawer-right'] : ['ios-sheet-compact'],
      width: isDesktop ? '420px' : '92vw',
      height: isDesktop ? '100vh' : undefined,
      maxWidth: isDesktop ? '420px' : '520px',
      position: isDesktop ? { right: '0', top: '0' } : { bottom: '12px' },
    });

    ref.afterClosed().subscribe((res?: TxnSheetResult) => {
      if (!res || res.action === 'cancel') return;
      if (res.action === 'create') {
        this.vm.addLineLocal({ id: crypto.randomUUID(), ...res.payload });
      }
    });
  }

  openEditTxn(line: any) {
    const isDesktop = window.matchMedia('(min-width: 992px)').matches;

    const ref = this.dialog.open(TxnSheetComponent, {
      data: { mode: 'edit', initial: line },
      panelClass: isDesktop ? ['ios-drawer-right'] : ['ios-sheet-compact'],
      width: isDesktop ? '420px' : '92vw',
      height: isDesktop ? '100vh' : undefined,
      maxWidth: isDesktop ? '420px' : '520px',
      position: isDesktop ? { right: '0', top: '0' } : { bottom: '12px' },
    });

    ref.afterClosed().subscribe((res?: TxnSheetResult) => {
      if (!res || res.action === 'cancel') return;

      if (res.action === 'update') {
        this.vm.patchLineLocal(res.id, res.patch);
      }

      if (res.action === 'delete') {
        this.vm.deleteLineLocal(res.id);
      }
    });
  }

  // =========================
  // New helpers (ADDED)
  // =========================

  private moneyFmt = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  /** Affichage: "25 000,55" (espaces fines selon navigateur) */
  formatMoney(value: number | null | undefined): string {
    return this.moneyFmt.format(Number(value ?? 0));
  }

  /** Edition: "25000.55" (brut, point décimal) */
  private toEditString(value: number | null | undefined): string {
    const n = Number(value ?? 0);
    // garde 2 décimales, point comme séparateur
    return n.toFixed(2);
  }

  /** Parse robuste (accepte 25 000,55 / 25000.55 / 25,000.55 etc.) */
  private parseMoney(input: string): number {
    if (!input) return 0;

    let s = input.trim().replace(/[^\d,.\-]/g, '');

    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    const decSep = Math.max(lastComma, lastDot);

    if (decSep >= 0) {
      const intPart = s.slice(0, decSep).replace(/[.,]/g, '');
      const decPart = s.slice(decSep + 1).replace(/[.,]/g, '');
      s = `${intPart}.${decPart}`;
    } else {
      s = s.replace(/[.,]/g, '');
    }

    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  /**
   * Focus: affiche brut (25000.55) + select all
   * On ne change pas le modèle ici, juste l'UI.
   */
  onAmountFocus(input: HTMLInputElement, id: string, currentAmount: number) {
    this.startEdit(id);
    input.value = this.toEditString(currentAmount);
    queueMicrotask(() => input.select());
  }

  /**
   * Input: patch live (totaux réactifs)
   */
  onAmountTyped(id: string, raw: string) {
    const n = this.parseMoney(raw);
    this.vm.patchLineLocal(id, { amount: n });
  }

  /**
   * Blur: reformate (25 000,55) + flush
   */
  onAmountBlur(input: HTMLInputElement, id: string) {
    const n = this.parseMoney(input.value);
    this.vm.patchLineLocal(id, { amount: n });

    input.value = this.formatMoney(n);
    this.flushNow();
  }

  /**
   * Enter: même effet que blur (format + flush)
   */
  onAmountEnter(input: HTMLInputElement, id: string) {
    input.blur(); // déclenche blur => format + flush
  }
}