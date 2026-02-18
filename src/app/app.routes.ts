import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';


export const routes: Routes = [
    {
        path: '',
        component: ShellComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },

            /*{
                path: 'home',
                loadComponent: () =>
                    import('./pages/home/home.component').then(m => m.HomeComponent)
            },*/
            {
                path: 'home',
                loadComponent: () =>
                    import('./pages/budget/budget.component').then(m => m.BudgetComponent)
            },
            {
                path: 'analysis',
                loadComponent: () =>
                    import('./pages/analysis/analysis.component').then(m => m.AnalysisComponent)
            },
            {
                path: 'transactions',
                loadComponent: () =>
                    import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent)
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import('./pages/settings/settings.component').then(m => m.SettingsComponent)
            }
        ]
    }
];
