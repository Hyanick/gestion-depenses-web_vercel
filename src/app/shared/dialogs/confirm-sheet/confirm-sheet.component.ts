import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type ConfirmSheetData = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'default' | 'danger';
  icon?: string; // material icon name
};

export type ConfirmSheetResult = { confirmed: boolean };

@Component({
  selector: 'app-confirm-sheet',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './confirm-sheet.component.html',
  styleUrls: ['./confirm-sheet.component.scss'],
})
export class ConfirmSheetComponent {
  constructor(
    private ref: MatDialogRef<ConfirmSheetComponent, ConfirmSheetResult>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmSheetData
  ) { }

  cancel() {
    this.ref.close({ confirmed: false });
  }

  confirm() {
    this.ref.close({ confirmed: true });
  }

  get tone(): 'default' | 'danger' {
    return this.data?.tone ?? 'default';
  }
}
