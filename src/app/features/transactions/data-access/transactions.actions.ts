import { Transaction } from './transactions.models';

export class LoadTransactions {
  static readonly type = '[Transactions] Load';
  constructor(public filters?: { month?: string; categoryId?: number | null }) {}
}

export class AddTransaction {
  static readonly type = '[Transactions] Add';
  constructor(public payload: Transaction) { }
}

export class UpdateTransaction {
  static readonly type = '[Transactions] Update';
  constructor(public payload: Transaction) { }
}

export class DeleteTransaction {
  static readonly type = '[Transactions] Delete';
  constructor(public id: number) { }
}
