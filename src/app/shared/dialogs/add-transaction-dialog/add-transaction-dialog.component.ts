import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type TxType = 'expense' | 'income';

export type TransactionDraft = {
  id?: string;
  type: TxType;
  title: string;
  category: string;
  date: string; // yyyy-mm-dd
  amount: number;
  note?: string;
};

export type TxDialogData = {
  mode: 'add' | 'edit';
  defaultType?: TxType;
  transaction?: TransactionDraft; // pour edit
};

export type TxDialogResult =
  | { action: 'cancel' }
  | { action: 'create'; payload: TransactionDraft }
  | { action: 'update'; payload: TransactionDraft };

@Component({
  selector: 'app-add-transaction-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './add-transaction-dialog.component.html',
  styleUrls: ['./add-transaction-dialog.component.scss'],
})
export class AddTransactionDialogComponent {
  private fb = inject(FormBuilder);
  categoriesExpense = ['Logement', 'Alimentation', 'Transport', 'Loisirs', 'Santé', 'Autres'];
  categoriesIncome = ['Salaire', 'CAF', 'Freelance', 'Autres'];

  form = this.fb.group({
    id: [''],
    type: ['expense' as TxType, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    title: ['', [Validators.required, Validators.maxLength(40)]],
    category: ['', Validators.required],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    note: ['', Validators.maxLength(120)],
  });

  constructor(
    
    private dialogRef: MatDialogRef<AddTransactionDialogComponent, TxDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: TxDialogData
  ) {
    const mode = data?.mode ?? 'add';

    if (mode === 'edit' && data.transaction) {
      const tx = data.transaction;
      this.form.patchValue({
        id: tx.id ?? '',
        type: tx.type,
        amount: tx.amount,
        title: tx.title,
        category: tx.category,
        date: tx.date,
        note: tx.note ?? '',
      });
    } else {
      const t = data?.defaultType ?? 'expense';
      this.form.patchValue({
        type: t,
        category: t === 'expense' ? this.categoriesExpense[0] : this.categoriesIncome[0],
      });
    }

    // si on change type -> reset category sur la 1ère du type
    this.form.controls.type.valueChanges.subscribe((t) => {
      const type = (t ?? 'expense') as TxType;
      const next = type === 'expense' ? this.categoriesExpense[0] : this.categoriesIncome[0];
      this.form.controls.category.setValue(next);
    });
  }

  get isEdit() {
    return this.data?.mode === 'edit';
  }

  get categories() {
    const t = this.form.controls.type.value ?? 'expense';
    return t === 'expense' ? this.categoriesExpense : this.categoriesIncome;
  }

  close() {
    this.dialogRef.close({ action: 'cancel' });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const payload: TransactionDraft = {
      id: v.id || undefined,
      type: v.type!,
      title: v.title!.trim(),
      category: v.category!,
      date: v.date!,
      amount: Number(v.amount),
      note: v.note?.trim() || undefined,
    };

    this.dialogRef.close(
      this.isEdit
        ? { action: 'update', payload }
        : { action: 'create', payload }
    );
  }
}
