export interface Transaction {
  id: number;
  category: string;
  icon: string;
  description: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: number;
  _inline?: boolean
}
