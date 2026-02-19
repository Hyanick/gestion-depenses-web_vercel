import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MonthBudget, BudgetLine } from './budget.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BudgetApi {
    private http = inject(HttpClient);
    private base = environment.apiUrl;

    getMonth(monthKey: string) {
        return this.http.get<MonthBudget>(`${this.base}/budgets/${monthKey}`);
    }

    seedFromTemplate(monthKey: string) {
        return this.http.post<MonthBudget>(`${this.base}/budgets/${monthKey}/seed-from-template`, {});
    }

    duplicate(fromMonthKey: string, toMonthKey: string) {
        return this.http.post<MonthBudget>(
            `${this.base}/budgets/${toMonthKey}/duplicate-from/${fromMonthKey}`,
            {}
        );
    }

    // Overwrite total depuis template (pratique pour "Régénérer")
    resetFromTemplate(monthKey: string) {
        return this.http.post<MonthBudget>(`${this.base}/budgets/${monthKey}/reset-from-template`, {});
    }

    addLine(monthKey: string, line: Omit<BudgetLine, 'id'>) {
        return this.http.post<BudgetLine>(`${this.base}/budgets/${monthKey}/lines`, line);
    }

    updateLine(monthKey: string, id: string, patch: Partial<BudgetLine>) {
        return this.http.put<BudgetLine>(`${this.base}/budgets/${monthKey}/lines/${id}`, patch);
    }

    deleteLine(monthKey: string, id: string) {
        return this.http.delete<void>(`${this.base}/budgets/${monthKey}/lines/${id}`);
    }
}
