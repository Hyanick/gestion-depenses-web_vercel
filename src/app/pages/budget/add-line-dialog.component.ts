import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';

import { MOCK_CATEGORIES, MockCategory } from '../../shared/mock-categories';

type DialogData = { presetType?: 'income' | 'expense' };

export type AddLineDialogResult = {
  type: 'income' | 'expense';
  category: string;
  label: string;
  amount: number;
  icon: string;
  color: string;
};

@Component({
  selector: 'app-add-line-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatSelectModule,
  ],
  template: `
  <div class="dlg">
    <div class="dlg-head">
      <div class="title">Ajouter</div>
      <button mat-icon-button (click)="close()"><mat-icon>close</mat-icon></button>
    </div>

    <mat-button-toggle-group
      class="seg"
      [(ngModel)]="typeValue"
      [disabled]="!!data?.presetType"
      (ngModelChange)="onTypeChange()">
      <mat-button-toggle value="expense">Dépense</mat-button-toggle>
      <mat-button-toggle value="income">Revenu</mat-button-toggle>
    </mat-button-toggle-group>

    <div class="form">
      <!-- Catégorie avec icône -->
      <mat-form-field appearance="outline" class="w">
        <mat-label>Catégorie</mat-label>
        <mat-select [(ngModel)]="categoryKey" (selectionChange)="onCategoryChange()">
          @for (c of filteredCategories; track c.key) {
            <mat-option [value]="c.key">
              <span class="opt">
                <span class="opt-ic" [style.background]="c.color + '18'">
                  <mat-icon [style.color]="c.color">{{ c.icon }}</mat-icon>
                </span>
                <span class="opt-txt">{{ c.label }}</span>
              </span>
            </mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Libellé</mat-label>
        <input matInput [(ngModel)]="label" placeholder="Ex: Courses" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w">
        <mat-label>Montant</mat-label>
        <input matInput type="number" [(ngModel)]="amount" />
      </mat-form-field>
    </div>

    <div class="actions">
      <button mat-stroked-button (click)="close()">Annuler</button>
      <button mat-flat-button class="primary" (click)="submit()">
      <!-- <button mat-flat-button class="primary" (click)="submit()" [disabled]="!canSubmit()"> -->
        Ajouter
      </button>
    </div>
  </div>
  `,
  styles: [`
    .dlg{ padding: 14px; width:min(420px, 92vw); }
    .dlg-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .title{ font-weight:800; font-size:18px; }
    .seg{ width:100%; margin: 2px 0 12px; border-radius: 14px; overflow:hidden; }
    .form{ display:grid; gap:10px; }
    .w{ width:100%; }
    .actions{ display:flex; justify-content:flex-end; gap:10px; margin-top: 14px; }
    .primary{ border-radius: 12px; }

    .opt{ display:flex; align-items:center; gap:10px; }
    .opt-ic{
      width: 34px; height: 34px; border-radius: 12px;
      display:flex; align-items:center; justify-content:center;
    }
    .opt-txt{ font-weight:600; }
  `]
})
export class AddLineDialogComponent {
  typeValue: 'income' | 'expense' = 'expense';

  label = '';
  amount: number = 0;

  categoryKey: string | null = null;
  filteredCategories: MockCategory[] = [];

  private selectedCategory: MockCategory | null = null;

  constructor(
    private ref: MatDialogRef<AddLineDialogComponent, AddLineDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data?.presetType) this.typeValue = data.presetType;
    this.onTypeChange();
  }

  onTypeChange() {
    this.filteredCategories = MOCK_CATEGORIES.filter(c => c.type === this.typeValue);
    // default selection
    if (!this.categoryKey || !this.filteredCategories.some(c => c.key === this.categoryKey)) {
      this.categoryKey = this.filteredCategories[0]?.key ?? null;
      this.onCategoryChange();
    }
  }

  onCategoryChange() {
    this.selectedCategory = MOCK_CATEGORIES.find(c => c.key === this.categoryKey) ?? null;
    // pré-remplir libellé si vide
    if (this.selectedCategory && !this.label.trim()) {
      this.label = this.selectedCategory.label;
    }
  }

  canSubmit() {
    return !!this.selectedCategory && (this.label?.trim()?.length ?? 0) > 0;
  }

  close() {
    this.ref.close();
  }

  submit() {
    if (!this.selectedCategory) return;

    this.ref.close({
      type: this.typeValue,
      category: this.selectedCategory.label,
      label: this.label.trim(),
      amount: Number(this.amount) || 0,
      icon: this.selectedCategory.icon,
      color: this.selectedCategory.color,
    });
  }
}