import { Injectable, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { AddLineLocal, DuplicateFromPrevious, FlushMonth, LoadMonthBudget, PatchLineLocal, ResetFromTemplate, SetCurrentMonth } from './budget.actions';
import { BudgetState } from './budget.state';
import { BudgetLine } from './budget.models';

@Injectable({ providedIn: 'root' })
export class BudgetProvider {

    private readonly store = inject(Store);
    lines = toSignal(this.store.select(BudgetState.lines), { initialValue: [] });
    loading = toSignal(this.store.select(BudgetState.loading), { initialValue: false });
    error = toSignal(this.store.select(BudgetState.error), { initialValue: null });
    createdFrom = toSignal(this.store.select(BudgetState.createdFrom), { initialValue: 'template' });
    dirty = toSignal(this.store.select(BudgetState.dirty), { initialValue: false });
    currentMonthKey = toSignal(this.store.select(BudgetState.currentMonthKey), { initialValue: null });

    incomes = computed(() => this.lines().filter((x: any) => x.type === 'income'));
    expenses = computed(() => this.lines().filter((x: any) => x.type === 'expense'));
    totalIncome = computed(() => this.incomes().reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0));
    totalExpense = computed(() => this.expenses().reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0));
    balance = computed(() => this.totalIncome() - this.totalExpense());
    saving = toSignal(this.store.select(BudgetState.saving), { initialValue: false });


    private flushTimer: any = null;

    constructor() {
        // ✅ autosave debounce quand dirty
        effect(() => {
            const key = this.currentMonthKey();
            const isDirty = this.dirty();
            if (!key) return;

            if (this.flushTimer) clearTimeout(this.flushTimer);
            if (!isDirty) return;

            this.flushTimer = setTimeout(() => {
                this.store.dispatch(new FlushMonth(key));
            }, 800);
        });

        // ✅ flush best-effort quand on quitte l'onglet/app
        const flushOnLeave = () => {
            const key = this.currentMonthKey();
            if (!key) return;
            if (!this.dirty()) return;
            this.store.dispatch(new FlushMonth(key));
        };

        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') flushOnLeave();
        });
        window.addEventListener('pagehide', flushOnLeave);
        window.addEventListener('beforeunload', flushOnLeave);
    }

    setCurrentMonth(monthKey: string) {
        this.store.dispatch(new SetCurrentMonth(monthKey));
    }

    load(monthKey: string) {
        this.store.dispatch(new LoadMonthBudget(monthKey));
    }

    patchLineLocal(id: string, patch: any) {
        this.store.dispatch(new PatchLineLocal(id, patch));
    }

    flush(monthKey: string) {
        this.store.dispatch(new FlushMonth(monthKey));
    }

    duplicate(fromKey: string, toKey: string) {
        this.store.dispatch(new DuplicateFromPrevious(fromKey, toKey));
    }

    reset(monthKey: string) {
        this.store.dispatch(new ResetFromTemplate(monthKey));
    }


    addLineLocal(line: BudgetLine) {
        this.store.dispatch(new AddLineLocal(line));
    }

}
