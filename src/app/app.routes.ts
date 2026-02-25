import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';
import { AuthGuard } from './core/auth/auth.guard';
import { GuestGuard } from './core/auth/guest.guard';


export const routes: Routes = [
    // ✅ Pages publiques (hors shell)
    {
        path: 'login',
        canActivate: [GuestGuard],
        loadComponent: () =>
            import('./pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'register',
        canActivate: [GuestGuard],
        loadComponent: () =>
            import('./pages/register/register.component').then(m => m.RegisterComponent),
    },

    // ✅ App protégée (avec layout Shell)
    {
        path: '',
        component: ShellComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },

            // home = budget (comme actuellement)
            {
                path: 'home',
                loadComponent: () =>
                    import('./pages/budget/budget.component').then(m => m.BudgetComponent),
            },
            {
                path: 'analysis',
                loadComponent: () =>
                    import('./pages/analysis/analysis.component').then(m => m.AnalysisComponent),
            },
            {
                path: 'transactions',
                loadComponent: () =>
                    import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent),
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import('./pages/settings/settings.component').then(m => m.SettingsComponent),
            },
            {
                path: 'template',
                loadComponent: () =>
                    import('./pages/template/template.component').then(m => m.TemplateComponent),
            },
        ],
    },

    // fallback
    { path: '**', redirectTo: '' },
];