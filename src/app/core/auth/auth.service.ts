import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { GlobalReinit } from '../budget/budget.actions';

export type AuthUser = {
    id: string;
    name: string;
    username: string;
    email?: string | null;
    phone?: string | null;
};

export type AuthResponse = { token: string; user: AuthUser };

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly router = inject(Router);
    private readonly store = inject(Store);
    private apiUrl = environment.apiUrl;
    private tokenSig = signal<string | null>(localStorage.getItem('token'));
    private userSig = signal<AuthUser | null>(this.readUser());

    token = computed(() => this.tokenSig());
    user = computed(() => this.userSig());
    isLoggedIn = computed(() => !!this.tokenSig());

    constructor(private http: HttpClient) { }

    register(payload: { name: string; username: string; password: string; email?: string; phone?: string }) {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, payload).pipe(
            tap((res) => this.setSession(res))
        );
    }

    login(payload: { username: string; password: string }) {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
            tap((res) => this.setSession(res))
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.tokenSig.set(null);
        this.userSig.set(null);
        this.store.dispatch(new GlobalReinit())
        this.router.navigateByUrl('/login')

    }

    private setSession(res: AuthResponse) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.tokenSig.set(res.token);
        this.userSig.set(res.user);
    }

    private readUser(): AuthUser | null {
        try {
            const raw = localStorage.getItem('user');
            return raw ? (JSON.parse(raw) as AuthUser) : null;
        } catch {
            return null;
        }
    }
}