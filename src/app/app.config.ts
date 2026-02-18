import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxsReduxDevtoolsPluginModule, withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule, withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { provideStore } from '@ngxs/store';
import { withNgxsWebSocketPlugin } from '@ngxs/websocket-plugin';
import { routes } from './app.routes';
import { CategoriesState } from './features/categories/data-access/categories.state';
import { TransactionsState } from './features/transactions/data-access/transactions.state';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  { provide: LOCALE_ID, useValue: 'fr-FR' },
  provideRouter(routes),
  provideHttpClient(),
    provideAnimations(),
  provideStore(
    [TransactionsState, CategoriesState],
    withNgxsReduxDevtoolsPlugin(),
    withNgxsFormPlugin(),
    withNgxsLoggerPlugin(),
    withNgxsRouterPlugin(),
    //withNgxsStoragePlugin(),
    withNgxsWebSocketPlugin()
  ),
  importProvidersFrom(
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot({
      name: 'Gestion Dépenses Store',
      maxAge: 25,
      disabled: false,
    }),

    NgxsStoragePluginModule.forRoot({
      keys: '*',
      storage: 1, // ✅ utilisation correcte de l'enum,
    })
  ), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ]
};
