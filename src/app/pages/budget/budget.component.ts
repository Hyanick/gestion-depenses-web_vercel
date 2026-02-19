import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BudgetProvider } from '../../core/budget/budget.provider';
import { MatDialog } from '@angular/material/dialog';
import { AddLineDialogComponent, AddLineDialogResult } from './add-line-dialog.component';


@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
})
export class BudgetComponent {
  constructor(public vm: BudgetProvider, private dialog: MatDialog) {
    effect(() => {
      const key = this.monthKey();
      // flush du précédent mois si dirty (si existait)
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

  private commitEditingIfAny() {
    const id = this.editingId();
    if (!id) return;
    const line = this.vm.lines().find((x: any) => x.id === id);
    if (!line) return;
    this.editingId.set(null);
    // le patch local est déjà fait, on force juste un flush
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

  // blur/enter => flush du mois (batch)
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
  openAddDialog(presetType?: 'income' | 'expense') {
    const isDesktop = window.matchMedia('(min-width: 992px)').matches;

    const ref = this.dialog.open(AddLineDialogComponent, {
      data: { presetType },
      autoFocus: true,
      disableClose: false,
      // Mobile: bottom sheet full screen, Desktop: right drawer
      panelClass: isDesktop ? ['ios-drawer-right'] : ['ios-sheet-full'],
      width: isDesktop ? '420px' : '100vw',
      height: isDesktop ? '100vh' : '100vh',
      maxWidth: isDesktop ? '420px' : '100vw',
      position: isDesktop ? { right: '0', top: '0' } : { bottom: '0', left: '0' },
    });

    ref.afterClosed().subscribe((res?: AddLineDialogResult) => {
      if (!res) return;

      const line = {
        id: crypto.randomUUID(),
        type: res.type,
        category: res.category,
        label: res.label,
        amount: res.amount,
        icon: res.icon,
        color: res.color,
      };

      this.vm.addLineLocal(line);
      // autosave debounce + flush on leave already handle persistence
    });
  }

}
