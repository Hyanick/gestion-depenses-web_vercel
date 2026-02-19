export type MockCategory = {
  key: string;
  label: string;
  icon: string;   // MatIcon name
  color: string;  // hex
  type: 'income' | 'expense';
};

export const MOCK_CATEGORIES: MockCategory[] = [
  // EXPENSES
  { key: 'housing', label: 'Logement', icon: 'home', color: '#f59e0b', type: 'expense' },
  { key: 'food', label: 'Alimentation', icon: 'restaurant', color: '#22c55e', type: 'expense' },
  { key: 'transport', label: 'Transport', icon: 'directions_car', color: '#3b82f6', type: 'expense' },
  { key: 'health', label: 'Santé', icon: 'medical_services', color: '#ef4444', type: 'expense' },
  { key: 'kids', label: 'Enfants', icon: 'child_care', color: '#a855f7', type: 'expense' },
  { key: 'school', label: 'Éducation', icon: 'school', color: '#eab308', type: 'expense' },
  { key: 'subscriptions', label: 'Abonnements', icon: 'subscriptions', color: '#64748b', type: 'expense' },
  { key: 'shopping', label: 'Shopping', icon: 'shopping_bag', color: '#ec4899', type: 'expense' },
  { key: 'leisure', label: 'Loisirs', icon: 'sports_esports', color: '#06b6d4', type: 'expense' },
  { key: 'bills', label: 'Factures', icon: 'receipt_long', color: '#fb7185', type: 'expense' },

  // INCOMES
  { key: 'salary', label: 'Salaire', icon: 'work', color: '#3aa0d8', type: 'income' },
  { key: 'caf', label: 'CAF', icon: 'family_restroom', color: '#22c55e', type: 'income' },
  { key: 'bonus', label: 'Prime', icon: 'military_tech', color: '#f59e0b', type: 'income' },
  { key: 'other_income', label: 'Autre', icon: 'payments', color: '#64748b', type: 'income' },
];