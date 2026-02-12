import { Observable } from 'rxjs';
import { effect } from '@angular/core';

export function signalToObservable<T>(signal: () => T): Observable<T> {
  return new Observable<T>(subscriber => {
    const stop = effect(() => {
      subscriber.next(signal());
    });
    return () => stop();
  });
}
