import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type BudgetHistoryAction = 'create' | 'update' | 'delete' | 'replace_month';

export type BudgetHistoryItem = {
    id: string;
    userId: string;
    monthKey: string;
    lineId: string | null;
    action: BudgetHistoryAction;
    before: any;
    after: any;
    createdAt: string;
};

export type AuthHistoryItem = {
    id: string;
    userId: string | null;
    username: string | null;
    ip: string | null;
    userAgent: string | null;
    success: boolean;
    reason: string | null;
    createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class HistoryService {
     private apiUrl = environment.apiUrl;
    constructor(private http: HttpClient) { }

    getBudgetHistory(monthKey: string) {
        return this.http.get<BudgetHistoryItem[]>(`${this.apiUrl}/budget-history/${monthKey}`);
    }

    getAuthHistory() {
        return this.http.get<AuthHistoryItem[]>(`${this.apiUrl}/auth/history`);
    }
}