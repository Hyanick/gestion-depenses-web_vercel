import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IconPickerComponent } from '../../../../shared/icon-picker/icon-picker.component';
import { ICONS_LIST } from '../../../../shared/icons-list';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, CommonModule, MatButtonModule, MatIconModule, IconPickerComponent]
})
export class CategoryFormComponent {
  private readonly fb = inject(FormBuilder);
  form = this.fb.group({
    id: [null],
    name: ['', Validators.required],
    icon: ['💼', Validators.required],
    type: ['income', Validators.required],
    color: ['#1976d2', Validators.required]
  });

  iconsList = ICONS_LIST; // ou MATERIAL_ICONS_LIST
  selectedIcon = this.form.get('icon')?.value ;

  constructor(
    private dialogRef: MatDialogRef<CategoryFormComponent>,
    //@Inject(MAT_DIALOG_DATA) public data: Category | null
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.form.patchValue(data);
    }
  }

  save() {
    if (this.form.valid) {

      console.log('this.form.value', this.form.value);

      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }

  isEmoji(icon: string): boolean {
    // Simple check: emoji = non-alphanumérique
    return /[^\w\s]/.test(icon);
  }

  onIconSelect(icon: string) {
    this.form.patchValue({ icon });
  }
}
