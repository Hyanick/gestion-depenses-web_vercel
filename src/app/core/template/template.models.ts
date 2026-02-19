import { BudgetLine } from '../budget/budget.models';

export type BudgetTemplate = {
  lines: BudgetLine[];
  updatedAt: string;
};
