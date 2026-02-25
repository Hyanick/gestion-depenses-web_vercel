import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type AuthUser = { id: string; name: string; username: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
    private ACCESS_KEY = 'gdm_access_token';
    private LAST_LOGIN_KEY = 'gdm_last_login_at';

    user = signal<AuthUser | null>(null);
    accessToken = signal<string | null>(localStorage.getItem(this.ACCESS_KEY));
    lastLoginAt = signal<string | null>(localStorage.getItem(this.LAST_LOGIN_KEY)); // ISO string
    private  apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    isLoggedIn() {
        return !!this.accessToken();
    }

    private setLastLoginNow() {
        const iso = new Date().toISOString();
        this.lastLoginAt.set(iso);
        localStorage.setItem(this.LAST_LOGIN_KEY, iso);
    }

    setSession(user: AuthUser, accessToken: string) {
        this.user.set(user);
        this.accessToken.set(accessToken);
        localStorage.setItem(this.ACCESS_KEY, accessToken);
        this.setLastLoginNow();
    }

    clearSession() {
        this.user.set(null);
        this.accessToken.set(null);
        localStorage.removeItem(this.ACCESS_KEY);

        // Option: tu peux choisir de garder l’historique de last login même après logout.
        // Là je le garde, car c’est "dernière connexion" (pas "session en cours").
        // Si tu veux le vider au logout, décommente :
        // this.lastLoginAt.set(null);
        // localStorage.removeItem(this.LAST_LOGIN_KEY);
    }

    register(payload: { name: string; username: string; password: string; email?: string; phone?: string }) {
        return this.http
            .post<{ user: AuthUser; accessToken: string }>(`${this.apiUrl}/auth/register`, payload, { withCredentials: true })
            .pipe(tap((res) => this.setSession(res.user, res.accessToken)));
    }

    login(payload: { username: string; password: string }) {
        return this.http
            .post<{ user: AuthUser; accessToken: string }>(`${this.apiUrl}/auth/login`, payload, { withCredentials: true })
            .pipe(tap((res) => this.setSession(res.user, res.accessToken)));
    }

    refresh(): Observable<{ user: AuthUser; accessToken: string }> {
        return this.http
            .post<{ user: AuthUser; accessToken: string }>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
            .pipe(tap((res) => this.setSession(res.user, res.accessToken)));
    }

    me() {
        return this.http.get<AuthUser>(`${this.apiUrl}/auth/me`, { withCredentials: true }).pipe(
            tap((u) => {
                // si ton backend retourne seulement user, on garde le token actuel.
                const token = this.accessToken();
                if (token) this.setSession(u, token);
            })
        );
    }

    logout() {
        // on clear quoiqu'il arrive côté front
        // MAIS: il faut SUBSCRIBE côté UI (ou ici on subscribe, mais je te laisse la main)
        return this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
            tap(() => this.clearSession()),
            catchError(() => {
                // même si le backend répond mal, on clear quand même
                this.clearSession();
                return of(null);
            })
        );
    }
}