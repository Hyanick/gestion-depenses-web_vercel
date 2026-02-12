import { Injectable, computed, signal } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Transaction } from './transactions.models';
import { LoadTransactions, AddTransaction, UpdateTransaction, DeleteTransaction } from './transactions.actions';
import { TransactionsState } from './transactions.state';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class TransactionsProvider {
  // Signaux pour l’UI
  transactions: any;
  loading: any;

  constructor(private store: Store) {
    this.transactions = toSignal(this.store.select(state => state.transactions.transactions), { initialValue: [] });
    this.loading = toSignal(this.store.select(state => state.transactions.loading), { initialValue: false });
  }

  load(filter?:{ month?: string; categoryId?: number | null }) {
    this.store.dispatch(new LoadTransactions(filter));
  }

  add(transaction: Transaction) {
    this.store.dispatch(new AddTransaction(transaction));
  }

  update(transaction: Transaction) {
    this.store.dispatch(new UpdateTransaction(transaction));
  }

  delete(id: number) {
    this.store.dispatch(new DeleteTransaction(id));
  }
}
