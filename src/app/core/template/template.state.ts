import { Injectable, computed, effect, signal } from '@angular/core';
import { BudgetTemplate } from './template.models';
import { BudgetLine } from '../budget/budget.models';

type Vm = {
    lines: BudgetLine[];
    updatedAt: string | null;
    loading: boolean;
    error: string | null;
};

@Injectable()
export class TemplateState {
    private vm = signal<Vm>({
        lines: [],
        updatedAt: null,
        loading: false,
        error: null,
    });

    lines = computed(() => this.vm().lines);
    loading = computed(() => this.vm().loading);
    error = computed(() => this.vm().error);
    constructor() {
        console.log('this.vm', this.vm());
        console.log('this.lines', this.lines());
        console.log('this.linesFilter', this.lines().filter(l => l.type === 'income'));
        effect(() => {
            const v = this.vm();
            console.log('vm.lines ->', v.lines, 'isArray?', Array.isArray(v.lines), 'type:', typeof v.lines);
        });

    }

    incomes = computed(() => (this.lines() ?? []).filter(l => l.type === 'income'));
    expenses = computed(() => (this.lines() ?? []).filter(l => l.type === 'expense'));

    setLoading(v: boolean) { this.vm.update(s => ({ ...s, loading: v })); }
    setError(e: string | null) { this.vm.update(s => ({ ...s, error: e })); }

    setTemplate(t: BudgetTemplate) {
        this.vm.update(s => ({
            ...s,
            lines: t.lines ?? [],
            updatedAt: t.updatedAt ?? null,
            error: null
        }));
    }

    setLines(lines: BudgetLine[]) {
        this.vm.update(s => ({ ...s, lines }));
    }

    removeLine(id: string) {
        this.vm.update(s => ({ ...s, lines: s.lines.filter(x => x.id !== id) }));
    }
}
