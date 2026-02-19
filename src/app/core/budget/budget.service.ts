import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MonthBudget } from './budget.models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;;

  getMonth(monthKey: string): Observable<MonthBudget> {
    return this.http.get<MonthBudget>(`${this.apiUrl}/budgets/${monthKey}`);
  }

  seedFromTemplate(monthKey: string): Observable<MonthBudget> {
    return this.http.post<MonthBudget>(`${this.apiUrl}/budgets/${monthKey}/seed-from-template`, {});
  }

  duplicate(fromKey: string, toKey: string): Observable<MonthBudget> {
    return this.http.post<MonthBudget>(`${this.apiUrl}/budgets/${toKey}/duplicate-from/${fromKey}`, {});
  }

  resetFromTemplate(monthKey: string): Observable<MonthBudget> {
    return this.http.post<MonthBudget>(`${this.apiUrl}/budgets/${monthKey}/reset-from-template`, {});
  }

  // ✅ batch flush
  replaceMonth(monthKey: string, payload: { lines: any[]; createdFrom?: any }): Observable<MonthBudget> {
    return this.http.put<MonthBudget>(`${this.apiUrl}/budgets/${monthKey}`, payload);
  }
}
