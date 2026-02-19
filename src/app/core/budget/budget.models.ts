export type BudgetLine = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  label: string;
  amount: number;
  icon: string;
  color: string;
};

export type MonthBudget = {
  monthKey: string;
  createdFrom: 'template' | 'duplicate' | 'manual';
  lines: BudgetLine[];
  updatedAt: string;
};
