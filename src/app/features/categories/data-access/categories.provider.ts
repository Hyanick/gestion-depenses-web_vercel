import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Category } from './categories.models';
import { Observable } from 'rxjs';
import { CategoriesState } from './categories.state';
import { LoadCategories, AddCategory, UpdateCategory, DeleteCategory } from './categories.actions';

@Injectable({ providedIn: 'root' })
export class CategoriesProvider {
  categories$: Observable<Category[]>;
  loading$: Observable<boolean>;

  constructor(private store: Store) {
    this.categories$ = this.store.select(CategoriesState.categories);
    this.loading$ = this.store.select(CategoriesState.loading);
  }

  load() {
    this.store.dispatch(new LoadCategories());
  }

  add(category: Omit<Category, 'id'>) {
    this.store.dispatch(new AddCategory(category));
  }

  update(category: Category) {
    this.store.dispatch(new UpdateCategory(category));
  }

  delete(id: number) {
    this.store.dispatch(new DeleteCategory(id));
  }
}
