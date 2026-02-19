import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BudgetTemplate } from './template.models';

@Injectable({ providedIn: 'root' })
export class TemplateApi {
    private http = inject(HttpClient);
    private base = environment.apiUrl;

    getTemplate() {
        return this.http.get<BudgetTemplate>(`${this.base}/budget-template`);
    }

    updateTemplate(payload: BudgetTemplate) {
        return this.http.put<BudgetTemplate>(`${this.base}/budget-template`, payload);
    }
}
