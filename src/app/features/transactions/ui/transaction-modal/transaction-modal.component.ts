import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CategoriesProvider } from '../../../categories/data-access/categories.provider';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.scss'],
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatSelectModule, CommonModule]
})
export class TransactionModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly categories$  = inject(CategoriesProvider).categories$;
  transaction = input<any>();

  close = output<void>();
  save = output<any>();

  form!: FormGroup;


  constructor() {



    this.form = this.fb.group({
      id: [null],
      type: ['income', Validators.required],
      categoryId: ['', Validators.required],
      icon: ['💼', Validators.required],
      description: [''],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]]
    });
    effect(() => {
      const t = this.transaction();
      if (t) {
        this.form.patchValue(t);
      } else {
        this.form.reset({
          id: null,
          type: 'income',
          category: '',
          icon: '💼',
          description: '',
          date: new Date().toISOString().substring(0, 10),
          amount: 0
        });
      }
    });

  }


  ngOnInit() {
    // Réagit aux changements de l'input transaction
    console.log('transaction()', this.transaction());

  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }
}
