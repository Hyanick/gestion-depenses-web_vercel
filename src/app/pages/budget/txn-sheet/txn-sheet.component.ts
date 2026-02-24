import { Component, Inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

export interface TxnSheetData {
  mode: 'create' | 'edit';
  txn?: any;
  presetType?: 'income' | 'expense';
}

@Component({
  standalone: true,
  selector: 'app-txn-sheet',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './txn-sheet.component.html',
  styleUrls: ['./txn-sheet.component.scss'],
})
export class TxnSheetComponent {
  type = signal<'income' | 'expense'>(this.data.presetType ?? 'expense');
  category = signal('');
  label = signal('');
  amount = signal<number>(0);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TxnSheetData,
    private dialogRef: MatDialogRef<TxnSheetComponent>,
  ) {
    if (data.mode === 'edit' && data.txn) {
      this.type.set(data.txn.type);
      this.category.set(data.txn.category);
      this.label.set(data.txn.label);
      this.amount.set(data.txn.amount);
    }
  }

  mode = this.data.mode;

  canSubmit = computed(() =>
    this.label().trim().length > 0 && this.amount() > 0
  );

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.dialogRef.close({
      type: this.type(),
      category: this.category(),
      label: this.label(),
      amount: this.amount(),
    });
  }

  deleteTxn() {
    this.dialogRef.close({ delete: true });
  }
}