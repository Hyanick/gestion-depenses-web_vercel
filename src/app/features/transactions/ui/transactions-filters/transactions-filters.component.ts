import { Component, input, output, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Category } from '../../../categories/data-access/categories.models';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

// Type pour la valeur des filtres
export type TransactionsFiltersValue = {
  month: string; // 'YYYY-MM'
  categoryId: number | null;
};

@Component({
  selector: 'app-transactions-filters',
  templateUrl: './transactions-filters.component.html',
  styleUrls: ['./transactions-filters.component.scss'],
  imports: [MatSelectModule, MatFormFieldModule, ReactiveFormsModule, CommonModule, MatButtonModule, MatInputModule]
})
export class TransactionsFiltersComponent implements OnInit {
  // Liste des catégories à afficher dans le select (injectée par le parent)
  categories = input<Category[]>([]);

  // Output pour signaler l'ouverture de la modale d'ajout
  add = output<void>();

  // Output pour signaler un changement de filtre
  filtersChange = output<TransactionsFiltersValue>();

  // FormBuilder Angular pour gérer le formulaire réactif
  private readonly fb = inject(FormBuilder);

  // Formulaire des filtres (mois et catégorie)
  form = this.fb.group({
    month: new Date().toISOString().slice(0, 7), // Mois courant 'YYYY-MM'
    categoryId: null as number | null,           // null = toutes catégories
  });

  ngOnInit(): void {
    // À chaque changement de valeur du formulaire, on émet la nouvelle valeur
    this.form.valueChanges.subscribe((v) => {
      this.filtersChange.emit({
        month: v.month ?? new Date().toISOString().slice(0, 7),
        categoryId: (v.categoryId ?? null) as number | null,
      });
    });

    // On émet la valeur initiale au premier rendu
    this.filtersChange.emit({
      month: this.form.value.month!,
      categoryId: this.form.value.categoryId!,
    });
  }
}
