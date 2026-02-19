import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TemplateApi } from './template.api';
import { TemplateState } from './template.state';
import { BudgetLine } from '../budget/budget.models';

@Injectable()
export class TemplateProvider {
    private api = inject(TemplateApi);
    private state = inject(TemplateState);

    lines = this.state.lines;
    incomes = this.state.incomes;
    expenses = this.state.expenses;
    loading = this.state.loading;
    error = this.state.error;

    async load() {
        this.state.setLoading(true);
        this.state.setError(null);
        try {
            const data = await firstValueFrom(this.api.getTemplate());
            this.state.setTemplate(data);
        } catch {
            this.state.setError('Impossible de charger le modèle.');
        } finally {
            this.state.setLoading(false);
        }
    }

    // On pousse tout le template (simple & stable)
    async save(lines: BudgetLine[]) {
        const saved = await firstValueFrom(this.api.updateTemplate({ lines, updatedAt: new Date().toISOString() }));
        this.state.setTemplate(saved);
    }
}
