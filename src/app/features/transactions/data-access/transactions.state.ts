import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Transaction } from './transactions.models';
import { TransactionsService } from './transactions.service';
import { LoadTransactions, AddTransaction, UpdateTransaction, DeleteTransaction } from './transactions.actions';
import { tap } from 'rxjs/operators';

export interface TransactionsStateModel {
  transactions: Transaction[];
  loading: boolean;
}

@State<TransactionsStateModel>({
  name: 'transactions',
  defaults: {
    transactions: [],
    loading: false
  }
})
@Injectable()
export class TransactionsState {
  constructor(private service: TransactionsService) { }

  @Selector()
  static transactions(state: TransactionsStateModel) {
    return state.transactions;
  }

  @Selector()
  static loading(state: TransactionsStateModel) {
    return state.loading;
  }

  @Action(LoadTransactions)
  load({ patchState }: StateContext<TransactionsStateModel>, {filters}: LoadTransactions) {
    patchState({ loading: true });
    return this.service.getAll(filters).pipe(
      tap(transactions => patchState({ transactions, loading: false }))
    );
  }

  @Action(AddTransaction)
  add({ getState, patchState }: StateContext<TransactionsStateModel>, { payload }: AddTransaction) {
    return this.service.add(payload).pipe(
      tap(newTransaction => {
        patchState({
          transactions: [...getState().transactions, newTransaction]
        });
         console.log('State add called');
      })
    );
  }

  @Action(UpdateTransaction)
  update({ getState, patchState }: StateContext<TransactionsStateModel>, { payload }: UpdateTransaction) {
    console.log('State UPDATED called');
    return this.service.update(payload).pipe(
      tap(updated => {
        patchState({
          transactions: getState().transactions.map(t => t.id === updated.id ? updated : t)
        });
      })
    );
  }

  @Action(DeleteTransaction)
  delete({ getState, patchState }: StateContext<TransactionsStateModel>, { id }: DeleteTransaction) {
    return this.service.delete(id).pipe(
      tap(() => {
        patchState({
          transactions: getState().transactions.filter(t => t.id !== id)
        });
      })
    );
  }
}
