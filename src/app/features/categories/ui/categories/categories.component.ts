import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '../../data-access/categories.models';
import { CategoriesProvider } from '../../data-access/categories.provider';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  imports: [CommonModule, MatIconModule, MatButtonModule]
})
export class CategoriesComponent implements OnInit {
  private readonly provider = inject(CategoriesProvider);
  private readonly dialog = inject(MatDialog);

  categories$ = this.provider.categories$;
  loading$ = this.provider.loading$;

  ngOnInit() {
    this.provider.load();
  }

  openForm(category?: Category) {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      data: category ? { ...category } : null,
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('result--->', result);

        if (result.id) {
          this.provider.update(result);
        } else {
          this.provider.add(result);
        }
      }
    });
  }

  deleteCategory(id: number) {
    if (confirm('Supprimer cette catégorie ?')) {
      this.provider.delete(id);
    }
  }
}
