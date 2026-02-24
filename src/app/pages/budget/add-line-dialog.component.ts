import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { MOCK_CATEGORIES, MockCategory } from '../../shared/mock-categories';

export type BudgetLineLike = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  label: string;
  amount: number;
  icon: string;
  color: string;
};

export type TxnSheetMode = 'create' | 'edit';

export type TxnSheetData = {
  mode: TxnSheetMode;
  presetType?: 'income' | 'expense';
  initial?: Partial<BudgetLineLike>;
};

export type TxnSheetResult =
  | { action: 'create'; payload: Omit<BudgetLineLike, 'id'> }
  | { action: 'update'; id: string; patch: Partial<BudgetLineLike> }
  | { action: 'delete'; id: string }
  | { action: 'cancel' };

@Component({
  selector: 'app-txn-sheet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
  <div class="sheet">

    <div class="sheet__handle"></div>

    <div class="sheet__header">
      <div class="sheet__title">{{ mode === 'edit' ? 'Modifier' : 'Ajouter' }}</div>
      <button mat-icon-button class="sheet__close" (click)="cancel()" aria-label="Fermer">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- iOS segmented control -->
    <div class="seg">
      <button
        type="button"
        class="seg__btn"
        [class.is-active]="typeValue === 'expense'"
        [disabled]="typeLocked"
        (click)="setType('expense')">
        <span class="seg__check" aria-hidden="true">✓</span>
        Dépense
      </button>

      <button
        type="button"
        class="seg__btn"
        [class.is-active]="typeValue === 'income'"
        [disabled]="typeLocked"
        (click)="setType('income')">
        <span class="seg__check" aria-hidden="true">✓</span>
        Revenu
      </button>
    </div>

    <div class="sheet__form">

      <!-- Catégorie -->
      <div class="field">
        <div class="field__label">Catégorie</div>

        <mat-form-field appearance="outline" class="w ios-field">
          <mat-select [(ngModel)]="categoryKey" (selectionChange)="onCategoryChange()">
            <mat-select-trigger>
              @if (selectedCategory) {
                <span class="opt">
                  <span class="opt__ic" [style.background]="selectedCategory.color + '18'">
                    <mat-icon [style.color]="selectedCategory.color">{{ selectedCategory.icon }}</mat-icon>
                  </span>
                  <span class="opt__txt">{{ selectedCategory.label }}</span>
                </span>
              } @else {
                <span class="muted">Sélectionner…</span>
              }
            </mat-select-trigger>

            @for (c of filteredCategories; track c.key) {
              <mat-option [value]="c.key">
                <span class="opt">
                  <span class="opt__ic" [style.background]="c.color + '18'">
                    <mat-icon [style.color]="c.color">{{ c.icon }}</mat-icon>
                  </span>
                  <span class="opt__txt">{{ c.label }}</span>
                </span>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Libellé -->
      <div class="field">
        <div class="field__label">Libellé</div>

        <mat-form-field appearance="outline" class="w ios-field">
          <input matInput [(ngModel)]="label" placeholder="Ex: Courses Carrefour" />
        </mat-form-field>
      </div>

      <!-- Montant -->
      <div class="field">
        <div class="field__label">Montant</div>

        <mat-form-field appearance="outline" class="w ios-field">
          <input matInput type="number" [(ngModel)]="amount" />
        </mat-form-field>
      </div>

    </div>

    <!-- Footer like screenshot -->
    <div class="sheet__footer">
      <button type="button" class="btn btn--ghost" (click)="cancel()">Annuler</button>

      <button
        type="button"
        class="btn btn--primary"
        (click)="submit()"
        [disabled]="!canSubmit()">
        {{ mode === 'edit' ? 'Enregistrer' : 'Ajouter' }}
      </button>

      @if (mode === 'edit') {
        <button type="button" class="btn btn--danger" (click)="deleteTxn()">Supprimer</button>
      }
    </div>

  </div>
  `,
  styles: [`
    .sheet{
      display:flex;
      flex-direction:column;
      padding: 14px 16px 16px;
      gap: 12px;
      max-height: 78vh;           /* ✅ moins haute */
    }

    .sheet__handle{
      width: 46px; height: 5px; border-radius: 999px;
      background: rgba(15,23,42,.18);
      margin: 6px auto 2px;
    }

    .sheet__header{ display:flex; align-items:center; justify-content:space-between; }
    .sheet__title{ font-size: 22px; font-weight: 900; letter-spacing: .2px; }
    .sheet__close{ border-radius: 999px; background: rgba(15,23,42,.08); }

    /* iOS segmented */
    .seg{
      display:flex;
      border-radius: 18px;
      padding: 4px;
      background: rgba(15,23,42,.06);
      gap: 4px;
    }
    .seg__btn{
      flex:1;
      border: none;
      border-radius: 14px;
      padding: 10px 12px;
      font-weight: 900;
      background: transparent;
      display:flex;
      align-items:center;
      justify-content:center;
      gap: 8px;
      color: rgba(15,23,42,.72);
      cursor:pointer;
    }
    .seg__btn:disabled{ opacity: .55; cursor: not-allowed; }
    .seg__btn .seg__check{ opacity: 0; transform: translateY(-1px); }
    .seg__btn.is-active{
      background: #fff;
      box-shadow: 0 10px 24px rgba(15,23,42,.10);
      color: rgba(15,23,42,.92);
    }
    .seg__btn.is-active .seg__check{ opacity: 1; }

    .sheet__form{ display:grid; gap: 12px; padding-top: 2px; }
    .field__label{
      font-size: 12px;
      font-weight: 900;
      color: rgba(15,23,42,.55);
      margin: 2px 0 6px;
    }
    .w{ width: 100%; }

    /* option row */
    .opt{ display:flex; align-items:center; gap:10px; }
    .opt__ic{
      width: 34px; height: 34px;
      border-radius: 12px;
      display:flex; align-items:center; justify-content:center;
    }
    .opt__txt{ font-weight: 900; }
    .muted{ color: rgba(15,23,42,.55); }

    /* Make Material fields look more iOS */
    .ios-field ::ng-deep .mdc-notched-outline__leading,
    .ios-field ::ng-deep .mdc-notched-outline__trailing{
      border-color: rgba(15,23,42,.14) !important;
    }
    .ios-field ::ng-deep .mdc-notched-outline__notch{
      border-color: rgba(15,23,42,.14) !important;
    }
    .ios-field ::ng-deep .mat-mdc-form-field-infix{
      padding-top: 12px !important;
      padding-bottom: 12px !important;
    }
    .ios-field ::ng-deep input.mat-mdc-input-element{
      font-weight: 900;
    }

    /* Footer buttons like screenshot */
    .sheet__footer{
      margin-top: 6px;
      display:flex;
      flex-direction:column;
      gap: 10px;
    }

    .btn{
      width: 100%;
      height: 48px;
      border-radius: 999px;
      border: none;
      font-weight: 900;
      letter-spacing: .2px;
      cursor: pointer;
    }
    .btn:disabled{
      opacity: .55;
      cursor: not-allowed;
    }

    .btn--ghost{
      background: rgba(15,23,42,.06);
      color: rgba(15,23,42,.80);
    }

    .btn--primary{
      background: #111827;
      color: #fff;
    }

    .btn--danger{
      background: rgba(239,68,68,.10);
      color: #ef4444;
      height: 44px;
      border-radius: 16px;
    }
  `]
})
export class TxnSheetComponent {
  mode: TxnSheetMode;
  typeLocked = false;

  typeValue: 'income' | 'expense' = 'expense';
  label = '';
  amount: number = 0;

  categoryKey: string | null = null;
  filteredCategories: MockCategory[] = [];
  selectedCategory: MockCategory | null = null;

  private editingId: string | null = null;

  constructor(
    private ref: MatDialogRef<TxnSheetComponent, TxnSheetResult>,
    @Inject(MAT_DIALOG_DATA) public data: TxnSheetData
  ) {
    this.mode = data.mode;

    if (data.mode === 'edit' && data.initial?.id) {
      this.editingId = data.initial.id;
      this.typeValue = data.initial.type ?? 'expense';
      this.label = data.initial.label ?? '';
      this.amount = Number(data.initial.amount ?? 0);
      const found = MOCK_CATEGORIES.find(c => c.label === data.initial?.category);
      this.categoryKey = found?.key ?? null;
    } else if (data.presetType) {
      this.typeValue = data.presetType;
      this.typeLocked = true;
    }

    this.onTypeChange();
    if (!this.categoryKey) this.categoryKey = this.filteredCategories[0]?.key ?? null;
    this.onCategoryChange();
  }

  setType(v: 'income' | 'expense') {
    if (this.typeLocked) return;
    this.typeValue = v;
    this.onTypeChange();
  }

  onTypeChange() {
    this.filteredCategories = MOCK_CATEGORIES.filter(c => c.type === this.typeValue);
    if (!this.categoryKey || !this.filteredCategories.some(c => c.key === this.categoryKey)) {
      this.categoryKey = this.filteredCategories[0]?.key ?? null;
    }
    this.onCategoryChange();
  }

  onCategoryChange() {
    this.selectedCategory = MOCK_CATEGORIES.find(c => c.key === this.categoryKey) ?? null;
    if (this.mode === 'create' && this.selectedCategory && !this.label.trim()) {
      this.label = this.selectedCategory.label;
    }
  }

  canSubmit() {
    return !!this.selectedCategory && (this.label?.trim()?.length ?? 0) > 0;
  }

  cancel() {
    this.ref.close({ action: 'cancel' });
  }

  deleteTxn() {
    if (!this.editingId) return;
    this.ref.close({ action: 'delete', id: this.editingId });
  }

  submit() {
    if (!this.selectedCategory) return;

    if (this.mode === 'create') {
      this.ref.close({
        action: 'create',
        payload: {
          type: this.typeValue,
          category: this.selectedCategory.label,
          label: this.label.trim(),
          amount: Number(this.amount) || 0,
          icon: this.selectedCategory.icon,
          color: this.selectedCategory.color,
        },
      });
      return;
    }

    const id = this.editingId!;
    const patch: Partial<BudgetLineLike> = {
      type: this.typeValue,
      category: this.selectedCategory.label,
      label: this.label.trim(),
      amount: Number(this.amount) || 0,
      icon: this.selectedCategory.icon,
      color: this.selectedCategory.color,
    };

    this.ref.close({ action: 'update', id, patch });
  }
}