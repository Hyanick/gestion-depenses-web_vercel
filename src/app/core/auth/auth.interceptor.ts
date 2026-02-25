import {
    HttpErrorResponse,
    HttpEvent,
    HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, Observable, switchMap, throwError } from 'rxjs';

import { AuthService } from './auth.service';

let refreshing = false;
let pending: Array<(ok: boolean) => void> = [];

function waitForRefresh(): Promise<boolean> {
    return new Promise<boolean>((resolve) => pending.push(resolve));
}

function notifyPending(ok: boolean) {
    for (const resolve of pending) resolve(ok);
    pending = [];
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);

    const isAuthCall =
        req.url.includes('/api/auth/login') ||
        req.url.includes('/api/auth/register') ||
        req.url.includes('/api/auth/refresh');

    const token = auth.accessToken();

    const authReq = req.clone({
        withCredentials: true,
        setHeaders: token && !isAuthCall ? { Authorization: `Bearer ${token}` } : {},
    });

    return next(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
            if (isAuthCall) return throwError(() => err);
            if (err.status !== 401) return throwError(() => err);

            if (!auth.accessToken()) {
                auth.clearSession();
                return throwError(() => err);
            }

            // ✅ refresh déjà en cours => on attend (OBSERVABLE TYPÉ)
            if (refreshing) {
                return new Observable<HttpEvent<unknown>>((subscriber) => {
                    waitForRefresh().then((ok) => {
                        if (!ok) {
                            subscriber.error(err);
                            return;
                        }

                        const newToken = auth.accessToken();
                        const retry = req.clone({
                            withCredentials: true,
                            setHeaders: newToken ? { Authorization: `Bearer ${newToken}` } : {},
                        });

                        next(retry).subscribe(subscriber);
                    });
                });
            }

            refreshing = true;

            return auth.refresh().pipe(
                switchMap(() => {
                    notifyPending(true);

                    const newToken = auth.accessToken();
                    const retry = req.clone({
                        withCredentials: true,
                        setHeaders: newToken ? { Authorization: `Bearer ${newToken}` } : {},
                    });

                    return next(retry);
                }),
                catchError((e) => {
                    notifyPending(false);
                    auth.clearSession();
                    return throwError(() => e);
                }),
                finalize(() => {
                    refreshing = false;
                }),
            );
        }),
    );
};